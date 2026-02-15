import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ClipboardList, 
  Calendar, 
  ChevronRight, 
  Filter,
  Search,
  MessageCircle 
} from 'lucide-react';
import { patientAPI } from '../services/api';
import './Consultations.css';

const Consultations = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchConsultations();
  }, [page, filter]);

  const fetchConsultations = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (filter !== 'all') params.status = filter;

      const response = await patientAPI.getConsultations(params);
      setConsultations(response.data.data.consultations);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Failed to fetch consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadgeClass = (riskLevel) => {
    if (!riskLevel) return 'badge-medium';
    return `badge-${riskLevel}`;
  };

  return (
    <div className="consultations-page">
      <div className="page-header">
        <div>
          <h1>
            <ClipboardList size={28} />
            My Consultations
          </h1>
          <p>View and manage your health consultation history</p>
        </div>
        <Link to="/chat" className="btn btn-primary">
          <MessageCircle size={18} />
          New Consultation
        </Link>
      </div>

      <div className="filter-bar">
        <div className="filter-group">
          <Filter size={18} />
          <select 
            value={filter} 
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Consultations</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex-center" style={{ height: '300px' }}>
          <div className="spinner"></div>
        </div>
      ) : consultations.length === 0 ? (
        <div className="empty-state card">
          <ClipboardList size={64} />
          <h2>No Consultations Found</h2>
          <p>Start a new consultation to get AI-powered health insights</p>
          <Link to="/chat" className="btn btn-primary">
            Start Consultation
          </Link>
        </div>
      ) : (
        <>
          <div className="consultations-list">
            {consultations.map((consultation) => (
              <Link
                key={consultation._id}
                to={`/consultations/${consultation._id}`}
                className="consultation-card"
              >
                <div className="consultation-main">
                  <div className="consultation-id-date">
                    <span className="consultation-session-id">
                      {consultation.sessionId}
                    </span>
                    <span className="consultation-date">
                      <Calendar size={14} />
                      {new Date(consultation.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="consultation-status">
                    <span className={`status-badge ${consultation.status}`}>
                      {consultation.status}
                    </span>
                  </div>
                </div>

                <div className="consultation-footer">
                  {consultation.analysisResult ? (
                    <div className="analysis-summary">
                      <span className={`badge ${getRiskBadgeClass(consultation.analysisResult.riskLevel)}`}>
                        {consultation.analysisResult.riskLevel} risk
                      </span>
                      <span className="urgency-score">
                        Urgency: {consultation.analysisResult.urgencyScore}/100
                      </span>
                    </div>
                  ) : (
                    <span className="no-analysis">Analysis pending</span>
                  )}
                  <ChevronRight size={20} className="arrow" />
                </div>
              </Link>
            ))}
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-secondary"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </button>
              <span className="page-info">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                className="btn btn-secondary"
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.pages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Consultations;
