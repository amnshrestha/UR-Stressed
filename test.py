import requests

BASE = "http://127.0.0.1:5000/"

response = requests.put(BASE+"video_call/1",{"something":10})
print(response.json())