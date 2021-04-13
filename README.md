# UR-Stressed


Because of the use of camera, the code doesn't run from VS code. 
Please use a terminal.

Also, please make sure you can use the venv
```
source venv/bin/activate
export FLASK_ENV=development
pip install -r requirements.txt #...if custom modules were used
flask run #...then Ctrl-C to exit
```


## To-Do

Implement client side html and javascript to use mediapipe

For the Flask app-
    - setup up socket.io correctly

Client-Side tasks:
    - Get landmark coordinates
    - Check for smile
    - Check for eyebrow change
    - Check for hand raise
    - Get landmark coordinates of face and send it to the server

Server-Side tasks:
    - Use landmark coordinates to find head movement
    - Set up database
    - Keep ID for each class
    