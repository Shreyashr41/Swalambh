import mongoose, { Schema, Document } from 'mongoose';

export interface IReminder extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'medication' | 'appointment' | 'followup' | 'checkup';
  title: string;
  description: string;
  scheduledTime: Date;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
  isCompleted: boolean;
  completedAt: Date | null;
  notificationSent: boolean;
  relatedConsultation: mongoose.Types.ObjectId | null;
  medicationDetails: {
    name: string;
    dosage: string;
    instructions: string;
  } | null;
  appointmentDetails: {
    doctorName: string;
    location: string;
    purpose: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

const ReminderSchema = new Schema<IReminder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['medication', 'appointment', 'followup', 'checkup'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    scheduledTime: {
      type: Date,
      required: true,
    },
    frequency: {
      type: String,
      enum: ['once', 'daily', 'weekly', 'monthly'],
      default: 'once',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
    relatedConsultation: {
      type: Schema.Types.ObjectId,
      ref: 'Consultation',
      default: null,
    },
    medicationDetails: {
      name: String,
      dosage: String,
      instructions: String,
    },
    appointmentDetails: {
      doctorName: String,
      location: String,
      purpose: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
ReminderSchema.index({ userId: 1, scheduledTime: 1 });
ReminderSchema.index({ isActive: 1, scheduledTime: 1 });

export const Reminder = mongoose.model<IReminder>('Reminder', ReminderSchema);
