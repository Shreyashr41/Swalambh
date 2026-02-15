import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      phone,
      address,
    } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      phone,
      address,
      medicalHistory: {
        allergies: [],
        chronicConditions: [],
        currentMedications: [],
        bloodType: '',
      },
    });

    await user.save();

    // Generate token
    const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate token
    const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to login',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    res.json({
      success: true,
      user: {
        id: user?._id,
        email: user?.email,
        firstName: user?.firstName,
        lastName: user?.lastName,
        dateOfBirth: user?.dateOfBirth,
        gender: user?.gender,
        phone: user?.phone,
        address: user?.address,
        emergencyContact: user?.emergencyContact,
        medicalHistory: user?.medicalHistory,
        preferredLanguage: user?.preferredLanguage,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user data',
    });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const updates = req.body;
    const userId = req.userId;

    // Remove fields that shouldn't be updated directly
    delete updates.password;
    delete updates.email;

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
    });
  }
});

// Update medical history
router.put('/medical-history', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { allergies, chronicConditions, currentMedications, bloodType } = req.body;
    const userId = req.userId;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        medicalHistory: {
          allergies: allergies || [],
          chronicConditions: chronicConditions || [],
          currentMedications: currentMedications || [],
          bloodType: bloodType || '',
        },
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'Medical history updated successfully',
      medicalHistory: user.medicalHistory,
    });
  } catch (error) {
    console.error('Update medical history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update medical history',
    });
  }
});

// Change password
router.put('/change-password', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
    });
  }
});

export default router;
