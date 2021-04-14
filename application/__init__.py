from flask import Flask, render_template, Response,request
app = Flask(__name__)
app.config['SECRET_KEY'] = 'mysecret'

from application import defaultCamera
from application import RESTapi
from application import SocketMethods
