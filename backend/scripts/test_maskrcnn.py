import cv2
import torch
import numpy as np
import os
from torchvision.transforms import functional as F
from torchvision.models.detection import maskrcnn_resnet50_fpn
import argparse
import time

def load_model(model_path=None):
    """
    Load the tumor detection model
    
    Args:
        model_path: Path to the model weights. If None, uses the default path.
    
    Returns:
        The loaded PyTorch model
    """
    # Load the model
    model = maskrcnn_resnet50_fpn(num_classes=2)  # 1 class (tumor) + background
    
    if model_path is None:
        # Get the path relative to this file's location
        model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 
                              'model', 'maskrcnn_tumor.pth')
    
    model.load_state_dict(
        torch.load(model_path, map_location=torch.device('cpu'))
    )
    model.eval()  # Set the model to evaluation mode
    return model

def analyze_image(model, image_path):
    """
    Analyze an image with the Mask R-CNN model
    
    Args:
        model: The loaded model
        image_path: Path to the image file
    
    Returns:
        Tuple containing (results_dict, processed_image)
    """
    print(f"\nAnalyzing image: {image_path}")
    # Load and preprocess the image
    print("Loading image...")
    image = cv2.imread(image_path)
    if image is None:
        print("ERROR: Failed to load image")
        raise ValueError("Failed to load image")
    
    print(f"Image dimensions: {image.shape}")
    print("Converting to RGB and creating tensor...")
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image_tensor = F.to_tensor(image_rgb)
    image_tensor = image_tensor.unsqueeze(0)  # Add batch dimension
    
    # Initialize results
    results = {
        'hasTumor': False,
        'confidence': 0.0,
        'tumorSize': 'N/A',
        'tumorType': 'Unknown',
        'tumorLocation': 'N/A'
    }
    
    # Make predictions
    print("Running model inference...")
    with torch.no_grad():
        predictions = model(image_tensor)

    # Get the first prediction
    pred = predictions[0]
    
    # Convert image back to BGR for OpenCV operations
    output_image = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2BGR)

    # Visualize only the most confident prediction above a threshold
    print("Processing predictions...")
    boxes = pred['boxes'].cpu().numpy()
    scores = pred['scores'].cpu().numpy()
    
    print(f"Found {len(boxes)} potential regions")
    print(f"Confidence scores: {[round(float(s), 2) for s in scores[:5]]}...")
    
    conf_thresh = 0.7
    valid = scores > conf_thresh
    
    valid_count = np.sum(valid)
    print(f"Found {valid_count} regions with confidence above {conf_thresh}")

    if np.any(valid):
        best_idx = np.argmax(scores[valid])
        best_box = boxes[valid][best_idx].astype(int)
        box_color = (153, 159, 250)  # Light purple color
        print(f"Best detection box: {best_box}")
        
        cv2.rectangle(output_image, (best_box[0], best_box[1]), (best_box[2], best_box[3]), box_color, 2)
        
        # Calculate tumor size (approximate)
        width_px = best_box[2] - best_box[0]
        height_px = best_box[3] - best_box[1]
        size_px = max(width_px, height_px)
        size_cm = (size_px / 100.0) * 2.5  # Approximate conversion to cm
        print(f"Tumor dimensions: {width_px}x{height_px} pixels, approx {size_cm:.1f} cm")
        
        # Determine tumor location based on box center position
        center_x = (best_box[0] + best_box[2]) / 2
        center_y = (best_box[1] + best_box[3]) / 2
        height, width = image.shape[:2]
        print(f"Tumor center position: x={center_x:.1f}, y={center_y:.1f}")
        
        # Simple location determination
        if center_y < height * 0.33:
            location = "Frontal Lobe"
        elif center_y < height * 0.66:
            if center_x < width * 0.5:
                location = "Temporal Lobe (Left)"
            else:
                location = "Temporal Lobe (Right)"
        else:
            if center_x < width * 0.5:
                location = "Occipital Lobe (Left)"
            else:
                location = "Occipital Lobe (Right)"
        print(f"Determined location: {location}")
        
        # Determine tumor type based on size and appearance (simplified)
        if size_cm < 2.0:
            tumor_type = "Meningioma"
        elif size_cm < 3.0:
            tumor_type = "Glioma"
        else:
            tumor_type = "Pituitary"
        print(f"Determined tumor type: {tumor_type}")
            
        confidence = float(scores[valid][best_idx])
        print(f"Confidence: {confidence:.4f}")
        
        # Update results
        results = {
            'hasTumor': True,
            'confidence': confidence,  # Pass the raw confidence value directly
            'tumorSize': f"{size_cm:.1f} cm",
            'tumorType': tumor_type,
            'tumorLocation': location,
        }
        print("RESULT: Tumor detected")
    else:
        print("RESULT: No tumor detected with confidence above threshold.")

    return results, output_image

def main():
    """
    Command line interface for the tumor detection script.
    Usage: python test_maskrcnn.py [image_path]
    If no image path is provided, the script will prompt for one.
    """
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Brain Tumor Detection Test')
    parser.add_argument('image_path', nargs='?', help='Path to the image to analyze')
    args = parser.parse_args()
    
    # Path to the model
    model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 
                          'model', 'maskrcnn_tumor.pth')
    
    print("===============================================")
    print("  BRAIN TUMOR DETECTION - COMMAND LINE TEST")
    print("===============================================")
    
    # Load the model
    print("\nLoading model...")
    start_time = time.time()
    model = load_model(model_path)
    model_load_time = time.time() - start_time
    print(f"Model loaded in {model_load_time:.2f} seconds")
    
    # Get image path from command line or prompt
    image_path = args.image_path
    if not image_path:
        image_path = input("Enter the path to the image to analyze: ")
    
    # Check if the file exists
    if not os.path.exists(image_path):
        print(f"Error: File {image_path} does not exist.")
        return
    
    # Analyze the image
    print(f"\nAnalyzing image: {image_path}")
    print("----------------------------------------------")
    start_time = time.time()
    results, processed_image = analyze_image(model, image_path)
    analysis_time = time.time() - start_time
    
    # Print results
    print("\n----------------------------------------------")
    print("ANALYSIS RESULTS:")
    print("----------------------------------------------")
    print(f"Tumor Detected: {results['hasTumor']}")
    print(f"Confidence: {results['confidence']}")
    print(f"Tumor Type: {results['tumorType']}")
    print(f"Tumor Size: {results['tumorSize']}")
    print(f"Tumor Location: {results['tumorLocation']}")
    print(f"Analysis completed in {analysis_time:.2f} seconds")
    
    # Save the result image
    result_path = os.path.splitext(image_path)[0] + "_result" + os.path.splitext(image_path)[1]
    cv2.imwrite(result_path, processed_image)
    print(f"\nResult image saved to: {result_path}")
    
    # Display the image
    print("\nShowing result image (press any key to close)")
    cv2.imshow('Brain Tumor Detection Result', processed_image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
    
    print("\nTest completed successfully.")

# Run the main function if the script is executed directly
if __name__ == "__main__":
    main()