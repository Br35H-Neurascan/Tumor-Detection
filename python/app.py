from flask import Flask, request, jsonify
import os
import cv2
import tempfile
import base64
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, storage, firestore
import uuid
import json
from PIL import Image
import io
import sys
import numpy as np
import torch
from torchvision.transforms import functional as F
from torchvision.models.detection import maskrcnn_resnet50_fpn
import urllib.parse

# Add the current directory to the path to ensure module imports work
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Try to import the MaskRCNN module
try:
    from test_maskrcnn import load_model, analyze_image
    maskrcnn_import_successful = True
    print("Successfully imported test_maskrcnn module")
except ImportError as e:
    print(f"Warning: Could not import test_maskrcnn module: {e}")
    maskrcnn_import_successful = False

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Firebase
cred_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'service-account.json')
try:
    cred = credentials.Certificate(cred_path)
    # Check if app is already initialized
    try:
        firebase_admin.get_app()
    except ValueError:
        firebase_admin.initialize_app(cred, {
            'storageBucket': 'vertex-ai-436310.firebasestorage.app'  # Firebase storage bucket
        })
    db = firestore.client()
    bucket = storage.bucket()
    print("Firebase initialized successfully!")
except Exception as e:
    print(f"Firebase initialization error: {e}")
    # Continue without Firebase if there's an error
    db = None
    bucket = None

# Fallback function to load model directly if test_maskrcnn import fails
def fallback_load_model(model_path=None):
    """
    Fallback function to load the tumor detection model
    """
    if model_path is None:
        model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 
                              'model', 'maskrcnn_tumor.pth')
    
    model = maskrcnn_resnet50_fpn(num_classes=2)  # 1 class (tumor) + background
    
    try:
        model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')))
        model.eval()  # Set the model to evaluation mode
        print(f"Model loaded successfully from {model_path}")
        return model
    except Exception as e:
        print(f"Error loading model: {e}")
        return None

# Fallback function for image analysis if test_maskrcnn import fails
def fallback_analyze_image(model, image_path):
    """
    Fallback function to analyze an image with the model
    """
    # Load and preprocess the image
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError("Failed to load image")
        
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image_tensor = F.to_tensor(image_rgb)
    image_tensor = image_tensor.unsqueeze(0)  # Add batch dimension

    # Make predictions
    with torch.no_grad():
        predictions = model(image_tensor)

    # Get the prediction
    pred = predictions[0]

    # Initialize results
    results = {
        'hasTumor': False,
        'confidence': 0.0,
        'tumorSize': 'N/A',
        'tumorType': 'Unknown',
        'tumorLocation': 'N/A'
    }
    
    # Convert image back to BGR for OpenCV operations
    output_image = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2BGR)

    # Extract predictions
    boxes = pred['boxes'].cpu().numpy()
    scores = pred['scores'].cpu().numpy()
    conf_thresh = 0.7
    valid = scores > conf_thresh

    if np.any(valid):
        best_idx = np.argmax(scores[valid])
        best_box = boxes[valid][best_idx].astype(int)
        box_color = (153, 159, 250)  # Light purple
        cv2.rectangle(output_image, (best_box[0], best_box[1]), (best_box[2], best_box[3]), box_color, 2)
        
        # Calculate tumor size
        width_px = best_box[2] - best_box[0]
        height_px = best_box[3] - best_box[1]
        size_px = max(width_px, height_px)
        size_cm = (size_px / 100.0) * 2.5  # Approximate conversion
        
        # Simple tumor type classification
        if size_cm < 2.0:
            tumor_type = "Meningioma"
        elif size_cm < 3.0:
            tumor_type = "Glioma"
        else:
            tumor_type = "Pituitary"
            
        confidence = float(scores[valid][best_idx])
        
        # Update results
        results = {
            'hasTumor': True,
            'confidence': confidence,
            'tumorSize': f"{size_cm:.1f} cm",
            'tumorType': tumor_type,
            'tumorLocation': 'Frontal Lobe',
        }

    return results, output_image

# Load the model using the appropriate function
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'model', 'maskrcnn_tumor.pth')
if maskrcnn_import_successful:
    model = load_model(MODEL_PATH)
    analyze_func = analyze_image
    print("Using imported analyze_image function")
else:
    model = fallback_load_model(MODEL_PATH)
    analyze_func = fallback_analyze_image
    print("Using fallback analyze_image function")

def process_image(image_path):
    """Process the image with the MaskRCNN model and return the results"""
    # Use the appropriate analysis function
    result, processed_image = analyze_func(model, image_path)
    
    # Save the processed image
    output_path = image_path.replace('.', '_processed.')
    cv2.imwrite(output_path, processed_image)
    
    return result, output_path

def ensure_file_extension(filename):
    """Ensure the filename has a valid image extension"""
    valid_extensions = ['.jpg', '.jpeg', '.png', '.bmp', '.tif', '.tiff']
    
    # Check if file already has a valid extension
    if any(filename.lower().endswith(ext) for ext in valid_extensions):
        return filename
    
    # If not, add .jpg as default extension
    return filename + '.jpg'

