import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
  userId: mongoose.Types.ObjectId;
  consultationId: mongoose.Types.ObjectId;
  reportId: string;
  title: string;
  generatedAt: Date;
  content: {
    patientInfo: {
      name: string;
      age: number;
      gender: string;
    };
    symptoms: {
      description: string;
      duration: string;
      severity: string;
    }[];
    images: {
      url: string;
      analysis: string;
    }[];
    analysisResults: {
      riskLevel: string;
      urgencyScore: number;
      confidenceScore: number;
      detectedConditions: string[];
      recommendations: string[];
    };
    timeline: {
      date: Date;
      event: string;
      details: string;
    }[];
  };
  pdfUrl: string | null;
  sharedWith: string[];
  isDownloaded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    consultationId: {
      type: Schema.Types.ObjectId,
      ref: 'Consultation',
      required: true,
    },
    reportId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    content: {
      patientInfo: {
        name: String,
        age: Number,
        gender: String,
      },
      symptoms: [
        {
          description: String,
          duration: String,
          severity: String,
        },
      ],
      images: [
        {
          url: String,
          analysis: String,
        },
      ],
      analysisResults: {
        riskLevel: String,
        urgencyScore: Number,
        confidenceScore: Number,
        detectedConditions: [String],
        recommendations: [String],
      },
      timeline: [
        {
          date: Date,
          event: String,
          details: String,
        },
      ],
    },
    pdfUrl: {
      type: String,
      default: null,
    },
    sharedWith: [String],
    isDownloaded: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Report = mongoose.model<IReport>('Report', ReportSchema);
