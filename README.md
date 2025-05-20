# Brain MRI Tumor Detection System

A web application for detecting tumors in brain MRI scans using Mask R-CNN deep learning model. This project connects a JavaScript frontend with a Python backend for AI-powered tumor detection.

## Features

- Upload and process brain MRI images
- View detection results with tumor highlighting
- Access sample images for demonstration
- Save results to your account (with Firebase authentication)
- View scan history and download results

## System Architecture

- **Frontend**: HTML, CSS, JavaScript with Firebase Authentication
- **Backend**: Flask API with PyTorch MaskRCNN model
- **Storage**: Firebase Storage and Firestore

## Installation and Setup

### Prerequisites

- Python 3.8+
- Node.js (optional, for local development server)
- Firebase account with:
  - Firestore database
  - Storage bucket
  - Authentication enabled

### Setup Steps

1. Clone the repository
2. Configure Firebase:
   - Update `firebase-config.js` with your Firebase project details
   - Place your Firebase service account key in `service-account.json`

3. Install Python dependencies:
   ```bash
   python -m pip install flask torch torchvision opencv-python firebase-admin flask-cors pillow
   ```

4. Ensure you have the MaskRCNN model file:
   - Place the model file at `model/maskrcnn_tumor.pth`

## Running the Application

1. Start the Flask API server:
   ```bash
   cd python
   python app.py
   ```

2. Open the web application:
   - If using a local server: `python -m http.server` (from project root)
   - Or simply open `index.html` in a browser

3. Upload an image or select a sample image
4. View the AI analysis results

## API Endpoints

- `POST /api/analyze`: Analyze an uploaded image
  - Input: Form data with 'image' file
  - Output: JSON with detection results and processed image

- `GET /api/sample-images/<sample_id>`: Get a sample image (not fully implemented)

## File Structure
<pre>Tumor-Detection/
├── backend/                            # All backend Python logic
│   ├── app.py                          # Main Flask application
│   ├── firebase/
│   │   └── service.py                  # Firebase backend integration
│   ├── model/
│   │   ├── .gitattributes              # Git LFS tracking file
│   │   ├── maskrcnn_tumor.pth          # Trained Mask R-CNN model file
│   │   └── train.py                    # Model training script
│   └── scripts/
│       ├── test_maskrcnn.py           # Test script for Mask R-CNN
│       ├── test_tumor_detection.py    # Full pipeline test script
│       └── upload_samples_to_firebase.py  # Uploads images to Firebase
│
├── credentials/                          # Firebase credentials and setup
│   └── service-account-instructions.txt  # Setup instructions
│
├── frontend/                           # Web interface (HTML/CSS/JS)
│   ├── index.html                      # Main webpage structure
│   ├── styles.css                      # Web styling
│   ├── script.js                       # Frontend logic (upload, API calls)
│   ├── resources.js                    # Helper data/functions
│   ├── firebase/
│   │   ├── auth.js                     # Handles user authentication
│   │   ├── firebase-config.js          # Firebase frontend config
│   │   └── firebase-messaging-sw.js    # Service worker for push notifications
│   └── backups/
│       ├── script.js.backup            # Backup of old JS version
│       └── script.js.bak               # Another backup
└──|</pre>

## Troubleshooting

- Ensure the Flask server is running on port 5000
- Verify that your Firebase configuration is correct
- Check that the model file path is correct in the Python code
- For CORS issues, make sure Flask-CORS is properly configured

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