@app.route('/api/analyze', methods=['POST'])
def analyze_image_api():
    print("\n===== STARTING BRAIN TUMOR DETECTION =====")
    if 'image' not in request.files:
        print("ERROR: No image provided in request")
        return jsonify({'error': 'No image provided'}), 400
        
    file = request.files['image']
    if file.filename == '':
        print("ERROR: Empty filename")
        return jsonify({'error': 'No image selected'}), 400
    
    print(f"Image received: {file.filename}")
    
    # Ensure filename has a valid extension
    safe_filename = ensure_file_extension(file.filename)
    print(f"Using filename with extension: {safe_filename}")
    
    # Save the uploaded file temporarily
    temp_dir = tempfile.mkdtemp()
    temp_file_path = os.path.join(temp_dir, safe_filename)
    file.save(temp_file_path)
    print(f"Saved to temporary file: {temp_file_path}")
    
    try:
        # Process the image
        print("\n[STARTING AI ANALYSIS]")
        print("Loading image into model...")
        result, processed_image_path = process_image(temp_file_path)
        
        print("\n[DETECTION RESULTS]")
        print(f"Tumor detected: {result['hasTumor']}")
        if result['hasTumor']:
            print(f"Confidence: {result['confidence']}")
            print(f"Tumor type: {result['tumorType']}")
            print(f"Tumor size: {result['tumorSize']}")
            print(f"Tumor location: {result['tumorLocation']}")
        print(f"Processed image saved to: {processed_image_path}")
        
        # Generate unique ID for identification purposes only (not for auto-saving)
        image_id = str(uuid.uuid4())
        user_id = request.form.get('userId', 'anonymous')
        
        # Variables to store URLs if Firebase upload is successful
        original_url = None
        processed_url = None
        
        # Only attempt Firebase operations for file uploads if Firebase is initialized
        if bucket is not None:
            try:
                print("\n[UPLOADING TO FIREBASE]")
                # Create user-specific storage paths
                if user_id != 'anonymous':
                    # User is logged in, store under their ID
                    original_path = f"users/{user_id}/images/original/{image_id}.jpg"
                    processed_path = f"users/{user_id}/images/processed/{image_id}.jpg"
                else:
                    # Anonymous user, store in default location
                    original_path = f"images/original/{image_id}.jpg"
                    processed_path = f"images/processed/{image_id}.jpg"
                
                # Upload original image
                print(f"Uploading original image to path: {original_path}")
                original_blob = bucket.blob(original_path)
                original_blob.upload_from_filename(temp_file_path)
                # Make the blob publicly accessible
                original_blob.make_public()
                original_url = original_blob.public_url
                print(f"Original image URL: {original_url}")
                
                # Upload processed image
                print(f"Uploading processed image to path: {processed_path}")
                processed_blob = bucket.blob(processed_path)
                processed_blob.upload_from_filename(processed_image_path)
                # Make the blob publicly accessible
                processed_blob.make_public()
                processed_url = processed_blob.public_url
                print(f"Processed image URL: {processed_url}")
                
                # REMOVED: Auto-saving scan data to Firestore
                # Now scans will only be saved when user explicitly clicks "Save to Account"
                
            except Exception as firebase_error:
                print(f"Firebase storage error: {firebase_error}")
                # Continue without Firebase storage
        
        # Always read the processed image as base64 to return directly to client
        # This ensures the app works even without Firebase
        print("\n[PREPARING RESPONSE]")
        print("Converting processed image to base64...")
        with open(processed_image_path, "rb") as img_file:
            processed_image_b64 = base64.b64encode(img_file.read()).decode('utf-8')
        
        # Add data to result
        result['imageId'] = image_id
        if original_url:
            result['originalImageUrl'] = original_url
        if processed_url:
            result['processedImageUrl'] = processed_url
        # Always include the processed image data
        result['processedImageData'] = f"data:image/jpeg;base64,{processed_image_b64}"
        
        # Clean up temp files
        print("\n[CLEANUP]")
        os.remove(temp_file_path)
        os.remove(processed_image_path)
        os.rmdir(temp_dir)
        print("Temporary files cleaned up")
        
        print("\n===== BRAIN TUMOR DETECTION COMPLETE =====")
        return jsonify(result)
        
    except Exception as e:
        print(f"ERROR during image processing: {e}")
        # Clean up temp files in case of error
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        if os.path.exists(temp_dir):
            os.rmdir(temp_dir)
            
        return jsonify({'error': str(e)}), 500

@app.route('/api/sample-images/<sample_id>', methods=['GET'])
def get_sample_image(sample_id):
    # This route would serve sample images from a predefined set
    # For now, we'll return a simple message
    return jsonify({'message': f'Sample image {sample_id} would be returned here'})

