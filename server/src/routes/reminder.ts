import express from 'express';
import { Reminder } from '../models';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { reminderService } from '../services/reminderService';

const router = express.Router();

// Create new reminder
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const {
      type,
      title,
      description,
      scheduledTime,
      frequency,
      medicationDetails,
      appointmentDetails,
      relatedConsultation,
    } = req.body;

    const reminder = await reminderService.createReminder({
      userId: req.userId as any,
      type,
      title,
      description,
      scheduledTime: new Date(scheduledTime),
      frequency: frequency || 'once',
      medicationDetails,
      appointmentDetails,
      relatedConsultation,
    });

    res.status(201).json({
      success: true,
      message: 'Reminder created successfully',
      data: reminder,
    });
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create reminder',
    });
  }
});

// Get all reminders for user
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { type, active, startDate, endDate } = req.query;

    const reminders = await reminderService.getUserReminders(req.userId!, {
      type: type as string,
      isActive: active === 'true' ? true : active === 'false' ? false : undefined,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });

    res.json({
      success: true,
      data: reminders,
    });
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reminders',
    });
  }
});

// Get upcoming reminders
router.get('/upcoming', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { limit = 10 } = req.query;

    const reminders = await reminderService.getUpcomingReminders(
      req.userId!,
      Number(limit)
    );

    res.json({
      success: true,
      data: reminders,
    });
  } catch (error) {
    console.error('Get upcoming reminders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get upcoming reminders',
    });
  }
});

// Get pending notifications
router.get('/notifications', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const notifications = reminderService.getPendingNotifications(req.userId!);

    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notifications',
    });
  }
});

// Clear notification
router.delete('/notifications/:reminderId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { reminderId } = req.params;

    reminderService.clearNotification(reminderId);

    res.json({
      success: true,
      message: 'Notification cleared',
    });
  } catch (error) {
    console.error('Clear notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear notification',
    });
  }
});

// Get single reminder
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found',
      });
    }

    res.json({
      success: true,
      data: reminder,
    });
  } catch (error) {
    console.error('Get reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reminder',
    });
  }
});

// Update reminder
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Verify ownership
    const existing = await Reminder.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found',
      });
    }

    const reminder = await reminderService.updateReminder(id, updates);

    res.json({
      success: true,
      message: 'Reminder updated successfully',
      data: reminder,
    });
  } catch (error) {
    console.error('Update reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update reminder',
    });
  }
});

// Mark reminder as complete
router.post('/:id/complete', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const existing = await Reminder.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found',
      });
    }

    const reminder = await reminderService.markReminderComplete(id);

    res.json({
      success: true,
      message: 'Reminder marked as complete',
      data: reminder,
    });
  } catch (error) {
    console.error('Complete reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete reminder',
    });
  }
});

// Snooze reminder
router.post('/:id/snooze', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { minutes = 15 } = req.body;

    // Verify ownership
    const existing = await Reminder.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found',
      });
    }

    const reminder = await reminderService.snoozeReminder(id, minutes);

    res.json({
      success: true,
      message: `Reminder snoozed for ${minutes} minutes`,
      data: reminder,
    });
  } catch (error) {
    console.error('Snooze reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to snooze reminder',
    });
  }
});

// Delete reminder
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const existing = await Reminder.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found',
      });
    }

    await reminderService.deleteReminder(id);

    res.json({
      success: true,
      message: 'Reminder deleted successfully',
    });
  } catch (error) {
    console.error('Delete reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete reminder',
    });
  }
});

// Create medication reminder (convenience endpoint)
router.post('/medication', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const {
      medicationName,
      dosage,
      instructions,
      scheduledTime,
      frequency,
    } = req.body;

    const reminder = await reminderService.createReminder({
      userId: req.userId as any,
      type: 'medication',
      title: `Take ${medicationName}`,
      description: `${dosage} - ${instructions}`,
      scheduledTime: new Date(scheduledTime),
      frequency: frequency || 'daily',
      medicationDetails: {
        name: medicationName,
        dosage,
        instructions,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Medication reminder created',
      data: reminder,
    });
  } catch (error) {
    console.error('Create medication reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create medication reminder',
    });
  }
});

// Create appointment reminder (convenience endpoint)
router.post('/appointment', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const {
      doctorName,
      location,
      purpose,
      scheduledTime,
    } = req.body;

    const reminder = await reminderService.createReminder({
      userId: req.userId as any,
      type: 'appointment',
      title: `Appointment with ${doctorName}`,
      description: `${purpose} at ${location}`,
      scheduledTime: new Date(scheduledTime),
      frequency: 'once',
      appointmentDetails: {
        doctorName,
        location,
        purpose,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Appointment reminder created',
      data: reminder,
    });
  } catch (error) {
    console.error('Create appointment reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create appointment reminder',
    });
  }
});

export default router;
