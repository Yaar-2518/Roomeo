const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Basic Info
  age: {
    type: Number,
    required: true
  },
  dateOfBirth: {
    type: String,
    required: false
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  major: {
    type: String,
    required: true
  },
  year: {
    type: String,
    enum: ['1st', '2nd', '3rd', '4th'],
    required: true
  },
  
  // Lifestyle Preferences (Most Important - 40%)
  sleepSchedule: {
    type: String,
    enum: ['early-bird', 'night-owl', 'flexible'],
    required: true
  },
  cleanliness: {
    type: Number, // 1-5 scale
    required: true,
    min: 1,
    max: 5
  },
  noiseLevel: {
    type: String,
    enum: ['quiet', 'moderate', 'loud'],
    required: true
  },
  
  // Social Preferences (30%)
  socialLevel: {
    type: String,
    enum: ['introvert', 'ambivert', 'extrovert'],
    required: true
  },
  guestsFrequency: {
    type: String,
    enum: ['never', 'sometimes', 'often'],
    required: true
  },
  
  // Habits (30%)
  smoking: {
    type: Boolean,
    default: false
  },
  drinking: {
    type: Boolean,
    default: false
  },
  pets: {
    type: Boolean,
    default: false
  },
  
  // Interests/Hobbies (for display)
  hobbies: [String],
  
  // Budget
  budget: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Profile', profileSchema);