@app.route('/api/scan-sample', methods=['POST'])
def scan_sample_image_api():
    """
    Endpoint to scan a sample image from a user's collection
    Required parameters:
    - userId: the user ID
    - sampleId: the sample image ID
    """
    print("\n===== STARTING SAMPLE IMAGE SCAN =====")
    
    user_id = request.form.get('userId')
    sample_id = request.form.get('sampleId')
    
    if not user_id or not sample_id:
        print("ERROR: Missing userId or sampleId parameter")
        return jsonify({'error': 'Missing required parameters'}), 400
        
    print(f"Scanning sample image: {sample_id} for user: {user_id}")
    
    # Only proceed if Firebase is initialized
    if bucket is None or db is None:
        return jsonify({'error': 'Firebase not available'}), 500
        
    try:
        # Get the sample image metadata from Firestore
        sample_ref = db.collection('users').document(user_id).collection('samples').document(sample_id)
        sample_doc = sample_ref.get()
        
        if not sample_doc.exists:
            print(f"ERROR: Sample {sample_id} not found for user {user_id}")
            return jsonify({'error': 'Sample not found'}), 404
            
        sample_data = sample_doc.to_dict()
        
        # Get the image URL from the sample data
        image_url = sample_data.get('imageUrl')
        if not image_url:
            return jsonify({'error': 'Sample has no image URL'}), 400
            
        print(f"Sample image URL: {image_url}")
        
        # Get the storage path
        storage_path = sample_data.get('storagePath')
        if not storage_path:
            print("WARNING: No storage path in sample data, extracting from URL")
            # Try to extract path from URL if not available
            url_parts = image_url.split('?')[0].split('/')
            storage_path = '/'.join(url_parts[url_parts.index('o')+1:]) if 'o' in url_parts else None
            
            # URL-decode the storage path (convert %2F to / etc.)
            if storage_path:
                storage_path = urllib.parse.unquote(storage_path)
                print(f"Decoded storage path: {storage_path}")
            
        if not storage_path:
            return jsonify({'error': 'Cannot determine sample storage path'}), 400
            
        print(f"Sample storage path: {storage_path}")
        
        # Download the sample image to a temporary file
        temp_dir = tempfile.mkdtemp()
        filename = os.path.basename(storage_path)
        temp_file_path = os.path.join(temp_dir, filename)
        
        # Ensure the filename has an extension
        if not any(temp_file_path.lower().endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.bmp']):
            temp_file_path += '.jpg'
            
        print(f"Downloading sample to: {temp_file_path}")
        
        # Download the file from storage
        blob = bucket.blob(storage_path)
        blob.download_to_filename(temp_file_path)
        
        # Process the image
        print("\n[STARTING AI ANALYSIS]")
        print("Loading image into model...")
        result, processed_image_path = process_image(temp_file_path)
        
        print("\n[DETECTION RESULTS]")
        print(f"Tumor detected: {result['hasTumor']}")
        if result['hasTumor']:
            print(f"Confidence: {result['confidence']}")
            print(f"Tumor type: {result['tumorType']}")
            print(f"Tumor size: {result['tumorSize']}")
            print(f"Tumor location: {result['tumorLocation']}")
        print(f"Processed image saved to: {processed_image_path}")
        
        # Generate unique ID for this scan
        scan_id = str(uuid.uuid4())
        
        # Upload processed image to Firebase Storage
        processed_path = f"users/{user_id}/images/processed/{scan_id}.jpg"
        print(f"Uploading processed image to path: {processed_path}")
        processed_blob = bucket.blob(processed_path)
        processed_blob.upload_from_filename(processed_image_path)
        processed_blob.make_public()
        processed_url = processed_blob.public_url
        
        # REMOVED: Auto-saving scan data to Firestore for sample scans
        # Now sample scans will only be saved when user explicitly clicks "Save to Account"
        # This makes behavior consistent with regular scans
        
        # Read processed image as base64
        print("\n[PREPARING RESPONSE]")
        print("Converting processed image to base64...")
        with open(processed_image_path, "rb") as img_file:
            processed_image_b64 = base64.b64encode(img_file.read()).decode('utf-8')
        
        # Add data to result
        result['imageId'] = scan_id
        result['originalImageUrl'] = image_url
        result['processedImageUrl'] = processed_url
        result['processedImageData'] = f"data:image/jpeg;base64,{processed_image_b64}"
        result['fromSample'] = True
        result['sampleId'] = sample_id
        
        # Clean up temp files
        print("\n[CLEANUP]")
        os.remove(temp_file_path)
        os.remove(processed_image_path)
        os.rmdir(temp_dir)
        print("Temporary files cleaned up")
        
        print("\n===== SAMPLE IMAGE SCAN COMPLETE =====")
        return jsonify(result)
        
    except Exception as e:
        print(f"ERROR during sample image processing: {e}")
        # Clean up temp files in case of error
        if 'temp_dir' in locals() and os.path.exists(temp_dir):
            if 'temp_file_path' in locals() and os.path.exists(temp_file_path):
                os.remove(temp_file_path)
            if 'processed_image_path' in locals() and os.path.exists(processed_image_path):
                os.remove(processed_image_path)
            os.rmdir(temp_dir)
            
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001) 