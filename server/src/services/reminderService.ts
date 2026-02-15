import cron from 'node-cron';
import { Reminder, IReminder } from '../models';

interface ReminderNotification {
  userId: string;
  reminderId: string;
  type: string;
  title: string;
  description: string;
  scheduledTime: Date;
}

// In-memory store for pending notifications (in production, use Redis or similar)
const pendingNotifications: ReminderNotification[] = [];

export const initializeReminderService = () => {
  // Check for due reminders every minute
  cron.schedule('* * * * *', async () => {
    await checkDueReminders();
  });

  // Reset daily reminders at midnight
  cron.schedule('0 0 * * *', async () => {
    await resetDailyReminders();
  });

  console.log('✅ Reminder service initialized');
};

const checkDueReminders = async () => {
  const now = new Date();
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

  try {
    const dueReminders = await Reminder.find({
      isActive: true,
      isCompleted: false,
      notificationSent: false,
      scheduledTime: {
        $lte: fiveMinutesFromNow,
        $gte: now,
      },
    });

    for (const reminder of dueReminders) {
      await sendReminderNotification(reminder);
    }
  } catch (error) {
    console.error('Error checking due reminders:', error);
  }
};

const sendReminderNotification = async (reminder: IReminder) => {
  // Add to pending notifications
  pendingNotifications.push({
    userId: reminder.userId.toString(),
    reminderId: reminder._id.toString(),
    type: reminder.type,
    title: reminder.title,
    description: reminder.description,
    scheduledTime: reminder.scheduledTime,
  });

  // Mark notification as sent
  reminder.notificationSent = true;
  await reminder.save();

  console.log(`📧 Reminder notification sent: ${reminder.title}`);
};

const resetDailyReminders = async () => {
  try {
    await Reminder.updateMany(
      { frequency: 'daily', isActive: true },
      {
        $set: {
          isCompleted: false,
          notificationSent: false,
        },
      }
    );
    console.log('✅ Daily reminders reset');
  } catch (error) {
    console.error('Error resetting daily reminders:', error);
  }
};

export const reminderService = {
  async createReminder(reminderData: Partial<IReminder>): Promise<IReminder> {
    const reminder = new Reminder(reminderData);
    await reminder.save();
    return reminder;
  },

  async getUserReminders(
    userId: string,
    options?: {
      type?: string;
      isActive?: boolean;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<IReminder[]> {
    const query: any = { userId };

    if (options?.type) query.type = options.type;
    if (options?.isActive !== undefined) query.isActive = options.isActive;
    if (options?.startDate || options?.endDate) {
      query.scheduledTime = {};
      if (options.startDate) query.scheduledTime.$gte = options.startDate;
      if (options.endDate) query.scheduledTime.$lte = options.endDate;
    }

    return Reminder.find(query).sort({ scheduledTime: 1 });
  },

  async getUpcomingReminders(
    userId: string,
    limit: number = 10
  ): Promise<IReminder[]> {
    return Reminder.find({
      userId,
      isActive: true,
      isCompleted: false,
      scheduledTime: { $gte: new Date() },
    })
      .sort({ scheduledTime: 1 })
      .limit(limit);
  },

  async markReminderComplete(reminderId: string): Promise<IReminder | null> {
    const reminder = await Reminder.findById(reminderId);
    if (!reminder) return null;

    reminder.isCompleted = true;
    reminder.completedAt = new Date();

    // Handle recurring reminders
    if (reminder.frequency !== 'once') {
      const nextScheduledTime = calculateNextScheduledTime(
        reminder.scheduledTime,
        reminder.frequency
      );

      // Create next occurrence
      const nextReminder = new Reminder({
        ...reminder.toObject(),
        _id: undefined,
        scheduledTime: nextScheduledTime,
        isCompleted: false,
        completedAt: null,
        notificationSent: false,
      });
      await nextReminder.save();
    }

    await reminder.save();
    return reminder;
  },

  async updateReminder(
    reminderId: string,
    updates: Partial<IReminder>
  ): Promise<IReminder | null> {
    return Reminder.findByIdAndUpdate(reminderId, updates, { new: true });
  },

  async deleteReminder(reminderId: string): Promise<boolean> {
    const result = await Reminder.findByIdAndDelete(reminderId);
    return !!result;
  },

  async snoozeReminder(
    reminderId: string,
    minutes: number
  ): Promise<IReminder | null> {
    const reminder = await Reminder.findById(reminderId);
    if (!reminder) return null;

    reminder.scheduledTime = new Date(
      reminder.scheduledTime.getTime() + minutes * 60 * 1000
    );
    reminder.notificationSent = false;

    await reminder.save();
    return reminder;
  },

  getPendingNotifications(userId: string): ReminderNotification[] {
    return pendingNotifications.filter((n) => n.userId === userId);
  },

  clearNotification(reminderId: string): void {
    const index = pendingNotifications.findIndex(
      (n) => n.reminderId === reminderId
    );
    if (index !== -1) {
      pendingNotifications.splice(index, 1);
    }
  },
};

const calculateNextScheduledTime = (
  currentTime: Date,
  frequency: string
): Date => {
  const next = new Date(currentTime);

  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    default:
      break;
  }

  return next;
};

export default reminderService;
