import os
from flask import Flask, request, jsonify
import face_recognition
from flask_cors import CORS
from PIL import Image

app = Flask(__name__)
CORS(app) 
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10 MB

# Define the upload folder
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def verify_faces(image1_path, image2_path):
    image1 = face_recognition.load_image_file(image1_path)
    image2 = face_recognition.load_image_file(image2_path)

    face_encodings1 = face_recognition.face_encodings(image1)
    face_encodings2 = face_recognition.face_encodings(image2)

    if not face_encodings1 or not face_encodings2:
        return "Could not find at least one face in one of the images."

    results = face_recognition.compare_faces([face_encodings1[0]], face_encodings2[0])
    distance = face_recognition.face_distance([face_encodings1[0]], face_encodings2[0])
    if results[0]:
        return f"The faces are of the same person, with a distance of {distance[0]}"
    else:
        return f"The faces are not of the same person, with a distance of {distance[0]}"

@app.route('/upload', methods=['POST'])
def upload():
    try:
        camera_image = request.files['camera_image']
        device_image = request.files['device_image']

        # Save the images to the upload folder
        camera_image_path = os.path.join(UPLOAD_FOLDER, camera_image.filename)
        device_image_path = os.path.join(UPLOAD_FOLDER, device_image.filename)
        camera_image.save(camera_image_path)
        device_image.save(device_image_path)

        # Verify faces using the saved images
        result = verify_faces(camera_image_path, device_image_path)

        # Return result as JSON
        return jsonify({"result": result})
    except Exception as e:
        # Return error message as JSON
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    app.run(debug=True)
