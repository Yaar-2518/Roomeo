const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Profile = require('../models/Profile');
const User = require('../models/User');

// Create/Update profile (after questionnaire)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const profileData = {
      ...req.body,
      user: req.userId
    };

    // Check if profile exists
    let profile = await Profile.findOne({ user: req.userId });
    
    if (profile) {
      // Update existing profile
      profile = await Profile.findOneAndUpdate(
        { user: req.userId },
        profileData,
        { new: true }
      );
    } else {
      // Create new profile
      profile = new Profile(profileData);
      await profile.save();
      
      // Link profile to user
      await User.findByIdAndUpdate(req.userId, { profile: profile._id });
    }

    // Update user's hasCompletedProfile flag
    await User.findByIdAndUpdate(req.userId, { hasCompletedProfile: true });

    res.json({
      message: 'Profile saved successfully!',
      profile
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

// Get my profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.userId });
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ profile });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Get another user's profile
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.userId })
      .populate('user', 'name email phone');
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ profile });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update profile
router.put('/', authMiddleware, async (req, res) => {
  try {
    const profileData = {
      ...req.body,
      user: req.userId
    };

    let profile = await Profile.findOneAndUpdate(
      { user: req.userId },
      profileData,
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({
      message: 'Profile updated successfully!',
      profile
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
