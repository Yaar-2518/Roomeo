const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Profile = require('../models/Profile');
const Request = require('../models/Request');

// Calculate compatibility score between two profiles
function calculateMatch(myProfile, otherProfile) {
  let score = 0;
  
  // Lifestyle Compatibility (40%)
  // Sleep schedule match
  if (myProfile.sleepSchedule === otherProfile.sleepSchedule) {
    score += 15;
  } else if (myProfile.sleepSchedule === 'flexible' || otherProfile.sleepSchedule === 'flexible') {
    score += 8;
  }
  
  // Cleanliness match (closer the better)
  const cleanDiff = Math.abs(myProfile.cleanliness - otherProfile.cleanliness);
  score += (5 - cleanDiff) * 3; // Max 15 points
  
  // Noise level match
  if (myProfile.noiseLevel === otherProfile.noiseLevel) {
    score += 10;
  }
  
  // Social Compatibility (30%)
  // Social level match
  if (myProfile.socialLevel === otherProfile.socialLevel) {
    score += 15;
  } else if (myProfile.socialLevel === 'ambivert' || otherProfile.socialLevel === 'ambivert') {
    score += 8;
  }
  
  // Guests frequency match
  if (myProfile.guestsFrequency === otherProfile.guestsFrequency) {
    score += 15;
  }
  
  // Habits Compatibility (30%)
  // Smoking match
  if (myProfile.smoking === otherProfile.smoking) {
    score += 10;
  }
  
  // Drinking match
  if (myProfile.drinking === otherProfile.drinking) {
    score += 10;
  }
  
  // Pets match
  if (myProfile.pets === otherProfile.pets) {
    score += 10;
  }
  
  return Math.min(Math.round(score), 100);
}

// Get matches for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Get my profile
    const myProfile = await Profile.findOne({ user: req.userId });
    
    if (!myProfile) {
      return res.status(404).json({ error: 'Please complete your profile first' });
    }

    // Get all other profiles
    const allProfiles = await Profile.find({ 
      user: { $ne: req.userId } 
    }).populate('user', 'name email');

    // Filter out profiles with deleted users and calculate match scores
    const matches = allProfiles
      .filter(profile => profile.user) // Remove profiles with null user
      .map(profile => {
        const score = calculateMatch(myProfile, profile);
        return {
          userId: profile.user._id,
          name: profile.user.name,
          age: profile.age,
          gender: profile.gender,
          major: profile.major,
          year: profile.year,
          hobbies: profile.hobbies,
          budget: profile.budget,
          score: score
        };
      });

    // Sort by score (highest first) and filter above 50%
    const goodMatches = matches
      .filter(m => m.score >= 50)
      .sort((a, b) => b.score - a.score);

    res.json({ matches: goodMatches });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

// Send a match request
router.post('/request', authMiddleware, async (req, res) => {
  try {
    const { receiverId, message } = req.body;

    // Check if request already exists
    const existing = await Request.findOne({
      sender: req.userId,
      receiver: receiverId
    });

    if (existing) {
      return res.status(400).json({ error: 'Request already sent' });
    }

    // Create request
    const request = new Request({
      sender: req.userId,
      receiver: receiverId,
      message: message || 'Hi! I think we would be great roommates!'
    });

    await request.save();

    res.json({ message: 'Request sent successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send request' });
  }
});

// Get my sent requests
router.get('/requests/sent', authMiddleware, async (req, res) => {
  try {
    const requests = await Request.find({ sender: req.userId })
      .populate('receiver', 'name email')
      .sort('-createdAt');

    // Filter out requests where receiver was deleted
    const validRequests = requests.filter(r => r.receiver);

    res.json({ requests: validRequests });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Get requests received
router.get('/requests/received', authMiddleware, async (req, res) => {
  try {
    const requests = await Request.find({ 
      receiver: req.userId,
      status: 'pending'
    })
      .populate('sender', 'name email phone')
      .sort('-createdAt');

    // Filter out requests where sender was deleted
    const validRequests = requests.filter(r => r.sender);

    res.json({ requests: validRequests });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Accept/Reject request
router.put('/requests/:requestId', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'

    const request = await Request.findOne({
      _id: req.params.requestId,
      receiver: req.userId
    }).populate('sender', 'name email phone');

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    request.status = status;
    await request.save();

    res.json({
      message: `Request ${status}!`,
      request
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update request' });
  }
});

// Get accepted matches (to view contact info)
router.get('/accepted', authMiddleware, async (req, res) => {
  try {
    const requests = await Request.find({
      $or: [
        { sender: req.userId, status: 'accepted' },
        { receiver: req.userId, status: 'accepted' }
      ]
    })
      .populate('sender', 'name email phone')
      .populate('receiver', 'name email phone');

    // Filter out matches where either user was deleted
    const validMatches = requests.filter(r => r.sender && r.receiver);

    res.json({ matches: validMatches });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch accepted matches' });
  }
});

module.exports = router;
