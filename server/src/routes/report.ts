import express from 'express';
import { Report } from '../models';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { reportService } from '../services/reportService';

const router = express.Router();

// Generate new report
router.post('/generate', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { consultationId, options } = req.body;

    const report = await reportService.generateReport(
      req.userId!,
      consultationId,
      options
    );

    res.status(201).json({
      success: true,
      message: 'Report generated successfully',
      data: report,
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get all user reports
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const reports = await reportService.getUserReports(req.userId!);

    res.json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reports',
    });
  }
});

// Get single report by reportId
router.get('/:reportId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { reportId } = req.params;

    const report = await reportService.getReportById(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    // Verify ownership
    if (report.userId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get report',
    });
  }
});

// Get report as HTML
router.get('/:reportId/html', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { reportId } = req.params;

    const report = await reportService.getReportById(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    // Verify ownership
    if (report.userId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const html = reportService.generateReportHTML(report);

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Get report HTML error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get report HTML',
    });
  }
});

// Download report (marks as downloaded)
router.get('/:reportId/download', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { reportId } = req.params;

    const report = await Report.findOne({ reportId });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    // Verify ownership
    if (report.userId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    // Mark as downloaded
    report.isDownloaded = true;
    await report.save();

    const html = reportService.generateReportHTML(report);

    res.setHeader('Content-Type', 'text/html');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${report.reportId}.html"`
    );
    res.send(html);
  } catch (error) {
    console.error('Download report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download report',
    });
  }
});

// Share report
router.post('/:reportId/share', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { reportId } = req.params;
    const { email } = req.body;

    // Verify ownership
    const existingReport = await Report.findOne({ reportId });
    if (!existingReport) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    if (existingReport.userId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const report = await reportService.shareReport(reportId, email);

    res.json({
      success: true,
      message: `Report shared with ${email}`,
      data: {
        sharedWith: report?.sharedWith,
      },
    });
  } catch (error) {
    console.error('Share report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to share report',
    });
  }
});

// Delete report
router.delete('/:reportId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { reportId } = req.params;

    // Verify ownership
    const existingReport = await Report.findOne({ reportId });
    if (!existingReport) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    if (existingReport.userId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    await reportService.deleteReport(reportId);

    res.json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete report',
    });
  }
});

export default router;
