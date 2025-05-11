import mysql.connector
from deepface import DeepFace
import cv2
import os
import numpy as np
from datetime import datetime
from twilio.rest import Client
import pyttsx3

model_name = "Facenet512"
distance_metric = "cosine"
whatsapp_alert = False

# Database Configuration
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '#01Nov2003',
    'database': 'talaash_db'
}

twilio_sid = 'YOUR_TWILIO_SID'
twilio_auth_token = 'YOUR_TWILIO_AUTH_TOKEN'
twilio_whatsapp_number = 'whatsapp:+14155238886'
recipient_number = 'whatsapp:+919999999999'

engine = pyttsx3.init()

# WhatsApp Alert Function
def send_whatsapp_message(person_details):
    client = Client(twilio_sid, twilio_auth_token)
    message = client.messages.create(
        from_=twilio_whatsapp_number,
        body=f"TALAASH ALERT: {person_details['full_name']} FOUND at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
             f"Details:\n"
             f"Phone: {person_details['phone_number']}\n"
             f"Aadhaar: {person_details['aadhaar_number']}\n"
             f"Address: {person_details['address']}\n"
             f"Missing Since: {person_details['date_missing']}",
        to=recipient_number
    )
    print(f"Alert sent: {message.sid}")

# Fetch Database Images
def fetch_database_images():
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()
    cursor.execute("SELECT full_name, image_path, phone_number, aadhaar_number, address, date_missing, height_cm, gender, email, identification_mark FROM missing_persons")
    records = cursor.fetchall()
    conn.close()

    database = {}
    for full_name, path, phone, aadhaar, address, date_missing, height, gender, email, identification_mark in records:
        if os.path.exists(path):
            database[full_name] = {
                'full_name': full_name,
                'image_path': path,
                'phone_number': phone,
                'aadhaar_number': aadhaar,
                'address': address,
                'date_missing': date_missing,
                'height_cm': height,
                'gender': gender,
                'email': email,
                'identification_mark': identification_mark
            }
        else:
            print(f"[WARNING] Image for {full_name} not found at {path}")

    print(f"Loaded {len(database)} images from MySQL database.")
    return database

# Face Match Function
def find_person_in_database(target_image_path, database):
    for full_name, details in database.items():
        try:
            result = DeepFace.verify(
                img1_path=target_image_path,
                img2_path=details['image_path'],
                model_name=model_name,
                enforce_detection=False,
                detector_backend='retinaface',  # Faster and more accurate
                distance_metric=distance_metric
            )
            confidence = (1 - result["distance"]) * 100

            if result["verified"]:
                return details, confidence

        except Exception as e:
            print(f"[ERROR] Comparing with {full_name} failed: {e}")

    return None, None

# Real-Time Face Detection
def capture_and_detect_face(database):
    cam = cv2.VideoCapture(0)
    detector = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    announced_persons = set()

    print("\n[INFO] Starting camera. Press 'q' to quit.")

    while True:
        ret, frame = cam.read()
        if not ret:
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = detector.detectMultiScale(gray, 1.3, 5)

        for (x, y, w, h) in faces:
            face_img = frame[y:y + h, x:x + w]
            cv2.imwrite("detected_face.jpg", cv2.resize(face_img, (160, 160)))  # Optimized size

            person_details, confidence = find_person_in_database("detected_face.jpg", database)

            if person_details:
                label = f"{person_details['full_name']} ({confidence:.2f}%)"
                color = (0, 255, 0)

                if person_details['full_name'] not in announced_persons:
                    print(f"\n======= PERSON FOUND =======")
                    print(f"Name: {person_details['full_name']}")
                    print(f"Confidence: {confidence:.2f}%")
                    print(f"Phone: {person_details['phone_number']}")
                    print(f"Aadhaar: {person_details['aadhaar_number']}")
                    print(f"Address: {person_details['address']}")
                    print(f"Missing Since: {person_details['date_missing']}")
                    print(f"Height: {person_details['height_cm']} cm")
                    print(f"Gender: {person_details['gender']}")
                    print(f"Email: {person_details['email']}")
                    print(f"ID Mark: {person_details['identification_mark']}")
                    print("===========================\n")
                    engine.say(f"{person_details['full_name']} found with {confidence:.2f} percent confidence")
                    engine.runAndWait()
                    announced_persons.add(person_details['full_name'])

                    if whatsapp_alert:
                        send_whatsapp_message(person_details)
            else:
                label = "Not Found"
                color = (0, 0, 255)

            cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
            cv2.putText(frame, label, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)

        cv2.imshow("Talaash Recognizer", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cam.release()
    cv2.destroyAllWindows()

# Main Function
def main():
    print("======= TALAASH WITH MYSQL =======")
    database = fetch_database_images()
    capture_and_detect_face(database)

if __name__ == "__main__":
    main()
