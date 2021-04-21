import numpy as np
import cv2

import math

class Session:
    def __init__(self):
        # Class Properties
        # Subject to change
        self.title = ""

        #Implemented already
        self.peopleSmiling = 0
        self.peopleConfused = 0
        self.totalRaisedHand = 0
        self.totalThumbs = 0
        self.totalYes = 0
        self.totalNo = 0
    
    def getTotalSmiling(self):
        return self.peopleSmiling
    
    def getTotalConfused(self):
        return self.peopleConfused
    
    def getTotalRaisedHand(self):
        return self.totalRaisedHand

    def getTotalThumbs(self):
        return self.totalThumbs

    def getTotalYes(self):
        return self.totalYes

    def getTotalNo(self):
        return self.totalNo

    def updateSmiling(self, value):
        self.peopleSmiling = self.peopleSmiling + value

    def updateConfused(self, value):
        self.peopleConfused = self.peopleConfused + value

    def updateRaisedHands(self, value):
        self.totalRaisedHand = self.totalRaisedHand + value

    def updateThumbsUp(self, value):
        self.totalThumbs = self.totalThumbs + value
    
    def updateYes(self, value):
        self.totalYes = self.totalYes + value

    def updateNo(self, value):
        self.totalNo = self.totalNo + value


class HeadMovementDetection:
    def __init__(self):
        self.model_points = np.array([
                            (0.0, 0.0, 0.0),             # Nose tip
                            (0.0, -330.0, -65.0),        # Chin
                            (-225.0, 170.0, -135.0),     # Left eye left corner
                            (225.0, 170.0, -135.0),      # Right eye right corne
                            (-150.0, -150.0, -125.0),    # Left Mouth corner
                            (150.0, -150.0, -125.0)      # Right mouth corner
                        ])
        

        self.raisedup = False
        self.loweredDown = False
        self.leftTurn = False
        self.righTurn = False

        self.frameSkip = 7
        self.currentFrame = 0

        self.dist_coeffs = np.zeros((4,1)) # Assuming no lens distortion
        
        
    def setValues(self, coordinates, imageShape):
        self.image_points = np.array([
                                    coordinates[0],     # Nose tip
                                    coordinates[1],     # Chin
                                    coordinates[2],     # Left eye left corner
                                    coordinates[3],     # Right eye right corne
                                    coordinates[4],     # Left Mouth corner
                                    coordinates[5]      # Right mouth corner
                                ], dtype="double")
    
        # height, width
        self.imageShape = imageShape
        self.focal_length = imageShape[1]
        self.center = (imageShape[1]/2, imageShape[0]/2)
        self.camera_matrix = np.array(
                         [[self.focal_length, 0, self.center[0]],
                         [0, self.focal_length, self.center[1]],
                         [0, 0, 1]], dtype = "double"
                         )

    def calculate(self):
        self.currentFrame = self.currentFrame + 1
        
        headNodded = False
        saidNo = False

        #reset values
        if(self.currentFrame > 10000):
            self.raisedup = False
            self.loweredDown = False
            self.righTurn = False
            self.leftTurn = False
            self.currentFrame = 0

        if(self.currentFrame % self.frameSkip != 0):
            return False, False
        (success, rotation_vector, translation_vector) = cv2.solvePnP(self.model_points, self.image_points, self.camera_matrix, self.dist_coeffs, flags=cv2.SOLVEPNP_UPNP)
        (nose_end_point2D, jacobian) = cv2.projectPoints(np.array([(0.0, 0.0, 1000.0)]), rotation_vector, translation_vector, self.camera_matrix, self.dist_coeffs)
        p1 = ( int(self.image_points[0][0]), int(self.image_points[0][1]))
        p2 = ( int(nose_end_point2D[0][0][0]), int(nose_end_point2D[0][0][1]))
        x1, x2 = self.draw_annotation_box(self.imageShape[1], rotation_vector, translation_vector, self.camera_matrix)
        try:
            m = (p2[1] - p1[1])/(p2[0] - p1[0])
            ang1 = int(math.degrees(math.atan(m)))
        except:
            ang1 = 90
                
        try:
            m = (x2[1] - x1[1])/(x2[0] - x1[0])
            ang2 = int(math.degrees(math.atan(-1/m)))
        except:
            ang2 = 90
        # print(self.imageShape)

        # -50 left + 20 right

        # If negative then head up
        #If greater than 40 then head down

        if(ang2 < -30):
            if(self.righTurn):
                print("Said No")
                saidNo = True
                self.righTurn = False
                self.leftTurn = False
            else:
                self.leftTurn = True
        elif(ang2 > 20):
            if(self.leftTurn):
                print("Said No")
                saidNo = True
                self.righTurn = False
                self.leftTurn = False
            else:
                self.righTurn = True
        
        if(saidNo):
            return False, True

        if(ang1 < 0):
            if(self.loweredDown):
                print("Head Nod")
                headNodded = True
                self.raisedup = False
                self.loweredDown = False
            else:
                self.raisedup = True
        elif(ang1 > 40):
            if(self.raisedup):
                print("Head Nod")
                headNodded = True
                self.raisedup = False
                self.loweredDown = False
            else:
                self.loweredDown = True

        

        return headNodded, saidNo

        #ang2 for left and right
        #ang1 for up and down


    def draw_annotation_box(self, shape_1, rotation_vector, translation_vector, camera_matrix, color=(255, 255, 0), line_width=2):
        """Draw a 3D box as annotation of pose"""
        point_3d = []
        dist_coeffs = np.zeros((4,1))
        rear_size = 1
        rear_depth = 0
        point_3d.append((-rear_size, -rear_size, rear_depth))
        point_3d.append((-rear_size, rear_size, rear_depth))
        point_3d.append((rear_size, rear_size, rear_depth))
        point_3d.append((rear_size, -rear_size, rear_depth))
        point_3d.append((-rear_size, -rear_size, rear_depth))

        front_size = shape_1
        front_depth = front_size*2
        point_3d.append((-front_size, -front_size, front_depth))
        point_3d.append((-front_size, front_size, front_depth))
        point_3d.append((front_size, front_size, front_depth))
        point_3d.append((front_size, -front_size, front_depth))
        point_3d.append((-front_size, -front_size, front_depth))
        point_3d = np.array(point_3d, dtype=float).reshape(-1, 3)

        # Map to 2d img points
        (point_2d, _) = cv2.projectPoints(point_3d,
                                        rotation_vector,
                                        translation_vector,
                                        camera_matrix,
                                        dist_coeffs)
        point_2d = np.int32(point_2d.reshape(-1, 2))
        
        k = (point_2d[5] + point_2d[8])//2
        
        return(point_2d[2], k)
