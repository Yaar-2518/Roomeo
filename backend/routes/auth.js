const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { generateOTP, sendOTPEmail } = require('../utils/email');
const authMiddleware = require('../middleware/auth');

// Send OTP for registration
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Generate OTP
    const otp = generateOTP();

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email });

    // Save OTP to database
    const otpDoc = new OTP({ email, otp });
    await otpDoc.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp);
    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to send OTP email' });
    }

    res.json({ message: 'OTP sent successfully to your email' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP and register user
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find OTP
    const otpDoc = await OTP.findOne({ email, otp });
    if (!otpDoc) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Delete OTP after verification
    await OTP.deleteOne({ _id: otpDoc._id });

    res.json({ message: 'OTP verified successfully', verified: true });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// Register new user (after OTP verification)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, otpVerified } = req.body;

    // Check OTP verification
    if (!otpVerified) {
      return res.status(400).json({ error: 'Please verify your email first' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create user
    const user = new User({ name, email, password, isVerified: true });
    await user.save();

    // Create token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    res.status(201).json({
      message: 'Registration successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hasCompletedProfile: user.hasCompletedProfile,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Create token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hasCompletedProfile: user.hasCompletedProfile
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Update user name
router.put('/update-name', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.userId; // From auth middleware

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Name updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hasCompletedProfile: user.hasCompletedProfile
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update name' });
  }
});

// Delete account
router.delete('/delete-account', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware

    // Also delete the user's profile if it exists
    const Profile = require('../models/Profile');
    await Profile.findOneAndDelete({ user: userId });

    // Delete all requests involving this user
    const Request = require('../models/Request');
    await Request.deleteMany({ $or: [{ sender: userId }, { receiver: userId }] });

    // Find and delete user
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

module.exports = router;
