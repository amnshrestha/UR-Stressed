from flask import Flask, render_template, Response,request
from application import app
from flask_socketio import SocketIO, send

socketio = SocketIO(app)


@app.route('/')
def index():
    """Home page."""
    print("Reaching here")
    return render_template('index.html')


@socketio.on('connect', namespace='/web')
def connect_web():
    print('[INFO] Web client connected: {}'.format(request.sid))
    socketio.emit('message','Message is being sent', namespace='/web')


@socketio.on('disconnect', namespace='/web')
def disconnect_web():
    print('[INFO] Web client disconnected: {}'.format(request.sid))

