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

@app.route('/hand')
def hand():
    """Recognize Hand page."""
    return render_template('hand.html')

@app.route('/eyebrow')
def eyebrow():
    """Recognize Eyebrow page."""
    return render_template('eyebrow.html')

@socketio.on('connect', namespace='/web')
def connect_web():
    print('[INFO] Web client connected: {}'.format(request.sid))
    socketio.emit('message','Message is being sent', namespace='/web')

@socketio.on('smile', namespace='/web')
def smile_detected(id):
    print('[INFO] This person smiled: {}'.format(request.sid))
    print(id)
    sessionOne.increaseSmile()
    print(sessionOne.getTotalSmiling())
    socketio.emit('message','Message is being sent', namespace='/web')


# handraise
# confused
@socketio.on('confused', namespace='/web')
def smile_detected(id):
    print('[INFO] This person is confused: {}'.format(request.sid))
    print(id)
    # sessionOne.increaseSmile()
    # print(sessionOne.getTotalSmiling())
    socketio.emit('message','Message is being sent', namespace='/web')

@socketio.on('handraise', namespace='/web')
def smile_detected(id):
    print('[INFO] This person raised their hand: {}'.format(request.sid))
    print(id)
    # sessionOne.increaseSmile()
    # print(sessionOne.getTotalSmiling())
    socketio.emit('message','Message is being sent', namespace='/web')

@socketio.on('disconnect', namespace='/web')
def disconnect_web():
    print('[INFO] Web client disconnected: {}'.format(request.sid))

