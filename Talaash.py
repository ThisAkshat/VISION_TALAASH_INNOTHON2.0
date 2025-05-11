import mysql.connector
from deepface import DeepFace
import cv2
import os
import numpy as np
from datetime import datetime
import requests
import pyttsx3

# ------------------ CONFIGURATION ------------------

model_name = "Facenet512"
whatsapp_alert = True  # enable WhatsApp alerts

# Database config
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '#01Nov2003',
    'database': 'talaash_db'
}


ultramsg_instance_id = 'instance119286' 
ultramsg_token = 'r6bxw9kgyvfmum72'  


engine = pyttsx3.init()

# ------------------ WHATSAPP FUNCTION ------------------

def send_whatsapp_message(person_name, phone_number):
    url = f"https://api.ultramsg.com/{ultramsg_instance_id}/messages/chat"
    
    payload = {
        "token": ultramsg_token,
        "to": f"+91{phone_number}",
        "body": f"TALAASH ALERT 📢: {person_name} has been FOUND at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}."
    }

    response = requests.post(url, data=payload)

    if response.status_code == 200:
        print(f"[INFO] WhatsApp alert sent to {phone_number}")
    else:
        print(f"[ERROR] Failed to send WhatsApp message: {response.text}")

# ------------------ FETCH DATABASE IMAGES ------------------
def fetch_database_images():
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM people")
    records = cursor.fetchall()
    conn.close()

    database = {}
    for record in records:
        # Corrected the order based on table structure
        id, name, image_path, address, date_missing, height_cm, gender, email, phone_number, aadhaar_number, identification_mark = record
        database[name] = {
            'image_path': image_path,
            'address': address,
            'date_missing': date_missing,
            'height_cm': height_cm,
            'gender': gender,
            'email': email,
            'phone_number': phone_number,
            'aadhaar_number': aadhaar_number,
            'identification_mark': identification_mark
        }

    print(f"[INFO] Loaded {len(database)} records from MySQL database.")
    return database

# ------------------ FACE MATCH FUNCTION ------------------

def find_person_in_database(target_image_path, database):
    for name, details in database.items():
        result = DeepFace.verify(
            img1_path=target_image_path,
            img2_path=details['image_path'],
            model_name=model_name,
            enforce_detection=False,
            detector_backend='opencv',
            distance_metric="cosine"
        )
        confidence = (1 - result["distance"]) * 100

        if result["verified"]:
            return name, confidence, details

    return None, None, None

# ------------------ REAL-TIME FACE DETECTION ------------------

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
            cv2.imwrite("detected_face.jpg", face_img)

            person_name, confidence, details = find_person_in_database("detected_face.jpg", database)

            if person_name:
                label = f"{person_name} ({confidence:.2f}%)"
                color = (0, 255, 0)

                if person_name not in announced_persons:
                    print(f"\n========== FOUND PERSON ==========")
                    print(f"Name: {person_name}")
                    print(f"Confidence: {confidence:.2f}%")
                    print(f"Phone Number: {details['phone_number']}")
                    print(f"Aadhaar Number: {details['aadhaar_number']}")
                    print(f"Address: {details['address']}")
                    print(f"Date Missing: {details['date_missing']}")
                    print(f"Height (cm): {details['height_cm']}")
                    print(f"Gender: {details['gender']}")
                    print(f"Email: {details['email']}")
                    print(f"Identification Mark: {details['identification_mark']}")
                    print("===================================")

                    engine.say(f"{person_name} found with {confidence:.2f} percent confidence")
                    engine.runAndWait()
                    announced_persons.add(person_name)

                    if whatsapp_alert:
                        send_whatsapp_message(person_name, details['phone_number'])

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

# ------------------ MAIN FUNCTION ------------------

def main():
    print("======= TALAASH WITH MYSQL & WHATSAPP ALERT =======")
    database = fetch_database_images()
    capture_and_detect_face(database)

if __name__ == "__main__":
    main()