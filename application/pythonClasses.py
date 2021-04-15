class Session:
    def __init__(self):
        # Class Properties
        # Subject to change
        self.title = ""
        self.peopleSmiling = 0
        self.peopleSurprised = 0
        self.peopleEyeBrowRaised = 0
        self.overalMood = 0

    def increaseSmile(self):
        self.peopleSmiling = self.peopleSmiling + 1
    
    def decreaseSmile(self):
        self.peopleSmiling = self.peopleSmiling - 1 
    
    def getTotalSmiling(self):
        return self.peopleSmiling

