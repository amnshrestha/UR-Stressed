
from flask import Flask, render_template, Response,request
from application import app



@app.route('/main_video')
def main_video():
    return render_template('test.html')