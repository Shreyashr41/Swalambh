require('ts-node/register');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Define schemas inline
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  dateOfBirth: Date,
}, { timestamps: true });

const consultationSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  sessionId: String,
  messages: Array,
  status: String,
  analysisResult: Object,
}, { timestamps: true });

const reportSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  consultationId: mongoose.Schema.Types.ObjectId,
  title: String,
  type: String,
  content: Object,
  generatedAt: Date,
}, { timestamps: true });

const reminderSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  type: String,
  title: String,
  description: String,
  datetime: Date,
  isCompleted: Boolean,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Consultation = mongoose.models.Consultation || mongoose.model('Consultation', consultationSchema);
const Report = mongoose.models.Report || mongoose.model('Report', reportSchema);
const Reminder = mongoose.models.Reminder || mongoose.model('Reminder', reminderSchema);

const TANMAY_EMAIL = 'tanmay@example.com';

const consultationData = {
  messages: [
    {
      role: 'assistant',
      content: "Hello! I'm DermaCare. How can I help you today?",
    },
    {
      role: 'user',
      content: "Hi, I've been experiencing persistent itching on my scalp for the past week.",
    },
    {
      role: 'assistant',
      content: "I understand that must be uncomfortable. Can you tell me more about the itching? Is it accompanied by any redness, flaking, or visible changes to your scalp?",
    },
    {
      role: 'user',
      content: "Yes, there are some white flakes and the scalp looks a bit red in some areas.",
    },
    {
      role: 'assistant',
      content: "Thank you for sharing that. Have you noticed any other symptoms like hair loss, or does the itching get worse at certain times of the day?",
    },
    {
      role: 'user',
      content: "The itching is worse at night. No hair loss though.",
    },
    {
      role: 'assistant',
      content: "Based on your symptoms - itching, white flakes, redness, and worsening at night - this could be seborrheic dermatitis or dandruff. I recommend:\n\n1. Use a medicated anti-dandruff shampoo with zinc pyrithione or ketoconazole\n2. Avoid scratching to prevent further irritation\n3. Keep your scalp clean and dry\n4. If symptoms persist for more than 2 weeks, consult a dermatologist\n\nWould you like me to provide more information?",
    },
  ],
  analysisResult: {
    riskLevel: 'low',
    urgencyScore: 20,
    confidenceScore: 82,
    detectedConditions: ['Seborrheic Dermatitis', 'Dandruff'],
    recommendations: [
      'Use medicated anti-dandruff shampoo (zinc pyrithione or ketoconazole)',
      'Avoid scratching the scalp',
      'Keep scalp clean and dry',
      'Consult dermatologist if symptoms persist beyond 2 weeks',
      'Consider dietary changes - reduce sugar and processed foods',
    ],
    followUpQuestions: [],
    summary: 'Patient presents with scalp itching, white flakes, and redness worsening at night. Symptoms consistent with seborrheic dermatitis or dandruff. Low-risk condition manageable with over-the-counter treatments.',
  },
};

const reminderData = [
  {
    type: 'appointment',
    title: 'Follow-up Dermatology Consultation',
    description: 'Check scalp condition improvement after treatment',
    datetime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    isCompleted: false,
  },
  {
    type: 'medication',
    title: 'Apply Anti-Dandruff Shampoo',
    description: 'Use ketoconazole shampoo - apply and leave for 5 minutes before rinsing',
    datetime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // tomorrow
    isCompleted: false,
  },
];

async function seedTanmayData() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dermacare';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find user - try different possible email formats
    let user = await User.findOne({ 
      $or: [
        { email: TANMAY_EMAIL },
        { email: `${TANMAY_EMAIL}@dermacare.ai` },
        { email: `${TANMAY_EMAIL}@gmail.com` },
        { name: { $regex: new RegExp(TANMAY_EMAIL, 'i') } }
      ]
    });

    if (!user) {
      console.log('❌ User "tanmay" not found. Please check the email or username.');
      console.log('💡 Tip: Check what email was used during registration');
      await mongoose.connection.close();
      return;
    }

    console.log(`✅ Found user: ${user.email}`);

    // Create consultation
    const sessionId = `tanmay-session-${Date.now()}`;
    const consultation = new Consultation({
      userId: user._id,
      sessionId,
      messages: consultationData.messages,
      status: 'completed',
      analysisResult: consultationData.analysisResult,
    });
    await consultation.save();
    console.log('✅ Created consultation with scalp itching case');

    // Create health report
    const report = new Report({
      userId: user._id,
      consultationId: consultation._id,
      title: 'DermaCare Health Summary - Scalp Condition',
      type: 'consultation',
      content: {
        patientInfo: {
          name: user.name || 'Tanmay',
          email: user.email,
          dateOfBirth: user.dateOfBirth || 'Not provided',
        },
        consultationSummary: {
          date: new Date().toISOString(),
          chiefComplaint: 'Persistent scalp itching with white flakes',
          symptoms: ['Itching', 'White flakes', 'Redness', 'Worsening at night'],
          duration: '1 week',
        },
        analysis: consultationData.analysisResult,
        recommendations: consultationData.analysisResult.recommendations,
        nextSteps: [
          'Start OTC anti-dandruff treatment',
          'Monitor symptoms for 2 weeks',
          'Schedule follow-up if no improvement',
        ],
      },
      generatedAt: new Date(),
    });
    await report.save();
    console.log('✅ Created health report');

    // Create reminders
    for (const reminderInfo of reminderData) {
      const reminder = new Reminder({
        userId: user._id,
        ...reminderInfo,
      });
      await reminder.save();
      console.log(`✅ Created reminder: ${reminderInfo.title}`);
    }

    console.log('\n🎉 Successfully seeded mock data for Tanmay!');
    console.log('\n📊 Summary:');
    console.log(`   • User: ${user.email}`);
    console.log(`   • Consultations: 1 (scalp itching case)`);
    console.log(`   • Reports: 1`);
    console.log(`   • Reminders: ${reminderData.length}`);
    console.log('\n✅ Tanmay can now login and view all this data!\n');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedTanmayData();
