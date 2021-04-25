from flask import Flask, render_template, Response,request
from application import app
from application.pythonClasses import Session, HeadMovementDetection
from flask_socketio import SocketIO, send

socketio = SocketIO(app, logger = False)
sessionOne = Session()
detectorDict = {}
nameDict = {}
emojiDict = {}

@app.route('/')
def index():
    """Home page."""
    return render_template('index.html')

@app.route('/instructor')
def instructorView():
    """Instructor view."""
    return render_template('main.html')

@app.route('/about')
def aboutView():
    """About view."""
    return render_template('about.html')

@app.route('/nav')
def navView():
    """Nav view."""
    return render_template('nav.html')

@socketio.on('connect', namespace='/web')
def connect_web():
    print('[INFO] Web client connected: {}'.format(request.sid))
    
    headNodDetector = HeadMovementDetection()
    detectorDict[request.sid] = headNodDetector

    socketio.emit('message','Message is being sent', namespace='/web')

@socketio.on('initialData', namespace='/web')
def inital_data(initialData):
    currentName = initialData['name']
    currentEmoji = initialData['emoji']
    nameDict[request.sid] = currentName
    emojiDict[request.sid] = currentEmoji
    socketio.emit('updateEmotions', emojiDict, namespace='/web')

@socketio.on('nodDetection', namespace='/web')
def nod_detector(data):
    # print('[INFO] Data from: {}'.format(request.sid))
    headNodDetector = detectorDict[request.sid]
    imagePoints = data['imagePoints']
    imageShape = data['imageShape']
    headNodDetector.setValues(imagePoints, imageShape)
    headNodded, saidNo = headNodDetector.calculate()

    if headNodded:
      sessionOne.updateYes(1)
      socketio.emit('yesResponse', sessionOne.getTotalYes(), namespace='/web')

    if saidNo:
      sessionOne.updateNo(1)
      socketio.emit('noResponse', sessionOne.getTotalNo(), namespace='/web')
    
    if not saidNo and headNodded:
      sessionOne.updateNo(-1)
    if not headNodded and saidNo:
      sessionOne.updateYes(-1)

@socketio.on('smile', namespace='/web')
def smile_detected(data):
    # print('[INFO] This person smiled: {}'.format(request.sid))
    sessionOne.updateSmiling(data['value'])
    socketio.emit('smileResponse', sessionOne.getTotalSmiling(), namespace='/web')

@socketio.on('confused', namespace='/web')
def confuse_detected(data):
    # print('[INFO] This person is confused: {}'.format(request.sid))
    sessionOne.updateConfused(data['value'])
    socketio.emit('confusedResponse', sessionOne.getTotalConfused(), namespace='/web')

@socketio.on('surprised', namespace='/web')
def surprised_detected(data):
    # print('[INFO] This person is surprised: {}'.format(request.sid))
    sessionOne.updateSurprised(data['value'])
    socketio.emit('surprisedResponse', sessionOne.getTotalSurprised(), namespace='/web')

@socketio.on('handraise', namespace='/web')
def hand_raise_detected(data):
    # print('[INFO] This person raised their hand: {}'.format(request.sid))
    sessionOne.updateRaisedHands(data['value'])
    raisedValue = True
    if(data['value'] == -1):
        raisedValue = False
    socketio.emit('raiseHandResponse', (nameDict[request.sid],sessionOne.getTotalRaisedHand(),raisedValue), namespace='/web')

@socketio.on('thumb', namespace='/web')
def thumbs_up_detected(data):
    # print('[INFO] This person thumbs up: {}'.format(request.sid))
    sessionOne.updateThumbsUp(data['value'])
    socketio.emit('thumbsUpResponse', sessionOne.getTotalThumbs(), namespace='/web')

@socketio.on('reset', namespace='/web')
def reset():
    nameDict = {}
    emojiDict = {}
    socketio.emit('updateEmotions', emojiDict, namespace='/web')
    sessionOne.resetValues()

@socketio.on('disconnect', namespace='/web')
def disconnect_web():
    print('[INFO] Web client disconnected: {}'.format(request.sid))
