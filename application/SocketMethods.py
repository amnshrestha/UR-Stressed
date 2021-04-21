from flask import Flask, render_template, Response,request
from application import app

from application.pythonClasses import Session

from flask_socketio import SocketIO, send

# from session import Session

socketio = SocketIO(app)

sessionOne = Session()

@app.route('/')
def index():
    """Home page."""
    return render_template('index.html')

@app.route('/instructor')
def instructorView():
    """Instructor view."""
    return render_template('instructorView.html')

@app.route('/home')
def homeView():
    """Home view."""
    return render_template('base.html')

@app.route('/about')
def aboutView():
    """About view."""
    return render_template('about.html')




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
@app.route('/nav')
def navView():
    """Nav view."""
    return render_template('nav.html')


@socketio.on('connect', namespace='/web')
def connect_web():
    print('[INFO] Web client connected: {}'.format(request.sid))
    socketio.emit('message','Message is being sent', namespace='/web')

@socketio.on('smile', namespace='/web')
def smile_detected(data):
    print('[INFO] This person smiled: {}'.format(request.sid))
    print(data['value'])
    sessionOne.updateSmiling(data['value'])
    print(sessionOne.getTotalSmiling())
    socketio.emit('smileResponse',sessionOne.getTotalSmiling(), namespace='/web')

@socketio.on('confused', namespace='/web')
def confuse_detected(data):
    print('[INFO] This person is confused: {}'.format(request.sid))
    print(data['value'])
    sessionOne.updateConfused(data['value'])
    print(sessionOne.getTotalConfused())
    socketio.emit('confuseResponse',sessionOne.getTotalConfused(), namespace='/web')

@socketio.on('handraise', namespace='/web')
def hand_raise_detected(data):
    print('[INFO] This person raised their hand: {}'.format(request.sid))
    print(data['value'])
    sessionOne.updateRaisedHands(data['value'])
    print(sessionOne.getTotalRaisedHand())
    socketio.emit('raiseHandResponse',sessionOne.getTotalRaisedHand(), namespace='/web')

@socketio.on('disconnect', namespace='/web')
def disconnect_web():
    print('[INFO] Web client disconnected: {}'.format(request.sid))

