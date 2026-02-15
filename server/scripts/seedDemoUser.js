require('dotenv').config();
require('ts-node/register/transpile-only');
const mongoose = require('mongoose');
const { User } = require('../src/models/User');

const DEMO_USER = {
  email: 'demo@dermacare.ai',
  password: 'DemoPass123!',
  firstName: 'Demo',
  lastName: 'User',
  dateOfBirth: new Date('1994-06-12'),
  gender: 'other',
  phone: '+1-555-0100',
  address: '123 Hackathon Ave, Innovation City',
  emergencyContact: {
    name: 'Alex Demo',
    phone: '+1-555-0101',
    relationship: 'Friend',
  },
  medicalHistory: {
    allergies: ['pollen'],
    chronicConditions: ['eczema'],
    currentMedications: ['hydrocortisone cream'],
    bloodType: 'O+',
  },
  preferredLanguage: 'en',
};

async function run() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dermacare';

  try {
    await mongoose.connect(mongoUri);

    const existing = await User.findOne({ email: DEMO_USER.email });
    if (existing) {
      console.log('Demo user already exists:', DEMO_USER.email);
      return;
    }

    const user = new User(DEMO_USER);
    await user.save();

    console.log('Demo user created:', DEMO_USER.email);
  } catch (error) {
    console.error('Failed to seed demo user:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

run();
