from flask import Flask, render_template, Response,request
from application import app

from application.pythonClasses import Session, HeadMovementDetection

from flask_socketio import SocketIO, send

# from session import Session

socketio = SocketIO(app, logger = False)

sessionOne = Session()

detectorDict = {}

@app.route('/')
def index():
    """Home page."""
    return render_template('index.html')

@app.route('/instructor')
def instructorView():
    """Instructor view."""
    return render_template('instructorView.html')


# Commented in case we need to fix this individually later
# Currently, the code in main.js is same as individual hand and eyebrow code combined
# @app.route('/hand')
# def hand():
#     """Recognize Hand page."""
#     return render_template('hand.html')

# @app.route('/eyebrow')
# def eyebrow():
#     """Recognize Eyebrow page."""
#     return render_template('eyebrow.html')

@socketio.on('connect', namespace='/web')
def connect_web():
    print('[INFO] Web client connected: {}'.format(request.sid))
    
    headNodDetector = HeadMovementDetection()
    detectorDict[request.sid] = headNodDetector

    socketio.emit('message','Message is being sent', namespace='/web')

@socketio.on('nodDetection', namespace='/web')
def nod_detector(dataSent):
    print('[INFO] Data from: {}'.format(request.sid))
    headNodDetector = detectorDict[request.sid]
    imagePoints = dataSent['imagePoints']
    imageShape = dataSent['imageShape']
    headNodDetector.setValues(imagePoints, imageShape)
    headNodded, saidNo = headNodDetector.calculate()
    if(headNodded):
        socketio.emit('headnod',"HeadNodded", namespace='/web')
    if(saidNo):
        socketio.emit('saidno',"SaidNo", namespace='/web')
    # socketio.emit('smileResponse',sessionOne.getTotalSmiling(), namespace='/web')


@socketio.on('smile', namespace='/web')
def smile_detected(id):
    print('[INFO] This person smiled: {}'.format(request.sid))
    print(id)
    sessionOne.increaseSmile()
    print(sessionOne.getTotalSmiling())
    socketio.emit('smileResponse',sessionOne.getTotalSmiling(), namespace='/web')




@socketio.on('confused', namespace='/web')
def confuse_detected(id):
    print('[INFO] This person is confused: {}'.format(request.sid))
    print(id)
    sessionOne.increaseConfused()
    print(sessionOne.getTotalConfused())
    socketio.emit('confuseResponse',sessionOne.getTotalConfused(), namespace='/web')

@socketio.on('handraise', namespace='/web')
def hand_raise_detected(id):
    print('[INFO] This person raised their hand: {}'.format(request.sid))
    print(id)
    sessionOne.increaseTotalRaisedHand()
    print(sessionOne.getTotalRaisedHand())
    socketio.emit('raiseHandResponse',sessionOne.getTotalRaisedHand(), namespace='/web')

@socketio.on('disconnect', namespace='/web')
def disconnect_web():
    print('[INFO] Web client disconnected: {}'.format(request.sid))

