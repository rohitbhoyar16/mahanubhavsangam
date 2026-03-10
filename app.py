from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import uuid
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app) # Enable CORS for frontend requests

# Ensure upload directory exists
UPLOAD_FOLDER = 'uploads/verifications'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/api/register', methods=['POST'])
def register_user():
    # 1. Extract standard form data
    full_name = request.form.get('fullName')
    dob = request.form.get('dob')
    gender = request.form.get('gender')
    caste = request.form.get('caste')
    kaan_fukle = request.form.get('kaanFukle')
    
    # 2. Extract and save the video file
    if 'verification_video' not in request.files:
        return jsonify({"status": "error", "message": "Verification video is missing"}), 400
        
    video_file = request.files['verification_video']
    
    if video_file.filename == '':
        return jsonify({"status": "error", "message": "No selected file"}), 400

    if video_file:
        # Generate a unique filename to prevent overwriting
        unique_filename = f"{uuid.uuid4()}_{secure_filename(video_file.filename)}"
        save_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        video_file.save(save_path)
        
        # Here you would typically save the text data (full_name, caste, etc.) 
        # and the 'save_path' of the video to a database like PostgreSQL or MongoDB.
        
        print(f"New Registration: {full_name}, Kaan Fukle: {kaan_fukle}, Caste: {caste}")
        print(f"Video saved to: {save_path}")

        return jsonify({"status": "success", "message": "Profile submitted for review"}), 201

if __name__ == '__main__':
    app.run(debug=True, port=5000)