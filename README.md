# DermaCare - AI-Powered Healthcare Triage Platform
## Hackathon MVP Submission by ***WuShang Clan***

> 🏥 A revolutionary healthcare MVP that combines conversational AI with medical image analysis for comprehensive symptom triage and patient support.

DermaCare is our hackathon submission - a full-stack healthcare platform MVP that leverages GPT-4o for conversational symptom collection and medical image analysis. Our solution addresses the critical need for accessible preliminary healthcare assessment by providing real-time risk scoring, personalized recommendations, and comprehensive health management tools.

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue)](https://github.com/Shreyashr41/Swalambh)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Hackathon](https://img.shields.io/badge/Hackathon-MVP%20Submission-orange)](https://github.com/Shreyashr41/Swalambh)
[![Team](https://img.shields.io/badge/Team-WuShang%20Clan-purple)](https://github.com/Shreyashr41/Swalambh)

## 👥 Team WuShang Clan

| Team Member | Role |
|-------------|------|
| **Tanmay Tikkas** | Team Leader & Full-Stack Developer |
| **Shreyash Randive** | Backend Developer & AI Integration |
| **Saksham Chikate** | Frontend Developer & UI/UX |
| **Arya Paradkar** | Database Design & API Development |
| **Anushree Palandurkar** | Testing & Quality Assurance |
| **Arshit Fulzele** | DevOps & Deployment |

## � Hackathon Problem Statement

**Challenge:** Patients often present with symptoms that are difficult to describe via text alone (e.g., a skin rash paired with a fever). General AI chatbots lack the medical "eyes" to see the issue, and general image models lack the clinical reasoning to connect a visual symptom to a medical history.

**Our Solution:** DermaCare proposes a multimodal AI triage system combining image analysis with medical context. It evaluates patient-uploaded visuals along with symptom descriptions and historical data, supporting early risk assessment and guiding users toward appropriate care.

## �🌟 Key Features

### 🤖 AI-Powered Multimodal Diagnosis
- **Conversational Chatbot**: Natural language symptom collection using GPT-4o
- **Medical Image Analysis**: Advanced visual analysis with GPT-4o Vision for skin conditions, rashes, wounds
- **Multi-modal Assessment**: Revolutionary combination of text and image data for comprehensive evaluation
- **Intelligent Risk Scoring**: 0-100 urgency scale with clinical reasoning and triage recommendations
- **Context-Aware Analysis**: Historical data integration for improved diagnostic accuracy

### 📊 Patient Management
- **Interactive Dashboard**: Real-time health statistics and consultation history
- **Health Reports**: Auto-generated PDF reports with detailed analysis
- **Reminder System**: Automated medication and appointment notifications
- **Progress Tracking**: Visualize health trends with interactive charts

### 🎨 User Experience
- **Dark Mode**: Eye-friendly interface for low-light conditions
- **Multi-language**: English, Spanish, and French support
- **Accessibility**: WCAG 2.1 compliant with screen reader support
- **Responsive Design**: Seamless experience across all devices

## 🚀 Live Demo

**Demo Credentials:**
- **Email**: demo@dermacare.ai
- **Password**: DemoPass123!

**Local Development:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🛠️ Tech Stack

### Frontend
- **React 18.2** - Modern UI framework
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **Lucide React** - Icon library
- **CSS3** - Custom styling with CSS variables

### Backend
- **Node.js + Express** - Server framework
- **TypeScript** - Type-safe development
- **MongoDB + Mongoose** - NoSQL database
- **JWT** - Secure authentication
- **bcrypt** - Password hashing
- **Multer** - File upload handling
- **PDFKit** - Report generation
- **node-cron** - Scheduled tasks

### AI & APIs
- **OpenRouter API** - AI provider gateway
- **GPT-4o** - Conversational AI & vision analysis
- **OpenAI SDK** - API integration

### DevOps
- **Git** - Version control
- **npm** - Package management
- **dotenv** - Environment configuration

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **MongoDB** 6.0+ ([Download](https://www.mongodb.com/try/download/community))
- **OpenRouter API Key** ([Get one free](https://openrouter.ai/keys))
- **Git** ([Download](https://git-scm.com/))

## 📦 Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Shreyashr41/Swalambh.git
cd Swalambh
```

### 2️⃣ Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dermacare
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
OPENROUTER_API_KEY=your-openrouter-api-key-here
NODE_ENV=development
```

**Get your OpenRouter API key:** https://openrouter.ai/keys

### 3️⃣ Frontend Setup

```bash
cd ../client
npm install
```

### 4️⃣ Start MongoDB

Make sure MongoDB is running on your system:

```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
```

## 🎬 Running the Application

### Development Mode

**Terminal 1 - Start Backend:**
```bash
cd server
npm run dev
```
✅ Backend running on http://localhost:5000

**Terminal 2 - Start Frontend:**
```bash
cd client
npm start
```
✅ Frontend running on http://localhost:3000

### Seed Demo Data (Optional)

```bash
cd server
node scripts/seedDemoUser.js
node scripts/seedDemoData.js
```

This creates a demo user with sample consultations and reports.

## 🏗️ Project Structure

```
DermaCare/
├── client/                    # React Frontend
│   ├── public/
│   │   └── index.html        # HTML template
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── Accessibility/
│   │   │   ├── Chat/
│   │   │   └── Layout/
│   │   ├── context/          # React Context providers
│   │   │   ├── AuthContext.js
│   │   │   ├── I18nContext.js
│   │   │   └── AccessibilityContext.js
│   │   ├── pages/            # Page components
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Chat.js
│   │   │   ├── Consultations.js
│   │   │   ├── Reports.js
│   │   │   └── Reminders.js
│   │   ├── services/         # API integration
│   │   │   └── api.js
│   │   ├── App.js            # Main app component
│   │   └── index.js          # Entry point
│   └── package.json
│
├── server/                    # Node.js + TypeScript Backend
│   ├── src/
│   │   ├── models/           # Mongoose schemas
│   │   │   ├── User.ts
│   │   │   ├── Consultation.ts
│   │   │   ├── Report.ts
│   │   │   └── Reminder.ts
│   │   ├── routes/           # API endpoints
│   │   │   ├── auth.ts
│   │   │   ├── chat.ts
│   │   │   ├── analysis.ts
│   │   │   ├── patient.ts
│   │   │   ├── reminder.ts
│   │   │   └── report.ts
│   │   ├── services/         # Business logic
│   │   │   ├── openaiService.ts
│   │   │   ├── reportService.ts
│   │   │   └── reminderService.ts
│   │   ├── middleware/       # Express middleware
│   │   │   ├── auth.ts
│   │   │   └── upload.ts
│   │   └── index.ts          # Server entry point
│   ├── scripts/              # Utility scripts
│   │   ├── seedDemoUser.js
│   │   └── seedDemoData.js
│   ├── .env.example          # Environment template
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore
└── README.md
```

## 🔌 API Endpoints

### 🔐 Authentication
```
POST   /api/auth/register        Register new user
POST   /api/auth/login           User login
GET    /api/auth/me              Get current user
POST   /api/auth/logout          Logout user
```

### 👤 Patient Management
```
GET    /api/patient/profile              Get user profile
PUT    /api/patient/profile              Update profile
GET    /api/patient/consultations        List all consultations
GET    /api/patient/consultations/:id    Get consultation details
GET    /api/patient/dashboard            Get dashboard statistics
```

### 💬 Chat & Consultation
```
POST   /api/chat/start                   Start new consultation
POST   /api/chat/message                 Send message in chat
GET    /api/chat/:sessionId              Get chat history
```

### 🖼️ Image Analysis
```
POST   /api/analysis/image               Upload & analyze image
GET    /api/analysis/:sessionId/result   Get analysis results
```

### ⏰ Reminders
```
GET    /api/reminders                    List all reminders
POST   /api/reminders                    Create new reminder
PUT    /api/reminders/:id                Update reminder
POST   /api/reminders/:id/complete       Mark as complete
DELETE /api/reminders/:id                Delete reminder
```

### 📄 Health Reports
```
GET    /api/reports                      List all reports
GET    /api/reports/:id                  Get report details
POST   /api/reports/generate             Generate new report
GET    /api/reports/:id/download         Download PDF report
```

## ⚙️ Environment Variables

### Backend (.env)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 5000 | No |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/dermacare | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | - | Yes |
| `JWT_EXPIRES_IN` | JWT token expiration | 7d | No |
| `OPENROUTER_API_KEY` | OpenRouter API key | - | Yes |
| `NODE_ENV` | Environment mode | development | No |

### Frontend

No environment variables required for frontend in development mode.

## ♿ Accessibility Features

DermaCare is built with accessibility in mind:

- ✅ **WCAG 2.1 AA Compliant**
- ✅ **Keyboard Navigation**: Full keyboard support
- ✅ **Screen Reader**: Proper ARIA labels and semantic HTML
- ✅ **Dark Mode**: Reduce eye strain
- ✅ **Font Size Control**: Small to Extra Large
- ✅ **Reduced Motion**: Disable animations
- ✅ **High Contrast**: Enhanced visibility
- ✅ **Skip Links**: Quick navigation

Access settings via the accessibility button (bottom-right corner).

## 🌍 Multi-language Support

| Language | Code | Status |
|----------|------|--------|
| English | en | ✅ Full |
| Spanish | es | ✅ Full |
| French | fr | ✅ Full |

Change language via the accessibility panel or header menu.

## 🔒 Security Features

- 🔐 **Password Hashing**: bcrypt with salt rounds
- 🎫 **JWT Authentication**: Secure token-based auth
- 🛡️ **Protected Routes**: Middleware authorization
- ✔️ **Input Validation**: Server-side validation
- 🌐 **CORS Configuration**: Controlled cross-origin requests
- 🔒 **Secure Headers**: Helmet.js implementation

## 🎯 Use Cases

1. **Symptom Triage**: Get preliminary health assessments before visiting a doctor
2. **Skin Condition Analysis**: Upload images for AI-powered visual diagnosis
3. **Health Tracking**: Monitor symptoms and treatment progress over time
4. **Medication Management**: Set reminders for medications and appointments
5. **Health Documentation**: Generate and download comprehensive health reports

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## � Team WuShang Clan

**Developed for Healthcare Innovation Hackathon 2026**

### Team Members
- **Tanmay Tikkas** (Team Leader) - Full-Stack Development & Project Management
- **Shreyash Randive** - Backend Architecture & AI Integration
- **Saksham Chikate** - Frontend Development & User Experience
- **Arya Paradkar** - Database Design & API Development
- **Anushree Palandurkar** - Quality Assurance & Testing
- **Arshit Fulzele** - DevOps & Deployment Strategy

### Project Repository
- GitHub: [@Shreyashr41](https://github.com/Shreyashr41)
- Repository: [Swalambh](https://github.com/Shreyashr41/Swalambh)
- Team: **WuShang Clan**

## 🏆 Hackathon MVP Highlights

### Innovation Points
- **First-of-its-kind** multimodal healthcare triage combining vision + conversation
- **Real-time AI analysis** with clinical reasoning capabilities
- **Comprehensive health ecosystem** in a single platform
- **Accessibility-first design** with multilingual support
- **Production-ready architecture** with scalable deployment

### Technical Achievements
- ✅ Full-stack implementation in 48 hours
- ✅ GPT-4o integration for both text and vision analysis
- ✅ Secure user authentication and data protection
- ✅ Real-time chat with AI-powered medical insights
- ✅ PDF report generation with clinical recommendations
- ✅ Responsive design with dark mode support

## 🙏 Acknowledgments

- OpenRouter for AI API access
- OpenAI for GPT-4o model capabilities
- MongoDB for robust database solutions
- React community for development tools
- Hackathon organizers for the opportunity to innovate

## 📞 Support & Contact

For hackathon judges, issues, questions, or suggestions:

- 🐛 [Report a Bug](https://github.com/Shreyashr41/Swalambh/issues)
- 💡 [Request a Feature](https://github.com/Shreyashr41/Swalambh/issues)
- 📧 Team Contact: wushangclan.hackathon@gmail.com (demo)
- 🏆 Hackathon Team: **WuShang Clan**

---

<div align="center">

**⭐ Star this repo if you find our MVP impressive!**

**🏆 Hackathon MVP Submission by Team WuShang Clan**

Made with ❤️ and ☕ using React, Node.js, MongoDB & GPT-4o

*"Revolutionizing healthcare accessibility through multimodal AI"*

</div>
