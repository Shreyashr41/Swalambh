import express from 'express';
import { Consultation, Reminder, Report } from '../models';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get patient dashboard overview
router.get('/dashboard', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;

    // Get recent consultations
    const recentConsultations = await Consultation.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('sessionId status analysisResult createdAt');

    // Get upcoming reminders
    const upcomingReminders = await Reminder.find({
      userId,
      isActive: true,
      isCompleted: false,
      scheduledTime: { $gte: new Date() },
    })
      .sort({ scheduledTime: 1 })
      .limit(5);

    // Get recent reports
    const recentReports = await Report.find({ userId })
      .sort({ generatedAt: -1 })
      .limit(3)
      .select('reportId title generatedAt');

    // Calculate statistics
    const stats = {
      totalConsultations: await Consultation.countDocuments({ userId }),
      activeReminders: await Reminder.countDocuments({
        userId,
        isActive: true,
        isCompleted: false,
      }),
      totalReports: await Report.countDocuments({ userId }),
      highRiskCount: await Consultation.countDocuments({
        userId,
        'analysisResult.riskLevel': 'high',
      }),
    };

    res.json({
      success: true,
      data: {
        recentConsultations,
        upcomingReminders,
        recentReports,
        stats,
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard data',
    });
  }
});

// Get consultation history
router.get('/consultations', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10, status } = req.query;

    const query: any = { userId };
    if (status) query.status = status;

    const consultations = await Consultation.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Consultation.countDocuments(query);

    res.json({
      success: true,
      data: {
        consultations,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get consultations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get consultations',
    });
  }
});

// Get single consultation
router.get('/consultations/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const consultation = await Consultation.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation not found',
      });
    }

    res.json({
      success: true,
      data: consultation,
    });
  } catch (error) {
    console.error('Get consultation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get consultation',
    });
  }
});

// Get symptom progress over time
router.get('/symptom-progress', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const consultations = await Consultation.find({
      userId,
      createdAt: { $gte: startDate },
      analysisResult: { $ne: null },
    })
      .sort({ createdAt: 1 })
      .select('createdAt analysisResult symptoms');

    // Aggregate progress data
    const progressData = consultations.map((c) => ({
      date: c.createdAt,
      riskLevel: c.analysisResult?.riskLevel,
      urgencyScore: c.analysisResult?.urgencyScore,
      symptoms: c.symptoms.length,
    }));

    // Calculate trend
    let trend = 'stable';
    if (progressData.length >= 2) {
      const recent = progressData.slice(-3);
      const avgRecent =
        recent.reduce((sum, r) => sum + (r.urgencyScore || 0), 0) / recent.length;
      const earlier = progressData.slice(0, 3);
      const avgEarlier =
        earlier.reduce((sum, e) => sum + (e.urgencyScore || 0), 0) / earlier.length;

      if (avgRecent > avgEarlier + 10) trend = 'worsening';
      else if (avgRecent < avgEarlier - 10) trend = 'improving';
    }

    res.json({
      success: true,
      data: {
        progressData,
        trend,
        totalDataPoints: progressData.length,
      },
    });
  } catch (error) {
    console.error('Symptom progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get symptom progress',
    });
  }
});

// Get health summary
router.get('/health-summary', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const user = req.user;

    // Get all consultations
    const consultations = await Consultation.find({ userId });

    // Get all detected conditions
    const allConditions: string[] = [];
    consultations.forEach((c) => {
      if (c.analysisResult?.detectedConditions) {
        allConditions.push(...c.analysisResult.detectedConditions);
      }
    });

    // Count condition frequency
    const conditionCounts: Record<string, number> = {};
    allConditions.forEach((c) => {
      conditionCounts[c] = (conditionCounts[c] || 0) + 1;
    });

    // Sort by frequency
    const topConditions = Object.entries(conditionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([condition, count]) => ({ condition, count }));

    // Calculate overall health metrics
    const completedConsultations = consultations.filter(
      (c) => c.analysisResult
    );
    const avgUrgency =
      completedConsultations.reduce(
        (sum, c) => sum + (c.analysisResult?.urgencyScore || 0),
        0
      ) / (completedConsultations.length || 1);

    // Risk distribution
    const riskDistribution = {
      low: completedConsultations.filter(
        (c) => c.analysisResult?.riskLevel === 'low'
      ).length,
      medium: completedConsultations.filter(
        (c) => c.analysisResult?.riskLevel === 'medium'
      ).length,
      high: completedConsultations.filter(
        (c) => c.analysisResult?.riskLevel === 'high'
      ).length,
    };

    res.json({
      success: true,
      data: {
        medicalHistory: user?.medicalHistory,
        topConditions,
        averageUrgencyScore: Math.round(avgUrgency),
        riskDistribution,
        totalConsultations: consultations.length,
      },
    });
  } catch (error) {
    console.error('Health summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get health summary',
    });
  }
});

export default router;
