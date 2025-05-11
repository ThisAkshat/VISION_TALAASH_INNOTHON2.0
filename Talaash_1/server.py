from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import os
import tempfile
import mysql.connector
from deepface import DeepFace

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Database configuration
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '#01Nov2003',
    'database': 'talaash_db'
}

model_name = "Facenet512"
detector_backend = "opencv"  # More reliable than default

def get_db_connection():
    try:
        conn = mysql.connector.connect(**db_config)
        return conn
    except mysql.connector.Error as err:
        print(f"Database connection error: {err}")
        return None

def fetch_database_images():
    database = {}
    conn = get_db_connection()
    if not conn:
        return database
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id, full_name, image_path, phone_number, aadhaar_number, last_seen 
            FROM missing_persons 
            WHERE image_path IS NOT NULL
        """)
        
        for record in cursor:
            if os.path.exists(record['image_path']):
                database[record['id']] = {
                    'id': record['id'],
                    'name': record['full_name'],
                    'image_path': record['image_path'],
                    'phone': record['phone_number'],
                    'aadhaar': record['aadhaar_number'],
                    'last_seen': record['last_seen']
                }
        print(f"Loaded {len(database)} valid images from database")
    except Exception as e:
        print(f"Error fetching database images: {e}")
    finally:
        if conn.is_connected():
            conn.close()
    
    return database

@app.route('/api/recognize', methods=['POST'])
def recognize():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'Empty file'}), 400
    
    try:
        # Save the image to a temporary file
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as temp_file:
            file.save(temp_file.name)
            temp_path = temp_file.name
        
        database = fetch_database_images()
        if not database:
            return jsonify({'error': 'Database empty or unavailable'}), 500
        
        # Convert image to proper format
        img = cv2.imread(temp_path)
        if img is None:
            return jsonify({'error': 'Invalid image format'}), 400
        
        # Find matches
        for person_id, person_data in database.items():
            try:
                result = DeepFace.verify(
                    img1_path=temp_path,
                    img2_path=person_data['image_path'],
                    model_name=model_name,
                    detector_backend=detector_backend,
                    enforce_detection=False,
                    distance_metric="cosine"
                )
                
                confidence = (1 - result["distance"]) * 100
                if result["verified"] and confidence > 65:  # Threshold
                    return jsonify({
                        'found': True,
                        'person': {
                            'id': person_id,
                            'name': person_data['name'],
                            'confidence': float(f"{confidence:.2f}"),
                            'phone': person_data['phone'],
                            'aadhaar': person_data['aadhaar'],
                            'last_seen': person_data['last_seen'].strftime('%Y-%m-%d') if person_data['last_seen'] else None
                        }
                    })
            except Exception as e:
                print(f"Error comparing with {person_data['name']}: {e}")
                continue
        
        return jsonify({'found': False})
    except Exception as e:
        print(f"Recognition error: {e}")
        return jsonify({'error': 'Processing failed', 'details': str(e)}), 500
    finally:
        if 'temp_path' in locals() and os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)