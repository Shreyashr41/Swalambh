import React, { useState, useEffect } from 'react';
import {
  Bell,
  Plus,
  Pill,
  Calendar,
  Clock,
  Trash2,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import { reminderAPI } from '../services/api';
import './Reminders.css';

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newReminder, setNewReminder] = useState({
    type: 'medication',
    title: '',
    description: '',
    scheduledTime: '',
    frequency: 'daily',
    notificationMethod: ['push'],
  });

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const response = await reminderAPI.getAll();
      setReminders(response.data.data);
    } catch (error) {
      console.error('Failed to fetch reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await reminderAPI.create(newReminder);
      setShowModal(false);
      setNewReminder({
        type: 'medication',
        title: '',
        description: '',
        scheduledTime: '',
        frequency: 'daily',
        notificationMethod: ['push'],
      });
      fetchReminders();
    } catch (error) {
      console.error('Failed to create reminder:', error);
      alert('Failed to create reminder');
    }
  };

  const handleMarkComplete = async (id) => {
    try {
      await reminderAPI.markComplete(id);
      fetchReminders();
    } catch (error) {
      console.error('Failed to mark complete:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this reminder?')) return;
    try {
      await reminderAPI.delete(id);
      fetchReminders();
    } catch (error) {
      console.error('Failed to delete reminder:', error);
    }
  };

  const groupedReminders = {
    upcoming: reminders.filter(r => r.status === 'pending' || r.status === 'active'),
    completed: reminders.filter(r => r.status === 'completed'),
    cancelled: reminders.filter(r => r.status === 'cancelled'),
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '50vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="reminders-page">
      <div className="page-header">
        <div>
          <h1>
            <Bell size={28} />
            Reminders
          </h1>
          <p>Manage your medication and appointment reminders</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          New Reminder
        </button>
      </div>

      <div className="reminders-sections">
        {/* Upcoming */}
        <section className="reminder-section">
          <h2>
            <Clock size={20} />
            Upcoming ({groupedReminders.upcoming.length})
          </h2>
          {groupedReminders.upcoming.length === 0 ? (
            <div className="empty-section card">
              <Bell size={32} />
              <p>No upcoming reminders</p>
              <button className="btn btn-secondary" onClick={() => setShowModal(true)}>
                Create One
              </button>
            </div>
          ) : (
            <div className="reminders-list">
              {groupedReminders.upcoming.map((reminder) => (
                <ReminderCard
                  key={reminder._id}
                  reminder={reminder}
                  onComplete={handleMarkComplete}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </section>

        {/* Completed */}
        {groupedReminders.completed.length > 0 && (
          <section className="reminder-section">
            <h2>
              <Check size={20} />
              Completed ({groupedReminders.completed.length})
            </h2>
            <div className="reminders-list">
              {groupedReminders.completed.slice(0, 5).map((reminder) => (
                <ReminderCard
                  key={reminder._id}
                  reminder={reminder}
                  onDelete={handleDelete}
                  completed
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Reminder</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Type</label>
                <div className="type-selector">
                  <button
                    type="button"
                    className={`type-btn ${newReminder.type === 'medication' ? 'active' : ''}`}
                    onClick={() => setNewReminder({ ...newReminder, type: 'medication' })}
                  >
                    <Pill size={20} />
                    Medication
                  </button>
                  <button
                    type="button"
                    className={`type-btn ${newReminder.type === 'appointment' ? 'active' : ''}`}
                    onClick={() => setNewReminder({ ...newReminder, type: 'appointment' })}
                  >
                    <Calendar size={20} />
                    Appointment
                  </button>
                  <button
                    type="button"
                    className={`type-btn ${newReminder.type === 'follow-up' ? 'active' : ''}`}
                    onClick={() => setNewReminder({ ...newReminder, type: 'follow-up' })}
                  >
                    <AlertCircle size={20} />
                    Follow-up
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  value={newReminder.title}
                  onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                  placeholder="e.g., Take vitamin D"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={newReminder.description}
                  onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                  placeholder="Additional details..."
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="scheduledTime">Date & Time *</label>
                  <input
                    type="datetime-local"
                    id="scheduledTime"
                    value={newReminder.scheduledTime}
                    onChange={(e) => setNewReminder({ ...newReminder, scheduledTime: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="frequency">Frequency</label>
                  <select
                    id="frequency"
                    value={newReminder.frequency}
                    onChange={(e) => setNewReminder({ ...newReminder, frequency: e.target.value })}
                  >
                    <option value="once">Once</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const ReminderCard = ({ reminder, onComplete, onDelete, completed }) => {
  const getIcon = () => {
    switch (reminder.type) {
      case 'medication':
        return <Pill size={24} />;
      case 'appointment':
        return <Calendar size={24} />;
      default:
        return <Bell size={24} />;
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className={`reminder-card card ${completed ? 'completed' : ''}`}>
      <div className={`reminder-icon ${reminder.type}`}>
        {getIcon()}
      </div>
      <div className="reminder-content">
        <h3>{reminder.title}</h3>
        {reminder.description && <p>{reminder.description}</p>}
        <div className="reminder-meta">
          <span className="reminder-time">
            <Clock size={14} />
            {formatTime(reminder.scheduledTime)}
          </span>
          {reminder.frequency !== 'once' && (
            <span className="reminder-frequency">{reminder.frequency}</span>
          )}
        </div>
      </div>
      <div className="reminder-actions">
        {!completed && onComplete && (
          <button
            className="action-btn complete"
            onClick={() => onComplete(reminder._id)}
            title="Mark as complete"
          >
            <Check size={18} />
          </button>
        )}
        <button
          className="action-btn delete"
          onClick={() => onDelete(reminder._id)}
          title="Delete"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default Reminders;
