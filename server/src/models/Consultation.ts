import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  imageUrl?: string;
}

export interface ISymptom {
  description: string;
  duration: string;
  severity: 'mild' | 'moderate' | 'severe';
  location: string;
  additionalNotes: string;
}

export interface IAnalysisResult {
  riskLevel: 'low' | 'medium' | 'high';
  urgencyScore: number;
  confidenceScore: number;
  detectedConditions: string[];
  affectedAreas: {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    confidence: number;
  }[];
  recommendations: string[];
  followUpQuestions: string[];
  analysisTimestamp: Date;
}

export interface IConsultation extends Document {
  userId: mongoose.Types.ObjectId;
  sessionId: string;
  status: 'active' | 'completed' | 'archived';
  messages: IMessage[];
  symptoms: ISymptom[];
  uploadedImages: {
    url: string;
    filename: string;
    uploadedAt: Date;
    analysisCompleted: boolean;
  }[];
  analysisResult: IAnalysisResult | null;
  followUpScheduled: boolean;
  doctorReferred: boolean;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  imageUrl: String,
});

const SymptomSchema = new Schema<ISymptom>({
  description: String,
  duration: String,
  severity: {
    type: String,
    enum: ['mild', 'moderate', 'severe'],
  },
  location: String,
  additionalNotes: String,
});

const AnalysisResultSchema = new Schema<IAnalysisResult>({
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
  },
  urgencyScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  confidenceScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  detectedConditions: [String],
  affectedAreas: [
    {
      x: Number,
      y: Number,
      width: Number,
      height: Number,
      label: String,
      confidence: Number,
    },
  ],
  recommendations: [String],
  followUpQuestions: [String],
  analysisTimestamp: {
    type: Date,
    default: Date.now,
  },
});

const ConsultationSchema = new Schema<IConsultation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'archived'],
      default: 'active',
    },
    messages: [MessageSchema],
    symptoms: [SymptomSchema],
    uploadedImages: [
      {
        url: String,
        filename: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
        analysisCompleted: {
          type: Boolean,
          default: false,
        },
      },
    ],
    analysisResult: AnalysisResultSchema,
    followUpScheduled: {
      type: Boolean,
      default: false,
    },
    doctorReferred: {
      type: Boolean,
      default: false,
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

export const Consultation = mongoose.model<IConsultation>(
  'Consultation',
  ConsultationSchema
);
