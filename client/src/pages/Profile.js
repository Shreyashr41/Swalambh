import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Heart,
  Pill,
  AlertCircle,
  Save,
  Edit2,
  Plus,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { patientAPI } from '../services/api';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    medicalHistory: {
      conditions: [],
      medications: [],
      allergies: [],
    },
  });
  const [newItem, setNewItem] = useState({ conditions: '', medications: '', allergies: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await patientAPI.getProfile();
      const data = response.data.data;
      setProfile(data);
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phone: data.phone || '',
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
        medicalHistory: {
          conditions: data.medicalHistory?.conditions || [],
          medications: data.medicalHistory?.medications || [],
          allergies: data.medicalHistory?.allergies || [],
        },
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await patientAPI.updateProfile(formData);
      setProfile({ ...profile, ...formData });
      setEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const addItem = (field) => {
    if (!newItem[field].trim()) return;
    setFormData({
      ...formData,
      medicalHistory: {
        ...formData.medicalHistory,
        [field]: [...formData.medicalHistory[field], newItem[field].trim()],
      },
    });
    setNewItem({ ...newItem, [field]: '' });
  };

  const removeItem = (field, index) => {
    setFormData({
      ...formData,
      medicalHistory: {
        ...formData.medicalHistory,
        [field]: formData.medicalHistory[field].filter((_, i) => i !== index),
      },
    });
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '50vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="page-header">
        <div>
          <h1>
            <User size={28} />
            Profile
          </h1>
          <p>Manage your personal information and medical history</p>
        </div>
        {!editing ? (
          <button className="btn btn-secondary" onClick={() => setEditing(true)}>
            <Edit2 size={18} />
            Edit Profile
          </button>
        ) : (
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={() => setEditing(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <div className="profile-grid">
        {/* Personal Info */}
        <div className="card profile-section">
          <h2>Personal Information</h2>
          <div className="profile-fields">
            <div className="field">
              <label>
                <Mail size={16} />
                Email
              </label>
              <input type="email" value={profile?.email || user?.email || ''} disabled />
              <span className="field-note">Email cannot be changed</span>
            </div>

            <div className="field-row">
              <div className="field">
                <label>First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  disabled={!editing}
                  placeholder="Enter first name"
                />
              </div>
              <div className="field">
                <label>Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  disabled={!editing}
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label>
                  <Phone size={16} />
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!editing}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="field">
                <label>
                  <Calendar size={16} />
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  disabled={!editing}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Medical History */}
        <div className="card profile-section">
          <h2>Medical History</h2>
          
          {/* Conditions */}
          <div className="history-group">
            <h3>
              <Heart size={18} className="icon-red" />
              Medical Conditions
            </h3>
            <div className="tags-container">
              {formData.medicalHistory.conditions.map((condition, index) => (
                <span key={index} className="tag">
                  {condition}
                  {editing && (
                    <button onClick={() => removeItem('conditions', index)}>
                      <X size={14} />
                    </button>
                  )}
                </span>
              ))}
              {formData.medicalHistory.conditions.length === 0 && (
                <span className="no-items">No conditions recorded</span>
              )}
            </div>
            {editing && (
              <div className="add-item">
                <input
                  type="text"
                  value={newItem.conditions}
                  onChange={(e) => setNewItem({ ...newItem, conditions: e.target.value })}
                  placeholder="Add condition..."
                  onKeyDown={(e) => e.key === 'Enter' && addItem('conditions')}
                />
                <button className="btn btn-sm" onClick={() => addItem('conditions')}>
                  <Plus size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Medications */}
          <div className="history-group">
            <h3>
              <Pill size={18} className="icon-blue" />
              Current Medications
            </h3>
            <div className="tags-container">
              {formData.medicalHistory.medications.map((medication, index) => (
                <span key={index} className="tag medication">
                  {medication}
                  {editing && (
                    <button onClick={() => removeItem('medications', index)}>
                      <X size={14} />
                    </button>
                  )}
                </span>
              ))}
              {formData.medicalHistory.medications.length === 0 && (
                <span className="no-items">No medications recorded</span>
              )}
            </div>
            {editing && (
              <div className="add-item">
                <input
                  type="text"
                  value={newItem.medications}
                  onChange={(e) => setNewItem({ ...newItem, medications: e.target.value })}
                  placeholder="Add medication..."
                  onKeyDown={(e) => e.key === 'Enter' && addItem('medications')}
                />
                <button className="btn btn-sm" onClick={() => addItem('medications')}>
                  <Plus size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Allergies */}
          <div className="history-group">
            <h3>
              <AlertCircle size={18} className="icon-orange" />
              Allergies
            </h3>
            <div className="tags-container">
              {formData.medicalHistory.allergies.map((allergy, index) => (
                <span key={index} className="tag allergy">
                  {allergy}
                  {editing && (
                    <button onClick={() => removeItem('allergies', index)}>
                      <X size={14} />
                    </button>
                  )}
                </span>
              ))}
              {formData.medicalHistory.allergies.length === 0 && (
                <span className="no-items">No allergies recorded</span>
              )}
            </div>
            {editing && (
              <div className="add-item">
                <input
                  type="text"
                  value={newItem.allergies}
                  onChange={(e) => setNewItem({ ...newItem, allergies: e.target.value })}
                  placeholder="Add allergy..."
                  onKeyDown={(e) => e.key === 'Enter' && addItem('allergies')}
                />
                <button className="btn btn-sm" onClick={() => addItem('allergies')}>
                  <Plus size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
