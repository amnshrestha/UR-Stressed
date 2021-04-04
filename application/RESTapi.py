from flask import Flask, render_template, Response,request

from application import app
from flask_restful import Api, Resource


api = Api(app)
videos = {}
class VideoCall(Resource):
    def get(self,video_id):
        return video_id
    def put(self,video_id):
        print(request.form["something"])
        return request.form["something"]

api.add_resource(VideoCall,"/video_call/<int:video_id>")