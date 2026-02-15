import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  AlertTriangle,
  CheckCircle,
  MessageCircle,
  Image,
  FileText,
  Download,
} from 'lucide-react';
import { patientAPI, reportAPI } from '../services/api';
import './ConsultationDetail.css';

const ConsultationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConsultation();
  }, [id]);

  const fetchConsultation = async () => {
    try {
      const response = await patientAPI.getConsultation(id);
      setConsultation(response.data.data);
    } catch (error) {
      console.error('Failed to fetch consultation:', error);
      navigate('/consultations');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      await reportAPI.generate(id, {
        includeImages: true,
        includeTimeline: true,
        includeRecommendations: true,
      });
      alert('Report generated successfully!');
      navigate('/reports');
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report');
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '50vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="empty-state card">
        <h2>Consultation not found</h2>
        <Link to="/consultations" className="btn btn-primary">
          View All Consultations
        </Link>
      </div>
    );
  }

  const { analysisResult, messages, symptoms, uploadedImages } = consultation;

  return (
    <div className="consultation-detail">
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate('/consultations')}>
          <ArrowLeft size={20} />
          Back to Consultations
        </button>
        
        <div className="detail-actions">
          <Link to={`/chat/${id}`} className="btn btn-secondary">
            <MessageCircle size={18} />
            View Chat
          </Link>
          <button className="btn btn-primary" onClick={generateReport}>
            <FileText size={18} />
            Generate Report
          </button>
        </div>
      </div>

      <div className="detail-title">
        <h1>Consultation: {consultation.sessionId}</h1>
        <div className="detail-meta">
          <span className="detail-date">
            <Calendar size={16} />
            {new Date(consultation.createdAt).toLocaleString()}
          </span>
          <span className={`status-badge ${consultation.status}`}>
            {consultation.status}
          </span>
        </div>
      </div>

      <div className="detail-grid">
        {/* Analysis Results */}
        {analysisResult && (
          <div className="card analysis-card">
            <h2>AI Analysis Results</h2>
            
            <div className="risk-display">
              <div className={`risk-indicator ${analysisResult.riskLevel}`}>
                {analysisResult.riskLevel === 'high' ? (
                  <AlertTriangle size={32} />
                ) : (
                  <CheckCircle size={32} />
                )}
                <span>{analysisResult.riskLevel.toUpperCase()} RISK</span>
              </div>
              
              <div className="scores">
                <div className="score-item">
                  <span className="score-label">Urgency Score</span>
                  <div className="score-bar">
                    <div 
                      className="score-fill urgency" 
                      style={{ width: `${analysisResult.urgencyScore}%` }}
                    ></div>
                  </div>
                  <span className="score-value">{analysisResult.urgencyScore}/100</span>
                </div>
                
                <div className="score-item">
                  <span className="score-label">AI Confidence</span>
                  <div className="score-bar">
                    <div 
                      className="score-fill confidence" 
                      style={{ width: `${analysisResult.confidenceScore}%` }}
                    ></div>
                  </div>
                  <span className="score-value">{analysisResult.confidenceScore}%</span>
                </div>
              </div>
            </div>

            {analysisResult.detectedConditions?.length > 0 && (
              <div className="detail-section">
                <h3>Possible Conditions</h3>
                <div className="condition-list">
                  {analysisResult.detectedConditions.map((condition, index) => (
                    <span key={index} className="condition-chip">{condition}</span>
                  ))}
                </div>
              </div>
            )}

            {analysisResult.recommendations?.length > 0 && (
              <div className="detail-section">
                <h3>Recommendations</h3>
                <ul className="recommendations">
                  {analysisResult.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Symptoms */}
        <div className="card symptoms-card">
          <h2>Reported Symptoms</h2>
          {symptoms.length === 0 ? (
            <p className="no-data">No symptoms recorded</p>
          ) : (
            <div className="symptoms-list">
              {symptoms.map((symptom, index) => (
                <div key={index} className="symptom-item">
                  <div className="symptom-main">
                    <span className="symptom-description">{symptom.description}</span>
                    <span className={`severity-badge ${symptom.severity}`}>
                      {symptom.severity}
                    </span>
                  </div>
                  <div className="symptom-meta">
                    {symptom.duration && <span>Duration: {symptom.duration}</span>}
                    {symptom.location && <span>Location: {symptom.location}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Uploaded Images */}
        {uploadedImages?.length > 0 && (
          <div className="card images-card">
            <h2>
              <Image size={20} />
              Uploaded Images
            </h2>
            <div className="images-grid">
              {uploadedImages.map((image, index) => (
                <div key={index} className="image-item">
                  <img src={image.url} alt={`Upload ${index + 1}`} />
                  <div className="image-overlay">
                    <span>Uploaded: {new Date(image.uploadedAt).toLocaleDateString()}</span>
                    {image.analysisCompleted && (
                      <span className="analyzed-badge">
                        <CheckCircle size={14} />
                        Analyzed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conversation Summary */}
        <div className="card conversation-card">
          <h2>
            <MessageCircle size={20} />
            Conversation Summary
          </h2>
          <div className="conversation-stats">
            <div className="stat">
              <span className="stat-value">{messages.length}</span>
              <span className="stat-label">Messages</span>
            </div>
            <div className="stat">
              <span className="stat-value">
                {messages.filter(m => m.role === 'user').length}
              </span>
              <span className="stat-label">Your Messages</span>
            </div>
            <div className="stat">
              <span className="stat-value">
                {messages.filter(m => m.imageUrl).length}
              </span>
              <span className="stat-label">Images Shared</span>
            </div>
          </div>
          <Link to={`/chat/${id}`} className="btn btn-outline full-width">
            View Full Conversation
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ConsultationDetail;
