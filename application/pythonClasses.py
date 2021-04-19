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

    def updateSmiling(self, value):
        self.peopleSmiling = self.peopleSmiling + value

    def updateConfused(self, value):
        self.peopleConfused = self.peopleConfused + value

    def updateRaisedHands(self, value):
        self.totalRaisedHand = self.totalRaisedHand + value
