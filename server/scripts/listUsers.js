require('ts-node/register');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Define User schema inline
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function listUsers() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dermacare';
    await mongoose.connect(mongoUri);
    const users = await User.find({}, 'name email').limit(20);
    console.log('\n📋 Users in database:\n');
    users.forEach(u => {
      console.log(`  • ${u.name || 'No name'} - ${u.email}`);
    });
    console.log(`\n✅ Total users: ${users.length}\n`);
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

listUsers();
