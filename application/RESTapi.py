from flask import Flask, render_template, Response,request

from application import app
from flask_restful import Api, Resource

from application.pythonClasses import Session, HeadMovementDetection

from flask_socketio import SocketIO, send


socketio = SocketIO(app, logger = False)
sessionOne = Session()


api = Api(app)
emojiDict = {}

class MainDetection(Resource):
    def get(self,name, emotion):
        return name
    def post(self, name, emotion):
        return name


class SmileDetection(Resource):
    def get(self, name,value):
        return value
    def post(self, name, value):
        # sessionOne.updateSmiling(value)
        socketio.emit('smileResponse', sessionOne.getTotalSmiling(), namespace='/web')
        return value

class HandRaiseDetection(Resource):
    def get(self, name):
        return "Hello"
    def post(self, name, value):
        return "Hello again"

class ConfuseDetection(Resource):
    def get(self, name):
        return "Hello"
    def post(self, name, value):
        return "Hello again"

class SurprisedDetection(Resource):
    def get(self, name):
        return "Hello"
    def post(self, name, value):
        return "Hello again"

class ThumbDetection(Resource):
    def get(self, name):
        return "Hello"
    def post(self, name, value):
        return "Hello again"
    


api.add_resource(SmileDetection,"/smile/<string:name>/<int:value>")
api.add_resource(MainDetection,"/connect/<string:name>/<string:emotion>")