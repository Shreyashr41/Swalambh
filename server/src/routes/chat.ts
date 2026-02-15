import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Consultation } from '../models';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { chatService } from '../services/openaiService';

const router = express.Router();

// Start new chat session
router.post('/start', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;

    // Generate session ID
    const sessionId = `SESS-${uuidv4().slice(0, 8).toUpperCase()}`;

    // Get welcome message from AI
    const welcomeMessage = await chatService.startConversation();

    // Create new consultation
    const consultation = new Consultation({
      userId,
      sessionId,
      status: 'active',
      messages: [
        {
          role: 'assistant',
          content: welcomeMessage,
          timestamp: new Date(),
        },
      ],
      symptoms: [],
      uploadedImages: [],
      analysisResult: null,
    });

    await consultation.save();

    res.status(201).json({
      success: true,
      data: {
        sessionId,
        consultationId: consultation._id,
        message: welcomeMessage,
      },
    });
  } catch (error) {
    console.error('Start chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start chat session',
    });
  }
});

// Send message in chat
router.post('/message', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { consultationId, message } = req.body;
    const userId = req.userId;

    // Find consultation
    const consultation = await Consultation.findOne({
      _id: consultationId,
      userId,
    });

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found',
      });
    }

    // Add user message
    consultation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    // Get AI response
    const aiResponse = await chatService.sendMessage(
      consultation.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      message
    );

    // Add AI response
    consultation.messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
    });

    await consultation.save();

    res.json({
      success: true,
      data: {
        message: aiResponse,
        messageCount: consultation.messages.length,
      },
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
    });
  }
});

// Get follow-up questions
router.post('/follow-up-questions', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { symptoms } = req.body;

    const questions = await chatService.generateFollowUpQuestions(symptoms);

    res.json({
      success: true,
      data: {
        questions,
      },
    });
  } catch (error) {
    console.error('Follow-up questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate follow-up questions',
    });
  }
});

// Add symptom to consultation
router.post('/symptom', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { consultationId, symptom } = req.body;
    const userId = req.userId;

    const consultation = await Consultation.findOne({
      _id: consultationId,
      userId,
    });

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found',
      });
    }

    consultation.symptoms.push(symptom);
    await consultation.save();

    res.json({
      success: true,
      message: 'Symptom added successfully',
      data: {
        symptoms: consultation.symptoms,
      },
    });
  } catch (error) {
    console.error('Add symptom error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add symptom',
    });
  }
});

// Get chat history
router.get('/history/:consultationId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { consultationId } = req.params;
    const userId = req.userId;

    const consultation = await Consultation.findOne({
      _id: consultationId,
      userId,
    });

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found',
      });
    }

    res.json({
      success: true,
      data: {
        sessionId: consultation.sessionId,
        messages: consultation.messages,
        symptoms: consultation.symptoms,
        status: consultation.status,
      },
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat history',
    });
  }
});

// End chat session and get analysis
router.post('/end-session', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { consultationId } = req.body;
    const userId = req.userId;

    const consultation = await Consultation.findOne({
      _id: consultationId,
      userId,
    });

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found',
      });
    }

    // Generate symptom summary from conversation
    const symptomSummary = consultation.symptoms
      .map((s) => s.description)
      .join(', ');

    // Get analysis
    const analysis = await chatService.analyzeSymptoms(
      symptomSummary,
      consultation.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }))
    );

    // Update consultation
    consultation.status = 'completed';
    consultation.analysisResult = {
      riskLevel: analysis.riskLevel,
      urgencyScore: analysis.urgencyScore,
      confidenceScore: analysis.confidenceScore,
      detectedConditions: analysis.detectedConditions,
      affectedAreas: [],
      recommendations: analysis.recommendations,
      followUpQuestions: analysis.followUpQuestions,
      analysisTimestamp: new Date(),
    };

    await consultation.save();

    res.json({
      success: true,
      data: {
        analysis,
        sessionId: consultation.sessionId,
        status: 'completed',
      },
    });
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end session',
    });
  }
});

export default router;
