# How UR Feeling


## Project Description
This project allows better communication during virtual calls. Using MediaPipe, we recognize smile, confusion, surprised and gestures like raising hand and giving a thumbs up. This information is then shared with other users without having to share video feed with them


## Notes for collaborators

Because of the use of camera, the code doesn't run from VS code. 
Please use a terminal.

Also, please make sure you can use the venv
```
source venv/bin/activate
export FLASK_ENV=development
pip install -r requirements.txt #...if custom modules were used
flask run #...then Ctrl-C to exit
```


## How it works

Implemented client side html and javascript to use mediapipe


Client-Side tasks:

    - Get landmark coordinates using mediapipe
    - Check for smile
    - Check for eyebrow change
    - Check for hand raise
    - Once features detected, make a post request to the server
    - Get landmark coordinates of face and send it to the server

Server-Side tasks:
    
    - Count the number of gestures at a particular time
    - Update and send it to users
    - Keep track of hand raised and hand lowered
    
