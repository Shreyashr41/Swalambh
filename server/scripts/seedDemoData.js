require('dotenv').config();
require('ts-node/register/transpile-only');
const mongoose = require('mongoose');
const { User } = require('../src/models/User');
const { Consultation } = require('../src/models/Consultation');
const { Report } = require('../src/models/Report');
const { Reminder } = require('../src/models/Reminder');

const DEMO_EMAIL = 'demo@dermacare.ai';

const demoConversation = [
  {
    role: 'assistant',
    content: "Hello! I'm DermaCare. How can I help you today?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    role: 'user',
    content: 'I have a red itchy patch on my forearm that started last week.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 20000),
  },
  {
    role: 'assistant',
    content: 'Thanks for sharing. Has it changed in size or appearance since it started? Any new products or exposures?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 40000),
  },
  {
    role: 'user',
    content: 'It is a bit larger and more itchy. I used a new detergent recently.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 60000),
  },
  {
    role: 'assistant',
    content: 'This could be irritation or contact dermatitis. I recommend avoiding the new detergent and monitoring changes. If it worsens, please see a clinician.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 90000),
  },
];

async function run() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dermacare';

  try {
    await mongoose.connect(mongoUri);

    const user = await User.findOne({ email: DEMO_EMAIL });
    if (!user) {
      console.log('Demo user not found. Run seedDemoUser.js first.');
      return;
    }

    let consultation = await Consultation.findOne({ userId: user._id }).sort({ createdAt: -1 });
    if (!consultation) {
      consultation = await Consultation.create({
        userId: user._id,
        sessionId: `demo-session-${Date.now()}`,
        status: 'completed',
        messages: demoConversation,
        symptoms: [
          {
            description: 'Red itchy patch on forearm',
            duration: '1 week',
            severity: 'moderate',
            location: 'Right forearm',
            additionalNotes: 'Started after switching laundry detergent',
          },
        ],
        uploadedImages: [],
        analysisResult: {
          riskLevel: 'low',
          urgencyScore: 25,
          confidenceScore: 78,
          detectedConditions: ['Contact dermatitis', 'Mild eczema flare'],
          affectedAreas: [
            {
              x: 28,
              y: 40,
              width: 22,
              height: 15,
              label: 'Irritated patch',
              confidence: 85,
            },
          ],
          recommendations: [
            'Avoid the new detergent and any fragranced products',
            'Apply a gentle moisturizer twice daily',
            'Use OTC hydrocortisone for short-term relief',
            'Seek care if the area spreads or becomes painful',
          ],
          followUpQuestions: [
            'Have you used any new soaps or lotions?',
            'Is the area warm, swollen, or painful?',
          ],
          analysisTimestamp: new Date(),
        },
        followUpScheduled: true,
        doctorReferred: false,
        notes: 'Demo consultation for hackathon MVP.',
      });
      console.log('Created demo consultation:', consultation.sessionId);
    } else {
      console.log('Existing consultation found:', consultation.sessionId);
    }

    const reportExists = await Report.findOne({ consultationId: consultation._id });
    if (!reportExists) {
      await Report.create({
        userId: user._id,
        consultationId: consultation._id,
        reportId: `report-${Date.now()}`,
        title: 'DermaCare Health Summary - Demo',
        generatedAt: new Date(),
        content: {
          patientInfo: {
            name: `${user.firstName} ${user.lastName}`,
            age: 31,
            gender: user.gender,
          },
          symptoms: [
            {
              description: 'Red itchy patch on forearm',
              duration: '1 week',
              severity: 'moderate',
            },
          ],
          images: [
            {
              url: '',
              analysis: 'No images uploaded in demo.',
            },
          ],
          analysisResults: {
            riskLevel: 'low',
            urgencyScore: 25,
            confidenceScore: 78,
            detectedConditions: ['Contact dermatitis', 'Mild eczema flare'],
            recommendations: [
              'Avoid irritants',
              'Moisturize daily',
              'Monitor symptoms',
            ],
          },
          timeline: [
            {
              date: new Date(Date.now() - 1000 * 60 * 60 * 2),
              event: 'Consultation Started',
              details: 'User reported symptoms and history.',
            },
            {
              date: new Date(Date.now() - 1000 * 60 * 60 * 1),
              event: 'AI Assessment',
              details: 'Low risk assessment with home care guidance.',
            },
          ],
        },
        pdfUrl: null,
        sharedWith: [],
        isDownloaded: false,
      });
      console.log('Created demo report.');
    } else {
      console.log('Demo report already exists.');
    }

    const reminderExists = await Reminder.findOne({ userId: user._id });
    if (!reminderExists) {
      await Reminder.create({
        userId: user._id,
        type: 'appointment',
        title: 'Dermatology Follow-Up',
        description: 'Follow-up appointment if symptoms persist.',
        scheduledTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
        frequency: 'once',
        isActive: true,
        isCompleted: false,
        completedAt: null,
        notificationSent: false,
        relatedConsultation: consultation._id,
        medicationDetails: null,
        appointmentDetails: {
          doctorName: 'Dr. Rivera',
          location: 'Community Health Clinic',
          purpose: 'Skin irritation follow-up',
        },
      });
      console.log('Created demo reminder.');
    } else {
      console.log('Demo reminder already exists.');
    }
  } catch (error) {
    console.error('Failed to seed demo data:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

run();
