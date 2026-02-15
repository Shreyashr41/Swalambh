import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Download,
  Eye,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Filter,
} from 'lucide-react';
import { reportAPI } from '../services/api';
import './Reports.css';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await reportAPI.getAll();
      setReports(response.data.data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (reportId) => {
    try {
      const response = await reportAPI.download(reportId);
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `health-report-${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download report:', error);
      alert('Failed to download report');
    }
  };

  const filteredReports = reports.filter(report =>
    report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report._id.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '50vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1>
            <FileText size={28} />
            Health Reports
          </h1>
          <p>View and download your AI-generated health reports</p>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="empty-state card">
          <FileText size={48} />
          <h2>No Reports Yet</h2>
          <p>Complete a consultation to generate your first health report</p>
          <Link to="/chat" className="btn btn-primary">
            Start Consultation
          </Link>
        </div>
      ) : (
        <>
          <div className="reports-toolbar">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <span className="report-count">
              {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="reports-grid">
            {filteredReports.map((report) => (
              <ReportCard
                key={report._id}
                report={report}
                onView={() => setSelectedReport(report)}
                onDownload={() => handleDownload(report._id)}
              />
            ))}
          </div>
        </>
      )}

      {/* Report Preview Modal */}
      {selectedReport && (
        <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="report-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Report Preview</h2>
              <button className="close-btn" onClick={() => setSelectedReport(null)}>
                ×
              </button>
            </div>
            <div className="report-preview">
              <div className="preview-header">
                <h3>{selectedReport.title || 'Health Report'}</h3>
                <span className="preview-date">
                  <Calendar size={14} />
                  {new Date(selectedReport.createdAt).toLocaleDateString()}
                </span>
              </div>

              {selectedReport.summary && (
                <div className="preview-section">
                  <h4>Summary</h4>
                  <p>{selectedReport.summary}</p>
                </div>
              )}

              {selectedReport.riskAssessment && (
                <div className="preview-section">
                  <h4>Risk Assessment</h4>
                  <div className={`risk-badge ${selectedReport.riskAssessment.level}`}>
                    {selectedReport.riskAssessment.level === 'high' ? (
                      <AlertTriangle size={16} />
                    ) : (
                      <CheckCircle size={16} />
                    )}
                    {selectedReport.riskAssessment.level.toUpperCase()} RISK
                  </div>
                  {selectedReport.riskAssessment.explanation && (
                    <p>{selectedReport.riskAssessment.explanation}</p>
                  )}
                </div>
              )}

              {selectedReport.recommendations?.length > 0 && (
                <div className="preview-section">
                  <h4>Recommendations</h4>
                  <ul>
                    {selectedReport.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-primary"
                onClick={() => handleDownload(selectedReport._id)}
              >
                <Download size={18} />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ReportCard = ({ report, onView, onDownload }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="report-card card">
      <div className="report-icon">
        <FileText size={28} />
      </div>
      <div className="report-info">
        <h3>{report.title || 'Health Report'}</h3>
        <div className="report-meta">
          <span>
            <Calendar size={14} />
            {formatDate(report.createdAt)}
          </span>
          {report.riskAssessment && (
            <span className={`risk-indicator ${report.riskAssessment.level}`}>
              {report.riskAssessment.level} risk
            </span>
          )}
        </div>
        {report.summary && (
          <p className="report-summary">{report.summary.substring(0, 100)}...</p>
        )}
      </div>
      <div className="report-actions">
        <button className="action-btn view" onClick={onView} title="Preview">
          <Eye size={18} />
        </button>
        <button className="action-btn download" onClick={onDownload} title="Download">
          <Download size={18} />
        </button>
      </div>
    </div>
  );
};

export default Reports;
