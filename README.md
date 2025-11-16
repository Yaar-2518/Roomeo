# Roommate Finder App

A mobile application built with React Native (Expo) and Node.js backend to help students find compatible roommates based on lifestyle preferences.

## Features

- 🔐 **Email Verification with OTP** - Secure registration with email verification
- 📝 **Detailed Questionnaire** - Multi-step onboarding to capture preferences
- 🤝 **Smart Matching** - Algorithm-based roommate matching
- 💬 **Request System** - Send and receive roommate requests
- 👤 **Profile Management** - Edit and customize your profile
- 🌓 **Dark/Light Mode** - Beautiful gradients in both themes
- 🏷️ **Tag-based Selection** - Easy hobby and interest selection

## Tech Stack

### Frontend (Mobile)
- **React Native** with Expo SDK 52
- **React Navigation** for screen management
- **AsyncStorage** for local data persistence
- **Expo Linear Gradient** for beautiful UI
- **DateTimePicker** for date selection

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Nodemailer** for email verification
- **Bcrypt** for password hashing

## Project Structure

```
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth middleware
│   ├── utils/           # Email utilities
│   └── server.js        # Server entry point
│
└── mobile/
    ├── src/
    │   ├── contexts/    # React contexts (Auth, Theme)
    │   ├── screens/     # App screens
    │   └── api.js       # API configuration
    └── App.js           # App entry point
```

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- Expo Go app on your phone
- Gmail account for email verification

### Backend Setup

1. Navigate to backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from example:
   ```bash
   cp .env.example .env
   ```

4. Configure `.env` file:
   - Add your MongoDB connection string
   - Generate a secure JWT secret
   - Add Gmail credentials (use App Password, not regular password)
   - Get App Password: https://myaccount.google.com/apppasswords

5. Start the server:
   ```bash
   npm run dev
   ```

### Mobile Setup

1. Navigate to mobile folder:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from example:
   ```bash
   cp .env.example .env
   ```

4. Configure `.env` file:
   - Find your local IP address:
     - **Windows**: `ipconfig` (look for IPv4 Address)
     - **Mac/Linux**: `ifconfig` (look for inet)
   - Update `API_URL=http://YOUR_IP:5001/api`

5. Start Expo:
   ```bash
   npx expo start
   ```

6. Scan QR code with Expo Go app

## Environment Variables

### Backend (.env)
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_app_password
PORT=5001
```

### Mobile (.env)
```
API_URL=http://YOUR_LOCAL_IP:5001/api
```

## Important Notes

⚠️ **Before Deployment:**
- Never commit `.env` files to GitHub
- Generate strong JWT secrets for production
- Use MongoDB Atlas for production database
- Configure proper CORS settings
- Use environment-specific API URLs

⚠️ **Gmail App Password:**
- Do NOT use your regular Gmail password
- Create an App Password: https://myaccount.google.com/apppasswords
- Enable 2-factor authentication on your Google account first

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP
- `PUT /api/auth/update-name` - Update user name
- `DELETE /api/auth/delete-account` - Delete account

### Profile
- `POST /api/profile` - Create profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile

### Matches
- `GET /api/matches` - Get potential matches
- `GET /api/matches/requests/sent` - Get sent requests
- `GET /api/matches/requests/received` - Get received requests
- `GET /api/matches/accepted` - Get accepted matches
- `POST /api/matches/request/:profileId` - Send request
- `PUT /api/matches/request/:requestId/accept` - Accept request
- `PUT /api/matches/request/:requestId/reject` - Reject request

## Matching Algorithm

The app matches users based on:
- Age compatibility
- Gender preference
- Major/field of study
- Year of study
- Sleep schedule
- Cleanliness level
- Noise tolerance
- Social preferences
- Guest frequency
- Smoking/drinking/pet preferences
- Budget range
- Shared hobbies

## Screenshots

[Add screenshots here]

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is created for educational purposes.

## Authors

[Your Name/Team Name]

## Acknowledgments

- Expo team for the amazing framework
- MongoDB for the database
- React Native community
