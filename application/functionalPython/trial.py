import eulerian_magnification as em
from eulerian_magnification.io import load_video_float
import cv2
import numpy as np


vid, fps = load_video_float("./new_test.mov")
newVideo = em.eulerian_magnification(vid, fps, 
        freq_min=50.0 / 60.0,
        freq_max=1.0,
        amplification=50,
        pyramid_levels=3
)

print(newVideo)
print(len(newVideo))
print(len(newVideo[0]))
print(len(newVideo[0][0]))

# print(type(newVideo))

frameSize = (1080, 720)
fourcc = cv2.VideoWriter_fourcc('m','p','4','v')

# fourcc = cv2.cv.CV_FOURCC('m', 'p', '4', 'v') # note the lower case

out = cv2.VideoWriter('output_video3.mov',fourcc, 15, frameSize,True)
for i in range (0,len(newVideo)):
    # print(np.uint8(newVideo[i]*100))
    out.write(np.uint8(newVideo[i]*100))

out.release()