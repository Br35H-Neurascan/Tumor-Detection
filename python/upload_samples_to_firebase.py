"""
Upload sample images to Firebase Storage
This script uploads all sample images from the local directory to Firebase Storage.
"""

import os
import glob
from firebase_service import firebase_service

def upload_samples():
    """Upload all samples from the samples directory to Firebase Storage"""
    if not firebase_service.initialized:
        print("Firebase is not initialized. Make sure service-account.json is available.")
        return
    
    # Get the path to the samples directory
    samples_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'samples')
    
    if not os.path.exists(samples_dir):
        print(f"Samples directory not found: {samples_dir}")
        return
    
    # Find all image files
    image_files = []
    for ext in ['*.jpg', '*.jpeg', '*.png', '*.gif', '*.bmp']:
        image_files.extend(glob.glob(os.path.join(samples_dir, ext)))
        image_files.extend(glob.glob(os.path.join(samples_dir, ext.upper())))
    
    print(f"Found {len(image_files)} sample images to upload")
    
    # Upload each image
    success_count = 0
    for image_file in image_files:
        filename = os.path.basename(image_file)
        print(f"Uploading {filename}...")
        
        success, storage_path, download_url, error = firebase_service.upload_image(
            image_file,
            folder="samples"
        )
        
        if success:
            print(f"Uploaded {filename} to {storage_path}")
            print(f"Download URL: {download_url}")
            success_count += 1
        else:
            print(f"Failed to upload {filename}: {error}")
    
    print(f"\nSummary: Uploaded {success_count} out of {len(image_files)} images")

if __name__ == '__main__':
    print("Starting sample upload...")
    upload_samples()
    print("Upload process completed.") 