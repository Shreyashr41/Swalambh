import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { patientAPI } from '../services/api';
import './HealthSummary.css';

const HealthSummary = () => {
  const [healthData, setHealthData] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    try {
      const [profileRes, consultationsRes] = await Promise.all([
        patientAPI.getProfile(),
        patientAPI.getConsultations(),
      ]);
      
      setConsultations(consultationsRes.data.data);
      processHealthData(consultationsRes.data.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processHealthData = (data) => {
    // Process consultations for charts
    const now = new Date();
    const filteredData = data.filter(c => {
      const date = new Date(c.createdAt);
      if (timeRange === 'week') {
        return now - date <= 7 * 24 * 60 * 60 * 1000;
      } else if (timeRange === 'month') {
        return now - date <= 30 * 24 * 60 * 60 * 1000;
      } else {
        return now - date <= 365 * 24 * 60 * 60 * 1000;
      }
    });

    // Symptom frequency
    const symptomCounts = {};
    filteredData.forEach(c => {
      c.symptoms?.forEach(s => {
        const key = s.description?.toLowerCase() || 'unknown';
        symptomCounts[key] = (symptomCounts[key] || 0) + 1;
      });
    });

    // Risk level distribution
    const riskLevels = { low: 0, medium: 0, high: 0 };
    filteredData.forEach(c => {
      if (c.analysisResult?.riskLevel) {
        riskLevels[c.analysisResult.riskLevel]++;
      }
    });

    // Timeline data
    const timelineData = generateTimelineData(filteredData, timeRange);

    setHealthData({
      symptomCounts,
      riskLevels,
      timelineData,
      totalConsultations: filteredData.length,
      avgUrgency: calculateAvgUrgency(filteredData),
    });
  };

  const generateTimelineData = (data, range) => {
    const grouped = {};
    data.forEach(c => {
      const date = new Date(c.createdAt);
      let key;
      if (range === 'week') {
        key = date.toLocaleDateString('en-US', { weekday: 'short' });
      } else if (range === 'month') {
        key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
        key = date.toLocaleDateString('en-US', { month: 'short' });
      }
      
      if (!grouped[key]) {
        grouped[key] = { name: key, consultations: 0, avgUrgency: 0, urgencySum: 0 };
      }
      grouped[key].consultations++;
      grouped[key].urgencySum += c.analysisResult?.urgencyScore || 0;
      grouped[key].avgUrgency = grouped[key].urgencySum / grouped[key].consultations;
    });

    return Object.values(grouped).slice(-10);
  };

  const calculateAvgUrgency = (data) => {
    const withScores = data.filter(c => c.analysisResult?.urgencyScore);
    if (withScores.length === 0) return 0;
    const sum = withScores.reduce((acc, c) => acc + c.analysisResult.urgencyScore, 0);
    return Math.round(sum / withScores.length);
  };

  const RISK_COLORS = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '50vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  const pieData = healthData?.riskLevels
    ? Object.entries(healthData.riskLevels)
        .filter(([_, value]) => value > 0)
        .map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="health-summary">
      <div className="page-header">
        <div>
          <h1>
            <Activity size={28} />
            Health Summary
          </h1>
          <p>Track your symptoms and health trends over time</p>
        </div>
        <div className="time-selector">
          <button
            className={`time-btn ${timeRange === 'week' ? 'active' : ''}`}
            onClick={() => setTimeRange('week')}
          >
            Week
          </button>
          <button
            className={`time-btn ${timeRange === 'month' ? 'active' : ''}`}
            onClick={() => setTimeRange('month')}
          >
            Month
          </button>
          <button
            className={`time-btn ${timeRange === 'year' ? 'active' : ''}`}
            onClick={() => setTimeRange('year')}
          >
            Year
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card card">
          <div className="stat-icon consultations">
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{healthData?.totalConsultations || 0}</span>
            <span className="stat-label">Consultations</span>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon urgency">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{healthData?.avgUrgency || 0}%</span>
            <span className="stat-label">Avg. Urgency</span>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon symptoms">
            <Activity size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">
              {Object.keys(healthData?.symptomCounts || {}).length}
            </span>
            <span className="stat-label">Unique Symptoms</span>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon resolved">
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">
              {consultations.filter(c => c.status === 'completed').length}
            </span>
            <span className="stat-label">Resolved</span>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        {/* Consultation Timeline */}
        <div className="card chart-card">
          <h2>Consultation Activity</h2>
          {healthData?.timelineData?.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={healthData.timelineData}>
                <defs>
                  <linearGradient id="colorConsultations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="consultations"
                  stroke="#2563eb"
                  fill="url(#colorConsultations)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">No data for selected period</div>
          )}
        </div>

        {/* Risk Distribution */}
        <div className="card chart-card">
          <h2>Risk Level Distribution</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => 
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={RISK_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">No risk assessments yet</div>
          )}
        </div>

        {/* Urgency Trend */}
        <div className="card chart-card wide">
          <h2>Urgency Score Trend</h2>
          {healthData?.timelineData?.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={healthData.timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="avgUrgency"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ fill: '#f59e0b', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">No urgency data available</div>
          )}
        </div>
      </div>

      {/* Top Symptoms */}
      <div className="card">
        <h2>Most Reported Symptoms</h2>
        {Object.keys(healthData?.symptomCounts || {}).length > 0 ? (
          <div className="symptoms-ranking">
            {Object.entries(healthData.symptomCounts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([symptom, count], index) => (
                <div key={symptom} className="symptom-rank-item">
                  <span className="rank">{index + 1}</span>
                  <span className="symptom-name">{symptom}</span>
                  <span className="symptom-count">{count} time{count !== 1 ? 's' : ''}</span>
                  <div className="symptom-bar">
                    <div
                      className="symptom-fill"
                      style={{
                        width: `${(count / Math.max(...Object.values(healthData.symptomCounts))) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="no-data">No symptoms recorded yet</div>
        )}
      </div>
    </div>
  );
};

export default HealthSummary;
