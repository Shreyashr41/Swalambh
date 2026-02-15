import { v4 as uuidv4 } from 'uuid';
import { Report, IReport, User, Consultation } from '../models';

export interface ReportGenerationOptions {
  includeImages: boolean;
  includeTimeline: boolean;
  includeRecommendations: boolean;
}

export const reportService = {
  async generateReport(
    userId: string,
    consultationId: string,
    options: ReportGenerationOptions = {
      includeImages: true,
      includeTimeline: true,
      includeRecommendations: true,
    }
  ): Promise<IReport> {
    // Fetch user and consultation data
    const user = await User.findById(userId);
    const consultation = await Consultation.findById(consultationId);

    if (!user || !consultation) {
      throw new Error('User or consultation not found');
    }

    // Calculate age
    const today = new Date();
    const birthDate = new Date(user.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    // Build report content
    const reportContent: IReport['content'] = {
      patientInfo: {
        name: `${user.firstName} ${user.lastName}`,
        age,
        gender: user.gender,
      },
      symptoms: consultation.symptoms.map((s) => ({
        description: s.description,
        duration: s.duration,
        severity: s.severity,
      })),
      images: options.includeImages
        ? consultation.uploadedImages.map((img) => ({
            url: img.url,
            analysis: 'AI analysis completed',
          }))
        : [],
      analysisResults: consultation.analysisResult
        ? {
            riskLevel: consultation.analysisResult.riskLevel,
            urgencyScore: consultation.analysisResult.urgencyScore,
            confidenceScore: consultation.analysisResult.confidenceScore,
            detectedConditions: consultation.analysisResult.detectedConditions,
            recommendations: options.includeRecommendations
              ? consultation.analysisResult.recommendations
              : [],
          }
        : {
            riskLevel: 'low',
            urgencyScore: 0,
            confidenceScore: 0,
            detectedConditions: [],
            recommendations: [],
          },
      timeline: options.includeTimeline
        ? buildTimeline(consultation)
        : [],
    };

    // Create report
    const report = new Report({
      userId: user._id,
      consultationId: consultation._id,
      reportId: `RPT-${uuidv4().slice(0, 8).toUpperCase()}`,
      title: `Health Report - ${new Date().toLocaleDateString()}`,
      generatedAt: new Date(),
      content: reportContent,
      pdfUrl: null,
      sharedWith: [],
      isDownloaded: false,
    });

    await report.save();
    return report;
  },

  async getReportById(reportId: string): Promise<IReport | null> {
    return Report.findOne({ reportId }).populate('userId', 'firstName lastName email');
  },

  async getUserReports(userId: string): Promise<IReport[]> {
    return Report.find({ userId })
      .sort({ generatedAt: -1 })
      .populate('consultationId', 'sessionId status');
  },

  async shareReport(reportId: string, email: string): Promise<IReport | null> {
    const report = await Report.findOne({ reportId });
    if (!report) return null;

    if (!report.sharedWith.includes(email)) {
      report.sharedWith.push(email);
      await report.save();
    }

    return report;
  },

  async deleteReport(reportId: string): Promise<boolean> {
    const result = await Report.findOneAndDelete({ reportId });
    return !!result;
  },

  generateReportHTML(report: IReport): string {
    const { content } = report;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${report.title}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #4F46E5;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #4F46E5;
      margin: 0;
    }
    .header p {
      color: #666;
      margin: 5px 0;
    }
    .section {
      margin-bottom: 30px;
    }
    .section h2 {
      color: #4F46E5;
      border-bottom: 1px solid #ddd;
      padding-bottom: 10px;
    }
    .patient-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .info-item {
      padding: 10px;
      background: #f5f5f5;
      border-radius: 5px;
    }
    .info-label {
      font-weight: bold;
      color: #666;
      font-size: 12px;
      text-transform: uppercase;
    }
    .info-value {
      font-size: 16px;
      margin-top: 5px;
    }
    .risk-indicator {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 20px;
      font-weight: bold;
      text-transform: uppercase;
    }
    .risk-low { background: #10B981; color: white; }
    .risk-medium { background: #F59E0B; color: white; }
    .risk-high { background: #EF4444; color: white; }
    .score-bar {
      height: 10px;
      background: #e0e0e0;
      border-radius: 5px;
      overflow: hidden;
      margin-top: 5px;
    }
    .score-fill {
      height: 100%;
      background: #4F46E5;
      border-radius: 5px;
    }
    .recommendation {
      padding: 10px 15px;
      background: #EEF2FF;
      border-left: 4px solid #4F46E5;
      margin: 10px 0;
      border-radius: 0 5px 5px 0;
    }
    .timeline-item {
      display: flex;
      gap: 15px;
      padding: 15px 0;
      border-bottom: 1px dashed #ddd;
    }
    .timeline-date {
      min-width: 100px;
      color: #666;
      font-size: 14px;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      color: #666;
      font-size: 12px;
    }
    .disclaimer {
      background: #FEF3C7;
      border: 1px solid #F59E0B;
      padding: 15px;
      border-radius: 5px;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🏥 DermaCare Health Report</h1>
    <p>Report ID: ${report.reportId}</p>
    <p>Generated: ${new Date(report.generatedAt).toLocaleString()}</p>
  </div>

  <div class="section">
    <h2>Patient Information</h2>
    <div class="patient-info">
      <div class="info-item">
        <div class="info-label">Name</div>
        <div class="info-value">${content.patientInfo.name}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Age</div>
        <div class="info-value">${content.patientInfo.age} years</div>
      </div>
      <div class="info-item">
        <div class="info-label">Gender</div>
        <div class="info-value">${content.patientInfo.gender}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Symptoms Reported</h2>
    ${content.symptoms.length > 0
      ? content.symptoms
          .map(
            (s) => `
      <div class="info-item" style="margin-bottom: 10px;">
        <strong>${s.description}</strong><br>
        <span style="color: #666;">Duration: ${s.duration} | Severity: ${s.severity}</span>
      </div>
    `
          )
          .join('')
      : '<p>No symptoms recorded</p>'
    }
  </div>

  <div class="section">
    <h2>AI Analysis Results</h2>
    <div class="patient-info">
      <div class="info-item">
        <div class="info-label">Risk Level</div>
        <div class="info-value">
          <span class="risk-indicator risk-${content.analysisResults.riskLevel}">
            ${content.analysisResults.riskLevel}
          </span>
        </div>
      </div>
      <div class="info-item">
        <div class="info-label">Urgency Score</div>
        <div class="info-value">${content.analysisResults.urgencyScore}/100</div>
        <div class="score-bar">
          <div class="score-fill" style="width: ${content.analysisResults.urgencyScore}%"></div>
        </div>
      </div>
      <div class="info-item">
        <div class="info-label">AI Confidence</div>
        <div class="info-value">${content.analysisResults.confidenceScore}%</div>
        <div class="score-bar">
          <div class="score-fill" style="width: ${content.analysisResults.confidenceScore}%"></div>
        </div>
      </div>
    </div>

    <h3>Possible Conditions</h3>
    <ul>
      ${content.analysisResults.detectedConditions.map((c) => `<li>${c}</li>`).join('')}
    </ul>
  </div>

  ${content.analysisResults.recommendations.length > 0
    ? `
  <div class="section">
    <h2>Recommendations</h2>
    ${content.analysisResults.recommendations
      .map((r) => `<div class="recommendation">${r}</div>`)
      .join('')}
  </div>
  `
    : ''
  }

  ${content.timeline.length > 0
    ? `
  <div class="section">
    <h2>Timeline</h2>
    ${content.timeline
      .map(
        (t) => `
      <div class="timeline-item">
        <div class="timeline-date">${new Date(t.date).toLocaleDateString()}</div>
        <div>
          <strong>${t.event}</strong><br>
          <span style="color: #666;">${t.details}</span>
        </div>
      </div>
    `
      )
      .join('')}
  </div>
  `
    : ''
  }

  <div class="disclaimer">
    <strong>⚠️ Important Disclaimer:</strong><br>
    This report is generated by an AI system for informational purposes only. 
    It is not a substitute for professional medical advice, diagnosis, or treatment. 
    Always seek the advice of a qualified healthcare provider with any questions 
    you may have regarding a medical condition.
  </div>

  <div class="footer">
    <p>DermaCare AI Healthcare Assistant</p>
    <p>© ${new Date().getFullYear()} DermaCare. All rights reserved.</p>
  </div>
</body>
</html>
    `;
  },
};

function buildTimeline(consultation: any): { date: Date; event: string; details: string }[] {
  const timeline: { date: Date; event: string; details: string }[] = [];

  // Add consultation start
  timeline.push({
    date: consultation.createdAt,
    event: 'Consultation Started',
    details: 'Patient initiated health consultation',
  });

  // Add image uploads
  consultation.uploadedImages.forEach((img: any, index: number) => {
    timeline.push({
      date: img.uploadedAt,
      event: `Image ${index + 1} Uploaded`,
      details: 'Medical image uploaded for analysis',
    });
  });

  // Add analysis completion
  if (consultation.analysisResult) {
    timeline.push({
      date: consultation.analysisResult.analysisTimestamp,
      event: 'Analysis Completed',
      details: `Risk assessed as ${consultation.analysisResult.riskLevel}`,
    });
  }

  return timeline.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export default reportService;
