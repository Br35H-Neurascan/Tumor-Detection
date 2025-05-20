#!/usr/bin/env python3
"""
Brain Tumor Detection Test Script

This script allows you to test the tumor detection model on a single image 
or run a simple server to test the entire detection pipeline.

Usage:
  python test_tumor_detection.py --image <image_path>
  python test_tumor_detection.py --server
"""

import os
import cv2
import sys
import argparse
import time
from test_maskrcnn import load_model, analyze_image

def test_single_image(image_path):
    """Test the tumor detection model on a single image"""
    
    print("\n=== BRAIN TUMOR DETECTION TEST ===")
    print(f"Testing image: {image_path}")
    
    if not os.path.exists(image_path):
        print(f"Error: Image not found at {image_path}")
        return False
    
    # Get model path
    script_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(os.path.dirname(script_dir), 'model', 'maskrcnn_tumor.pth')
    
    # Load model
    print("\nLoading model...")
    start_time = time.time()
    model = load_model(model_path)
    if model is None:
        print("Error: Failed to load model")
        return False
    
    load_time = time.time() - start_time
    print(f"Model loaded in {load_time:.2f} seconds")
    
    # Analyze image
    print("\nAnalyzing image...")
    start_time = time.time()
    results, processed_image = analyze_image(model, image_path)
    process_time = time.time() - start_time
    
    # Display results
    print("\n=== RESULTS ===")
    print(f"Tumor Detected: {results['hasTumor']}")
    if results['hasTumor']:
        print(f"Confidence: {results['confidence']}")
        print(f"Tumor Type: {results['tumorType']}")
        print(f"Tumor Size: {results['tumorSize']}")
        print(f"Tumor Location: {results['tumorLocation']}")
    
    print(f"\nAnalysis completed in {process_time:.2f} seconds")

    # Save result image
    result_path = image_path.replace('.', '_result.')
    cv2.imwrite(result_path, processed_image)
    print(f"\nResult image saved to: {result_path}")
    
    # Show the image
    print("\nShowing result image (press any key to close)")
    cv2.imshow('Brain Tumor Detection', processed_image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
    
    return True

def run_test_server():
    """Run a simple test server to process images from the web interface"""
    from flask import Flask, request, jsonify
    import tempfile
    import base64
    
    app = Flask(__name__)
    
    # Get model path
    script_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(os.path.dirname(script_dir), 'model', 'maskrcnn_tumor.pth')
    
    # Load model
    print("\nLoading model...")
    model = load_model(model_path)
    if model is None:
        print("Error: Failed to load model")
        return False
    
    @app.route('/test/analyze', methods=['POST'])
    def analyze():
        print("\n=== RECEIVED TEST REQUEST ===")
        
        if 'image' not in request.files:
            print("Error: No image file in request")
            return jsonify({'error': 'No image provided'}), 400
        
        file = request.files['image']
        
        # Save the file temporarily
        temp_dir = tempfile.mkdtemp()
        temp_file = os.path.join(temp_dir, file.filename)
        file.save(temp_file)
        print(f"Image saved to: {temp_file}")
        
        try:
            # Analyze the image
            print("\nAnalyzing image...")
            start_time = time.time()
            results, processed_image = analyze_image(model, temp_file)
            process_time = time.time() - start_time
            
            # Display results
            print("\n=== RESULTS ===")
            print(f"Tumor Detected: {results['hasTumor']}")
            if results['hasTumor']:
                print(f"Confidence: {results['confidence']}")
                print(f"Tumor Type: {results['tumorType']}")
                print(f"Tumor Size: {results['tumorSize']}")
                print(f"Tumor Location: {results['tumorLocation']}")
            
            print(f"\nAnalysis completed in {process_time:.2f} seconds")
            
            # Save processed image
            result_path = temp_file.replace('.', '_result.')
            cv2.imwrite(result_path, processed_image)
            print(f"Result image saved to: {result_path}")
            
            # Convert to base64 for response
            with open(result_path, 'rb') as img_file:
                img_data = base64.b64encode(img_file.read()).decode('utf-8')
            
            # Clean up
            os.remove(temp_file)
            os.remove(result_path)
            os.rmdir(temp_dir)
            
            # Return results
            response = {
                'results': results,
                'image': f"data:image/jpeg;base64,{img_data}"
            }
            return jsonify(response)
            
        except Exception as e:
            print(f"Error processing image: {e}")
            
            # Clean up on error
            if os.path.exists(temp_file):
                os.remove(temp_file)
            if os.path.exists(temp_dir):
                os.rmdir(temp_dir)
                
            return jsonify({'error': str(e)}), 500
    
    # Run the test server
    print("\n=== STARTING TEST SERVER ===")
    print("Server running at http://localhost:5002/test/analyze")
    print("Send POST requests with 'image' file to test")
    print("Press Ctrl+C to stop the server")
    app.run(host='0.0.0.0', port=5002, debug=True)

def main():
    """Main function to parse arguments and run tests"""
    parser = argparse.ArgumentParser(description='Brain Tumor Detection Test')
    
    # Add arguments
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--image', type=str, help='Path to image to test')
    group.add_argument('--server', action='store_true', help='Run test server')
    
    # Parse arguments
    args = parser.parse_args()
    
    # Run appropriate test
    if args.image:
        test_single_image(args.image)
    elif args.server:
        run_test_server()

if __name__ == '__main__':
    main() 