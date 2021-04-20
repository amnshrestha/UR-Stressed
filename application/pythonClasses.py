import numpy as np

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

        #Possible future implementation
        self.peopleSurprised = 0
        self.peopleEyeBrowRaised = 0
        self.overalMood = 0

    # Methods to change smiling
    def increaseSmile(self):
        self.peopleSmiling = self.peopleSmiling + 1
    
    def decreaseSmile(self):
        self.peopleSmiling = self.peopleSmiling - 1 
    
    def getTotalSmiling(self):
        return self.peopleSmiling

    # Methods to change confused
    def increaseConfused(self):
        self.peopleConfused = self.peopleConfused + 1
    
    def decreaseConfused(self):
        self.peopleConfused = self.peopleConfused - 1 
    
    def getTotalConfused(self):
        return self.peopleConfused

    # Methods to change Raised Hand
    def increaseTotalRaisedHand(self):
        self.totalRaisedHand = self.totalRaisedHand + 1
    
    def decreaseTotalRaisedHand(self):
        self.totalRaisedHand = self.totalRaisedHand - 1 
    
    def getTotalRaisedHand(self):
        return self.totalRaisedHand


class HeadMovementDetection:
    def __init__(self, coordinates, imageShape):
        self.model_points = np.array([
                            (0.0, 0.0, 0.0),             # Nose tip
                            (0.0, -330.0, -65.0),        # Chin
                            (-225.0, 170.0, -135.0),     # Left eye left corner
                            (225.0, 170.0, -135.0),      # Right eye right corne
                            (-150.0, -150.0, -125.0),    # Left Mouth corner
                            (150.0, -150.0, -125.0)      # Right mouth corner
                        ])

        self.image_points = np.array([
                                    coordinates[0],     # Nose tip
                                    coordinates[1],     # Chin
                                    coordinates[2],     # Left eye left corner
                                    coordinates[3],     # Right eye right corne
                                    coordinates[4],     # Left Mouth corner
                                    coordinates[5]      # Right mouth corner
                                ], dtype="double")
        self.dist_coeffs = np.zeros((4,1)) # Assuming no lens distortion
        
        # height, width
        self.focal_length = imageShape[1]
        self.center = (imageShape[1]/2, imageShape[0]/2)
        self.camera_matrix = np.array(
                         [[focal_length, 0, center[0]],
                         [0, focal_length, center[1]],
                         [0, 0, 1]], dtype = "double"
                         )
    
    def calculate():
        (success, rotation_vector, translation_vector) = cv2.solvePnP(self.model_points, self.image_points, self.camera_matrix, self.dist_coeffs, flags=cv2.SOLVEPNP_UPNP)
        (nose_end_point2D, jacobian) = cv2.projectPoints(np.array([(0.0, 0.0, 1000.0)]), rotation_vector, translation_vector, self.camera_matrix, self.dist_coeffs)
        p1 = ( int(image_points[0][0]), int(image_points[0][1]))
        p2 = ( int(nose_end_point2D[0][0][0]), int(nose_end_point2D[0][0][1]))
        x1, x2 = draw_annotation_box(image, rotation_vector, translation_vector, camera_matrix)
        try:
            m = (p2[1] - p1[1])/(p2[0] - p1[0])
            print(m)
            ang1 = int(math.degrees(math.atan(m)))
            print(ang1)
        except:
            ang1 = 90
                
        try:
            m = (x2[1] - x1[1])/(x2[0] - x1[0])
            ang2 = int(math.degrees(math.atan(-1/m)))
        except:
            ang2 = 90

        print(ang1, " " ,ang2)


    def draw_annotation_box(img, rotation_vector, translation_vector, camera_matrix, color=(255, 255, 0), line_width=2):
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

        front_size = img.shape[1]
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
        

        # # Draw all the lines
        # cv2.polylines(img, [point_2d], True, color, line_width, cv2.LINE_AA)
        k = (point_2d[5] + point_2d[8])//2
        # cv2.line(img, tuple(point_2d[1]), tuple(
        #     point_2d[6]), color, line_width, cv2.LINE_AA)
        # cv2.line(img, tuple(point_2d[2]), tuple(
        #     point_2d[7]), color, line_width, cv2.LINE_AA)
        # cv2.line(img, tuple(point_2d[3]), tuple(
        #     point_2d[8]), color, line_width, cv2.LINE_AA)
        
        return(point_2d[2], k)