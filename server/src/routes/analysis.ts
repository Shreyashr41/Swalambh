import express from 'express';
import { Consultation } from '../models';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { uploadMemory } from '../middleware/upload';
import { imageAnalysisService, chatService } from '../services/openaiService';

const router = express.Router();

// Upload and analyze image
router.post(
  '/upload-image',
  authMiddleware,
  uploadMemory.single('image'),
  async (req: AuthRequest, res) => {
    try {
      const { consultationId, symptoms } = req.body;
      const userId = req.userId;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided',
        });
      }

      // Convert to base64
      const imageBase64 = file.buffer.toString('base64');

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

      // Analyze image with OpenAI
      const imageAnalysis = await imageAnalysisService.analyzeImage(
        imageBase64,
        symptoms
      );

      // Save image info to consultation (in production, upload to cloud storage)
      const imageUrl = `data:${file.mimetype};base64,${imageBase64}`;
      consultation.uploadedImages.push({
        url: imageUrl,
        filename: file.originalname,
        uploadedAt: new Date(),
        analysisCompleted: true,
      });

      // Add image message to chat
      consultation.messages.push({
        role: 'user',
        content: '[Image uploaded for analysis]',
        timestamp: new Date(),
        imageUrl,
      });

      // Add AI analysis response
      const analysisMessage = formatImageAnalysisResponse(imageAnalysis);
      consultation.messages.push({
        role: 'assistant',
        content: analysisMessage,
        timestamp: new Date(),
      });

      await consultation.save();

      res.json({
        success: true,
        data: {
          analysis: imageAnalysis,
          message: analysisMessage,
        },
      });
    } catch (error) {
      console.error('Image analysis error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to analyze image',
      });
    }
  }
);

// Get full multimodal analysis
router.post('/full-analysis', authMiddleware, async (req: AuthRequest, res) => {
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

    // Generate symptom summary
    const symptomSummary = consultation.symptoms
      .map((s) => `${s.description} (${s.severity}, ${s.duration})`)
      .join('; ');

    // Get symptom analysis
    const symptomAnalysis = await chatService.analyzeSymptoms(
      symptomSummary,
      consultation.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }))
    );

    // If there are images, combine with image analysis
    let finalAnalysis = symptomAnalysis;
    if (consultation.uploadedImages.length > 0) {
      // Get the latest image
      const latestImage = consultation.uploadedImages[consultation.uploadedImages.length - 1];
      
      // Extract base64 from data URL
      const base64Match = latestImage.url.match(/base64,(.+)/);
      if (base64Match) {
        const imageAnalysis = await imageAnalysisService.analyzeImage(
          base64Match[1],
          symptomSummary
        );

        // Combine analyses
        finalAnalysis = await imageAnalysisService.combineAnalysis(
          imageAnalysis,
          symptomAnalysis
        );

        // Add affected areas from image analysis
        consultation.analysisResult = {
          ...finalAnalysis,
          affectedAreas: imageAnalysis.affectedAreas,
          analysisTimestamp: new Date(),
        };
      }
    } else {
      consultation.analysisResult = {
        ...finalAnalysis,
        affectedAreas: [],
        analysisTimestamp: new Date(),
      };
    }

    consultation.status = 'completed';
    await consultation.save();

    // Check for high risk and add alert
    let alert = null;
    if (finalAnalysis.riskLevel === 'high' || finalAnalysis.urgencyScore > 75) {
      alert = {
        type: 'high-risk',
        message:
          '⚠️ HIGH RISK DETECTED: Based on your symptoms and images, we recommend seeking immediate medical consultation. This assessment indicates potentially serious health concerns that require professional evaluation.',
        urgency: 'immediate',
      };
    }

    res.json({
      success: true,
      data: {
        analysis: finalAnalysis,
        affectedAreas: consultation.analysisResult?.affectedAreas || [],
        alert,
        sessionId: consultation.sessionId,
      },
    });
  } catch (error) {
    console.error('Full analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform analysis',
    });
  }
});

// Get analysis results
router.get('/results/:consultationId', authMiddleware, async (req: AuthRequest, res) => {
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

    if (!consultation.analysisResult) {
      return res.status(404).json({
        success: false,
        message: 'No analysis results available',
      });
    }

    res.json({
      success: true,
      data: {
        sessionId: consultation.sessionId,
        analysis: consultation.analysisResult,
        symptoms: consultation.symptoms,
        images: consultation.uploadedImages,
      },
    });
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analysis results',
    });
  }
});

// Helper function to format image analysis response
function formatImageAnalysisResponse(analysis: any): string {
  let response = "I've analyzed the image you uploaded. Here's what I found:\n\n";

  response += `**Image Description:**\n${analysis.description}\n\n`;

  if (analysis.detectedAbnormalities.length > 0) {
    response += `**Detected Abnormalities:**\n`;
    analysis.detectedAbnormalities.forEach((abnormality: string) => {
      response += `- ${abnormality}\n`;
    });
    response += '\n';
  }

  response += `**Severity Assessment:** ${analysis.severity.toUpperCase()}\n\n`;

  if (analysis.possibleConditions.length > 0) {
    response += `**Possible Conditions:**\n`;
    analysis.possibleConditions.forEach((condition: string) => {
      response += `- ${condition}\n`;
    });
    response += '\n';
  }

  if (analysis.recommendations.length > 0) {
    response += `**Recommendations:**\n`;
    analysis.recommendations.forEach((rec: string) => {
      response += `- ${rec}\n`;
    });
  }

  response += '\n*Please note: This is an AI-assisted preliminary assessment and should not replace professional medical diagnosis.*';

  return response;
}

export default router;
