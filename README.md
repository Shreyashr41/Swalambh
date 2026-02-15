# DermaCare - AI-Powered Healthcare Triage Platform

DermaCare is a comprehensive AI-powered healthcare triage and patient support platform that provides conversational symptom collection, medical image analysis, multimodal risk assessment, and personalized health management features.

## Features

### Core Features
- **Conversational AI Chatbot**: Natural language symptom collection using GPT-4 Turbo
- **Medical Image Analysis**: Visual analysis of skin conditions with highlighted areas using GPT-4 Vision
- **Multimodal Risk Assessment**: Combines symptom data with image analysis for comprehensive risk scoring
- **Patient Dashboard**: Overview of consultations, reminders, and health statistics
- **Symptom Progress Tracking**: Visualize health trends over time with interactive charts

### Additional Features
- **Medication & Appointment Reminders**: Schedule and manage health reminders
- **AI-Generated Health Reports**: Downloadable PDF reports with analysis summaries
- **Emergency Risk Detection**: Flagging of high-urgency cases
- **Multi-language Support**: English, Spanish, and French translations
- **Accessibility Features**: Dark mode, font size controls, reduced motion, high contrast

## Tech Stack

### Backend
- Node.js + Express.js
- TypeScript
- MongoDB with Mongoose ODM
- JWT Authentication
- OpenAI API (GPT-4 Turbo + GPT-4 Vision)
- Node-cron for scheduled tasks
- Multer for file uploads

### Frontend
- React 18
- React Router DOM v6
- Recharts for data visualization
- Lucide React icons
- Axios for API calls
- Context API for state management

## Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- OpenAI API Key
- npm or yarn

## Project Structure

```
DermaCare/
├── server/                 # Backend API
│   ├── src/
│   │   ├── models/        # MongoDB schemas
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Auth, upload middleware
│   │   └── index.ts       # Server entry point
│   ├── package.json
│   └── tsconfig.json
│
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/       # Auth, I18n, Accessibility contexts
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
└── README.md
```

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd DermaCare
```

### 2. Setup Backend

```bash
cd server
npm install
```

Create a `.env` file in the server directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dermacare
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=your-openai-api-key
NODE_ENV=development
```

### 3. Setup Frontend

```bash
cd ../client
npm install
```

## Running the Application

### Development Mode

**Start the backend server:**
```bash
cd server
npm run dev
```

**Start the frontend (in a new terminal):**
```bash
cd client
npm start
```

### Production Build

**Build the frontend:**
```bash
cd client
npm run build
```

**Build and start the backend:**
```bash
cd server
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Patient
- `GET /api/patient/profile` - Get patient profile
- `PUT /api/patient/profile` - Update profile
- `GET /api/patient/consultations` - Get all consultations
- `GET /api/patient/consultations/:id` - Get single consultation
- `GET /api/patient/dashboard` - Get dashboard stats

### Chat/Consultation
- `POST /api/chat/start` - Start new consultation
- `POST /api/chat/message` - Send message
- `GET /api/chat/:sessionId` - Get chat history

### Image Analysis
- `POST /api/analysis/image` - Analyze uploaded image
- `GET /api/analysis/:sessionId/result` - Get analysis result

### Reminders
- `GET /api/reminders` - Get all reminders
- `POST /api/reminders` - Create reminder
- `PUT /api/reminders/:id` - Update reminder
- `POST /api/reminders/:id/complete` - Mark complete
- `DELETE /api/reminders/:id` - Delete reminder

### Reports
- `GET /api/reports` - Get all reports
- `GET /api/reports/:id` - Get single report
- `POST /api/reports/generate` - Generate new report
- `GET /api/reports/:id/download` - Download PDF

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| PORT | Server port (default: 5000) | No |
| MONGODB_URI | MongoDB connection string | Yes |
| JWT_SECRET | Secret key for JWT tokens | Yes |
| JWT_EXPIRES_IN | JWT expiration time | No |
| OPENAI_API_KEY | OpenAI API key | Yes |
| NODE_ENV | Environment mode | No |

## Accessibility Features

DermaCare includes comprehensive accessibility support:

- **Skip to Content**: Skip link for keyboard navigation
- **Dark Mode**: Reduces eye strain in low-light conditions
- **Font Size Controls**: Adjustable text size (small to x-large)
- **Reduced Motion**: Disables animations for users sensitive to motion
- **High Contrast**: Increased contrast for better visibility
- **Screen Reader Support**: Proper ARIA labels throughout
- **Keyboard Navigation**: Full keyboard accessibility

Access these settings via the accessibility button (bottom-right corner).

## Multi-language Support

Currently supported languages:
- English (en)
- Spanish (es)
- French (fr)

Change language via the accessibility panel.

## Security Considerations

- All passwords are hashed using bcrypt
- JWT tokens for authentication
- Protected routes middleware
- Input validation on all endpoints
- CORS configuration for production

## License

MIT License

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
