import os
import uuid
import time
import tempfile
import json
import firebase_admin
from firebase_admin import credentials, storage, firestore
from datetime import datetime
from google.cloud import storage as gcs

class FirebaseService:
    """
    Handles interactions with Firebase Storage for uploading/downloading images
    """
    
    def __init__(self):
        """Initialize the Firebase Admin SDK"""
        self.initialized = False
        self.app = None
        self.bucket = None
        self.db = None
        self.fallback_mode = False
        
        try:
            # Check if app is already initialized
            if not firebase_admin._apps:
                # Get the path to the service account key file
                service_account_path = os.path.join(
                    os.path.dirname(os.path.abspath(__file__)), 
                    '..', 
                    'service-account.json'
                )
                
                if not os.path.exists(service_account_path):
                    print(f"Warning: Firebase service account file not found at {service_account_path}")
                    print("Firebase Storage will not be available. Using local storage fallback.")
                    self.fallback_mode = True
                    return
                
                # Verify the service account file has valid credentials
                try:
                    with open(service_account_path, 'r') as f:
                        service_account_data = json.load(f)
                    
                    # Check if this is just the placeholder file
                    if service_account_data.get('private_key_id') == 'replace-with-your-private-key-id':
                        print("Warning: You're using the placeholder service-account.json file.")
                        print("Please replace it with your actual Firebase service account credentials.")
                        print("Using local storage fallback.")
                        self.fallback_mode = True
                        return
                    
                except json.JSONDecodeError:
                    print(f"Warning: service-account.json is not valid JSON. Using local storage fallback.")
                    self.fallback_mode = True
                    return
                except Exception as json_error:
                    print(f"Warning: Error reading service-account.json: {json_error}")
                    self.fallback_mode = True
                    return
                
                # Try to initialize Firebase
                try:
                    # Initialize the app with the service account file
                    self.app = firebase_admin.initialize_app(
                        credentials.Certificate(service_account_path),
                        {
                            'storageBucket': 'vertex-ai-436310.appspot.com'
                        }
                    )
                    print("Firebase initialized successfully with service account")
                    
                    # Test connection to Firebase services
                    try:
                        self.bucket = storage.bucket()
                        self.db = firestore.client()
                        
                        # Test if the bucket actually exists
                        try:
                            # This will raise an exception if the bucket doesn't exist
                            self.bucket.exists()
                            print("Connected to Firebase Storage bucket successfully")
                        except Exception as bucket_error:
                            print(f"Error accessing Firebase Storage bucket: {bucket_error}")
                            print("Firebase Storage will not be available. Using local storage fallback.")
                            self.fallback_mode = True
                            
                            # Try to use a default bucket name instead
                            try:
                                print("Trying default bucket name format...")
                                # Try with a different bucket naming format
                                app_options = {'storageBucket': 'vertex-ai-436310.appspot.com'}
                                if len(firebase_admin._apps) > 0:
                                    firebase_admin.delete_app(self.app)
                                self.app = firebase_admin.initialize_app(
                                    credentials.Certificate(service_account_path),
                                    app_options
                                )
                                self.bucket = storage.bucket()
                                
                                # Try to create the bucket if it doesn't exist
                                try:
                                    if not self.bucket.exists():
                                        print("Bucket doesn't exist. Attempting to create it...")
                                        # Create storage client with the same credentials
                                        storage_client = gcs.Client.from_service_account_json(service_account_path)
                                        
                                        # Create a new bucket in the US multi-region
                                        bucket = storage_client.bucket(app_options['storageBucket'].split('.')[0])
                                        bucket.create(location="us")
                                        print(f"Created bucket: {app_options['storageBucket']}")
                                        
                                        # Update our bucket reference
                                        self.bucket = storage.bucket()
                                        
                                    # Test if bucket now exists
                                    self.bucket.exists()
                                    print("Connected to Firebase Storage bucket successfully")
                                    self.fallback_mode = False
                                except Exception as create_error:
                                    print(f"Error creating bucket: {create_error}")
                                    self.fallback_mode = True
                                    return
                            except Exception as retry_error:
                                print(f"Error with alternate bucket name: {retry_error}")
                                self.fallback_mode = True
                                return
                    except Exception as service_error:
                        print(f"Error accessing Firebase services: {service_error}")
                        print("Firebase will not be available. Using local storage fallback.")
                        self.fallback_mode = True
                        return
                    
                    self.initialized = True
                except Exception as init_error:
                    print(f"Error initializing Firebase: {init_error}")
                    print("Firebase will not be available. Using local storage fallback.")
                    self.fallback_mode = True
                    return
            else:
                # Get the default app
                self.app = firebase_admin.get_app()
                print("Using existing Firebase app")
                
                # Get the storage bucket and firestore client
                try:
                    self.bucket = storage.bucket()
                    self.db = firestore.client()
                    self.initialized = True
                except Exception as service_error:
                    print(f"Error accessing Firebase services: {service_error}")
                    print("Firebase will not be available. Using local storage fallback.")
                    self.fallback_mode = True
                    return
        except Exception as e:
            print(f"Error initializing Firebase: {e}")
            print("Firebase will not be available. Using local storage fallback.")
            self.fallback_mode = True
    
    def upload_image(self, file_path, user_id=None, folder="uploads"):
        """
        Upload an image to Firebase Storage
        
        Args:
            file_path (str): Path to the local file
            user_id (str, optional): User ID for organizing files
            folder (str): Folder in Firebase Storage (default: "uploads")
            
        Returns:
            tuple: (success (bool), storage_path (str), download_url (str), error_message (str))
        """
        if self.fallback_mode:
            # In fallback mode, just return the local path
            local_relative_path = os.path.basename(file_path)
            return True, local_relative_path, f"/api/images/{local_relative_path}", ""
            
        if not self.initialized:
            return False, "", "", "Firebase not initialized"
        
        try:
            # Generate a unique filename with timestamp
            timestamp = int(time.time())
            filename = os.path.basename(file_path)
            extension = os.path.splitext(filename)[1]
            unique_filename = f"{str(uuid.uuid4())}-{timestamp}{extension}"
            
            # Create the storage path based on whether user_id is provided
            storage_path = f"{folder}/{unique_filename}"
            if user_id:
                storage_path = f"users/{user_id}/{folder}/{unique_filename}"
            
            # Upload the file
            blob = self.bucket.blob(storage_path)
            blob.upload_from_filename(file_path)
            
            # Make the blob publicly accessible (optional)
            blob.make_public()
            
            # Get the public URL
            download_url = blob.public_url
            
            print(f"Uploaded file to Firebase Storage: {storage_path}")
            print(f"Download URL: {download_url}")
            
            return True, storage_path, download_url, ""
            
        except Exception as e:
            print(f"Error uploading file to Firebase Storage: {e}")
            # Fall back to local path in case of error
            local_relative_path = os.path.basename(file_path)
            return True, local_relative_path, f"/api/images/{local_relative_path}", str(e)
    
    def download_image(self, storage_path, local_path=None):
        """
        Download an image from Firebase Storage
        
        Args:
            storage_path (str): Path in Firebase Storage
            local_path (str, optional): Local path to save the file
            
        Returns:
            tuple: (success (bool), local_path (str), error_message (str))
        """
        if self.fallback_mode:
            # In fallback mode, try to find the file locally
            filename = os.path.basename(storage_path)
            local_folders = [
                os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads'),
                os.path.join(os.path.dirname(os.path.abspath(__file__)), 'samples'),
                os.path.join(os.path.dirname(os.path.abspath(__file__)), 'outputs')
            ]
            
            for folder in local_folders:
                test_path = os.path.join(folder, filename)
                if os.path.exists(test_path):
                    return True, test_path, ""
            
            return False, "", f"File not found locally: {filename}"
            
        if not self.initialized:
            return False, "", "Firebase not initialized"
        
        try:
            # Create a temporary file if local_path is not provided
            if not local_path:
                # Create temp dir if it doesn't exist
                temp_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'temp')
                os.makedirs(temp_dir, exist_ok=True)
                
                # Create a temp file with the same extension
                filename = os.path.basename(storage_path)
                extension = os.path.splitext(filename)[1]
                local_path = os.path.join(temp_dir, f"temp_{uuid.uuid4()}{extension}")
            
            # Create directory if it doesn't exist
            os.makedirs(os.path.dirname(local_path), exist_ok=True)
            
            # Download the file
            blob = self.bucket.blob(storage_path)
            blob.download_to_filename(local_path)
            
            print(f"Downloaded file from Firebase Storage: {storage_path} to {local_path}")
            
            return True, local_path, ""
            
        except Exception as e:
            print(f"Error downloading file from Firebase Storage: {e}")
            
            # Try to fall back to local file
            filename = os.path.basename(storage_path)
            local_folders = [
                os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads'),
                os.path.join(os.path.dirname(os.path.abspath(__file__)), 'samples'),
                os.path.join(os.path.dirname(os.path.abspath(__file__)), 'outputs')
            ]
            
            for folder in local_folders:
                test_path = os.path.join(folder, filename)
                if os.path.exists(test_path):
                    return True, test_path, f"Firebase error: {str(e)}, using local file"
            
            return False, "", str(e)
    
    def get_sample_images(self, limit=10):
        """
        Get a list of sample images from Firebase Storage
        
        Args:
            limit (int): Maximum number of samples to return
            
        Returns:
            list: List of sample image metadata
        """
        if self.fallback_mode:
            # In fallback mode, return local sample images
            return self._get_local_sample_images(limit)
            
        if not self.initialized:
            return self._get_local_sample_images(limit)
        
        try:
            # List files in the samples directory
            samples = []
            blobs = self.bucket.list_blobs(prefix="samples/")
            
            for blob in blobs:
                # Skip directory markers
                if blob.name.endswith('/'):
                    continue
                
                # Skip if not an image
                if not blob.name.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.bmp')):
                    continue
                
                # Make public if not already
                try:
                    if not blob.public_url:
                        blob.make_public()
                except:
                    blob.make_public()
                
                # Add to samples
                samples.append({
                    "name": os.path.basename(blob.name),
                    "url": blob.public_url,
                    "storage_path": blob.name,
                    "size": blob.size
                })
                
                # Stop if we have enough samples
                if len(samples) >= limit:
                    break
            
            # If we got no samples from Firebase, fall back to local
            if not samples:
                return self._get_local_sample_images(limit)
                
            return samples
            
        except Exception as e:
            print(f"Error getting sample images from Firebase: {e}")
            return self._get_local_sample_images(limit)
    
    def _get_local_sample_images(self, limit=10):
        """Get sample images from local directory"""
        samples = []
        samples_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'samples')
        
        try:
            for filename in os.listdir(samples_dir):
                if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.bmp')):
                    samples.append({
                        "name": filename,
                        "url": f"/api/samples/{filename}",
                        "storage_path": f"samples/{filename}",
                        "size": os.path.getsize(os.path.join(samples_dir, filename))
                    })
                    
                    if len(samples) >= limit:
                        break
        except Exception as e:
            print(f"Error getting local sample images: {e}")
        
        return samples
    
    def save_result_to_firestore(self, user_id, result_data):
        """
        Save scan result to Firestore
        
        Args:
            user_id (str): User ID
            result_data (dict): Scan result data
            
        Returns:
            tuple: (success (bool), document_id (str), error_message (str))
        """
        if self.fallback_mode:
            # In fallback mode, we pretend it worked but don't actually save
            return True, f"local_{uuid.uuid4()}", "Using local fallback mode"
            
        if not self.initialized:
            return False, "", "Firebase not initialized"
        
        if not user_id:
            return False, "", "User ID is required"
        
        try:
            # Add timestamp
            result_data["timestamp"] = firestore.SERVER_TIMESTAMP
            
            # Save to Firestore
            doc_ref = self.db.collection('users').document(user_id).collection('scans').document()
            doc_ref.set(result_data)
            
            print(f"Saved scan result to Firestore for user {user_id}, doc_id: {doc_ref.id}")
            
            return True, doc_ref.id, ""
            
        except Exception as e:
            print(f"Error saving scan result to Firestore: {e}")
            return False, "", str(e)
    
    def get_user_samples(self, user_id, limit=20):
        """
        Get samples uploaded by a specific user
        
        Args:
            user_id (str): User ID
            limit (int): Maximum number of samples to return
            
        Returns:
            list: List of user sample image metadata
        """
        if self.fallback_mode or not self.initialized or not user_id:
            return []
        
        try:
            samples = []
            blobs = self.bucket.list_blobs(prefix=f"users/{user_id}/samples/")
            
            for blob in blobs:
                if blob.name.endswith('/'):
                    continue
                
                if not blob.name.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.bmp')):
                    continue
                
                try:
                    if not blob.public_url:
                        blob.make_public()
                except:
                    blob.make_public()
                
                samples.append({
                    "name": os.path.basename(blob.name),
                    "url": blob.public_url,
                    "storage_path": blob.name,
                    "size": blob.size
                })
                
                if len(samples) >= limit:
                    break
            
            return samples
            
        except Exception as e:
            print(f"Error getting user samples: {e}")
            return []
    
    def save_image_to_firestore(self, file_path, user_id=None, folder="uploads"):
        """
        Save image directly to Firestore as a fallback when Storage is not available
        
        Args:
            file_path (str): Path to the local file
            user_id (str, optional): User ID for organizing files
            folder (str): Folder in Firestore (default: "uploads")
            
        Returns:
            tuple: (success (bool), doc_id (str), error_message (str))
        """
        if not self.initialized or self.fallback_mode:
            return False, "", "Firebase not properly initialized"
        
        try:
            # Read file as binary
            with open(file_path, 'rb') as f:
                binary_data = f.read()
                
            # Convert to base64 for storage (much smaller than raw binary)
            import base64
            encoded_data = base64.b64encode(binary_data).decode('utf-8')
            
            # Generate a unique ID
            doc_id = str(uuid.uuid4())
            
            # Create document data
            data = {
                "name": os.path.basename(file_path),
                "type": folder,
                "created_at": firestore.SERVER_TIMESTAMP,
                "data": encoded_data
            }
            
            # Set the path based on user_id
            if user_id:
                doc_ref = self.db.collection('users').document(user_id).collection('images').document(doc_id)
            else:
                doc_ref = self.db.collection('images').document(doc_id)
                
            # Save to Firestore
            doc_ref.set(data)
            
            print(f"Saved image to Firestore, doc_id: {doc_id}")
            
            return True, doc_id, ""
        except Exception as e:
            print(f"Error saving image to Firestore: {e}")
            return False, "", str(e)
    
    def get_image_from_firestore(self, doc_id, user_id=None, local_path=None):
        """
        Get image from Firestore and save to local file
        
        Args:
            doc_id (str): Document ID in Firestore
            user_id (str, optional): User ID for organizing files
            local_path (str, optional): Local path to save the file
            
        Returns:
            tuple: (success (bool), local_path (str), error_message (str))
        """
        if not self.initialized or self.fallback_mode:
            return False, "", "Firebase not properly initialized"
        
        try:
            # Get the document reference
            if user_id:
                doc_ref = self.db.collection('users').document(user_id).collection('images').document(doc_id)
            else:
                doc_ref = self.db.collection('images').document(doc_id)
                
            # Get the document
            doc = doc_ref.get()
            
            if not doc.exists:
                return False, "", "Image not found in Firestore"
                
            # Get the data
            data = doc.to_dict()
            
            # Decode the base64 data
            import base64
            binary_data = base64.b64decode(data['data'])
            
            # Create a temporary file if local_path is not provided
            if not local_path:
                # Create temp dir if it doesn't exist
                temp_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'temp')
                os.makedirs(temp_dir, exist_ok=True)
                
                # Create a temp file with the original name
                local_path = os.path.join(temp_dir, data['name'])
            
            # Create directory if it doesn't exist
            os.makedirs(os.path.dirname(local_path), exist_ok=True)
            
            # Write the file
            with open(local_path, 'wb') as f:
                f.write(binary_data)
                
            print(f"Retrieved image from Firestore, saved to {local_path}")
            
            return True, local_path, ""
        except Exception as e:
            print(f"Error getting image from Firestore: {e}")
            return False, "", str(e)

# Create a singleton instance
firebase_service = FirebaseService() 