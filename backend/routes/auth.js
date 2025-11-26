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

    console.log('Send OTP request for:', email);

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Generate OTP
    const otp = generateOTP();
    console.log('Generated OTP:', otp);

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email });

    // Save OTP to database
    const otpDoc = new OTP({ email, otp });
    await otpDoc.save();
    console.log('OTP saved to database');

    // Send OTP email
    console.log('Attempting to send email...');
    const emailSent = await sendOTPEmail(email, otp);
    
    if (!emailSent) {
      console.log('⚠️ Email failed, but OTP saved. OTP:', otp);
      // Return success anyway for development - OTP is logged
      return res.json({ 
        message: 'OTP generated (check server console)',
        devNote: 'Email service unavailable, OTP logged in server console'
      });
    }

    console.log('✓ OTP sent successfully');
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

    console.log('Login attempt for:', email);

    // Find user and populate profile
    const user = await User.findOne({ email }).populate('profile');
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log('User found, checking password...');

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch for:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    console.log('Password correct, generating token...');

    // Create token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    console.log('✓ Login successful for:', email);

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hasCompletedProfile: user.hasCompletedProfile,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Login error:', error);
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

// Send OTP for password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    console.log('Forgot password request for:', email);

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email' });
    }

    // Generate OTP
    const otp = generateOTP();
    console.log('Generated password reset OTP:', otp);

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email });

    // Save OTP to database
    const otpDoc = new OTP({ email, otp });
    await otpDoc.save();
    console.log('Password reset OTP saved to database');

    // Send OTP email
    console.log('Attempting to send password reset email...');
    const emailSent = await sendOTPEmail(email, otp, 'Password Reset');
    
    if (!emailSent) {
      console.log('⚠️ Email failed, but OTP saved. OTP:', otp);
      return res.json({ 
        message: 'OTP generated (check server console)',
        devNote: 'Email service unavailable, OTP logged in server console'
      });
    }

    console.log('✓ Password reset OTP sent successfully');
    res.json({ message: 'Password reset OTP sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to send password reset OTP' });
  }
});

// Verify OTP for password reset
router.post('/verify-reset-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find OTP
    const otpDoc = await OTP.findOne({ email, otp });
    if (!otpDoc) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    res.json({ message: 'OTP verified successfully', verified: true });
  } catch (error) {
    console.error('Verify reset OTP error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// Reset password (after OTP verification)
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Verify OTP one more time
    const otpDoc = await OTP.findOne({ email, otp });
    if (!otpDoc) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    // Delete OTP after successful password reset
    await OTP.deleteOne({ _id: otpDoc._id });

    console.log('✓ Password reset successful for:', email);
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
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
