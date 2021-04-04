from flask import Flask, render_template, Response,request
from application import app
import cv2


camera = cv2.VideoCapture(0)
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades+'haarcascade_frontalface_default.xml') #Loading the model

def generate_frames():
    while True:
        success, frame = camera.read()
        if not success:
            break
        else:
            grayScale = cv2.cvtColor(frame,cv2.COLOR_BGR2GRAY)
            faces = face_cascade.detectMultiScale(grayScale, scaleFactor=1.5, minNeighbors=5)
            for (x,y,w,h) in faces:
                color = (255,0,0)
                stroke = 2
                # Rectangle that shows the face
                cv2.rectangle(frame, (x, y), (x+w, y+h), color, stroke)
            ret, buffer = cv2.imencode('.jpg',frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'b'Content-type: image/jpeg \r\n\r\n' + frame + b'\r\n')



@app.route('/video')
def index():
    return render_template('mainCamera.html')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

