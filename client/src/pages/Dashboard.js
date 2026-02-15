import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircle,
  Activity,
  Bell,
  FileText,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { patientAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await patientAPI.getDashboard();
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '50vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const recentConsultations = dashboardData?.recentConsultations || [];
  const upcomingReminders = dashboardData?.upcomingReminders || [];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.firstName}!</h1>
          <p>Here's an overview of your health activity</p>
        </div>
        <Link to="/chat" className="btn btn-primary">
          <MessageCircle size={18} />
          Start Consultation
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon consultations">
            <MessageCircle size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.totalConsultations || 0}</span>
            <span className="stat-label">Total Consultations</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon reminders">
            <Bell size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.activeReminders || 0}</span>
            <span className="stat-label">Active Reminders</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon reports">
            <FileText size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.totalReports || 0}</span>
            <span className="stat-label">Health Reports</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon alerts">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.highRiskCount || 0}</span>
            <span className="stat-label">High Risk Alerts</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card recent-consultations">
          <div className="card-header">
            <h2>
              <Activity size={20} />
              Recent Consultations
            </h2>
            <Link to="/consultations" className="view-all-link">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="card-content">
            {recentConsultations.length === 0 ? (
              <div className="empty-state">
                <MessageCircle size={48} />
                <p>No consultations yet</p>
                <Link to="/chat" className="btn btn-outline">
                  Start Your First Consultation
                </Link>
              </div>
            ) : (
              <div className="consultation-list">
                {recentConsultations.map((consultation) => (
                  <Link
                    key={consultation._id}
                    to={`/consultations/${consultation._id}`}
                    className="consultation-item"
                  >
                    <div className="consultation-info">
                      <span className="consultation-id">{consultation.sessionId}</span>
                      <span className="consultation-date">
                        {new Date(consultation.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="consultation-meta">
                      <span className={`badge badge-${consultation.status === 'completed' ? 'low' : 'medium'}`}>
                        {consultation.status}
                      </span>
                      {consultation.analysisResult && (
                        <span className={`badge badge-${consultation.analysisResult.riskLevel}`}>
                          {consultation.analysisResult.riskLevel} risk
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card upcoming-reminders">
          <div className="card-header">
            <h2>
              <Bell size={20} />
              Upcoming Reminders
            </h2>
            <Link to="/reminders" className="view-all-link">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="card-content">
            {upcomingReminders.length === 0 ? (
              <div className="empty-state">
                <Bell size={48} />
                <p>No upcoming reminders</p>
                <Link to="/reminders" className="btn btn-outline">
                  Add a Reminder
                </Link>
              </div>
            ) : (
              <div className="reminder-list">
                {upcomingReminders.map((reminder) => (
                  <div key={reminder._id} className="reminder-item">
                    <div className={`reminder-icon ${reminder.type}`}>
                      {reminder.type === 'medication' ? '💊' : reminder.type === 'appointment' ? '🏥' : '📋'}
                    </div>
                    <div className="reminder-info">
                      <span className="reminder-title">{reminder.title}</span>
                      <span className="reminder-time">
                        <Clock size={14} />
                        {new Date(reminder.scheduledTime).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/chat" className="action-card">
            <MessageCircle size={32} />
            <span>AI Consultation</span>
            <p>Describe symptoms and get AI-powered analysis</p>
          </Link>
          <Link to="/reminders" className="action-card">
            <Bell size={32} />
            <span>Add Reminder</span>
            <p>Set medication or appointment reminders</p>
          </Link>
          <Link to="/reports" className="action-card">
            <FileText size={32} />
            <span>View Reports</span>
            <p>Access and download health reports</p>
          </Link>
          <Link to="/health-summary" className="action-card">
            <TrendingUp size={32} />
            <span>Health Summary</span>
            <p>Track your symptom progress over time</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
