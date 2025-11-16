const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Roommate Finder - Email Verification OTP',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #667eea;">Roommate Finder</h2>
        <p>Your OTP for email verification is:</p>
        <h1 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                   color: white; 
                   padding: 20px; 
                   text-align: center; 
                   border-radius: 10px;
                   letter-spacing: 5px;">
          ${otp}
        </h1>
        <p style="color: #666;">This OTP will expire in 10 minutes.</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          If you didn't request this OTP, please ignore this email.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};

module.exports = { generateOTP, sendOTPEmail };
