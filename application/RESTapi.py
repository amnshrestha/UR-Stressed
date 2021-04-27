from flask import Flask, render_template, Response,request

from application import app
from flask_restful import Api, Resource

from application.pythonClasses import Session, HeadMovementDetection

from flask_socketio import SocketIO, send
import json

socketio = SocketIO(app, logger = False)
sessionOne = Session()


api = Api(app)
emojiDict = {}
handRaised= []

class MainDetection(Resource):
    def get(self,name, emotion):
        return emojiDict
    def post(self, name, emotion):
        print('A Client Joined')
        currentName = name
        currentEmoji = emotion
        emojiDict[currentName] = currentEmoji
        return "Added Emoji"


class SmileDetection(Resource):
    def get(self, name,value):
        return sessionOne.getTotalSmiling()
    def post(self, name, value):
        print("Smile Received")
        if(value == 2):
            value = -1
        sessionOne.updateSmiling(value)
        return value

class HandRaiseDetection(Resource):
    def get(self, name, value):
        return handRaised
    def post(self, name, value):
        print("Hand raise detected")
        if(value == 2):
            if name in handRaised:
                handRaised.remove(name)
        else:
            handRaised.append(name)
        return "Raised Hand"

class ConfuseDetection(Resource):
    def get(self, value):
        return sessionOne.getTotalConfused()
    def post(self, value):
        print("Confusion Received")
        if(value == 2):
            value = -1
        sessionOne.updateConfused(value)
        return "Confuse received"

class SurprisedDetection(Resource):
    def get(self, value):
        return sessionOne.getTotalSurprised()
    def post(self, value):
        print("Surprise Received")
        if(value == 2):
            value = -1
        sessionOne.updateSurprised(value)
        return "Surprised REceived"

class ThumbDetection(Resource):
    def get(self, value):
        return sessionOne.getTotalThumbs()
    def post(self, value):
        print("thumbs up detected")
        if(value == 2):
            value = -1
        sessionOne.updateThumbsUp(value)
        return "Thumb Detected"

class GetEmotion(Resource):
    def get(self):
        toReturn = [0,0,0,0,0,0]
        print(emojiDict)
        for value in emojiDict.values():
            if(value == 'happy'):
                toReturn[0] = toReturn[0] + 1
            elif(value == 'ready'):
                toReturn[1] = toReturn[1] + 1
            elif(value == 'notgreat'):
                toReturn[2] = toReturn[2] + 1
            elif(value == 'sad'):
                toReturn[3] = toReturn[3] + 1
            elif(value == 'dying'):
                toReturn[4] = toReturn[4] + 1
            elif(value == 'sick'):
                toReturn[5] = toReturn[5] + 1
        print(toReturn)
        return toReturn
    


api.add_resource(SmileDetection,"/smile/<string:name>/<int:value>")
api.add_resource(MainDetection,"/connect/<string:name>/<string:emotion>")
api.add_resource(ConfuseDetection,"/confuse/<int:value>")
api.add_resource(HandRaiseDetection,"/handraise/<string:name>/<int:value>")
api.add_resource(ThumbDetection,"/thumbdetect/<int:value>")
api.add_resource(SurprisedDetection,"/surprised/<int:value>")
api.add_resource(GetEmotion,"/getemotion")



