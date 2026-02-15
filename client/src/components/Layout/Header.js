import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell, Search, X } from 'lucide-react';
import { reminderAPI } from '../../services/api';
import './Header.css';

const Header = ({ onMenuClick }) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await reminderAPI.getNotifications();
      setNotifications(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const clearNotification = async (reminderId) => {
    try {
      await reminderAPI.clearNotification(reminderId);
      setNotifications(notifications.filter((n) => n.reminderId !== reminderId));
    } catch (error) {
      console.error('Failed to clear notification:', error);
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-btn mobile-only" onClick={onMenuClick}>
          <Menu size={24} />
        </button>
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="header-right">
        <div className="notification-wrapper">
          <button
            className="notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="notification-badge">{notifications.length}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h4>Notifications</h4>
                {notifications.length > 0 && (
                  <button
                    className="clear-all"
                    onClick={() => {
                      notifications.forEach((n) => clearNotification(n.reminderId));
                    }}
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="notification-list">
                {notifications.length === 0 ? (
                  <p className="no-notifications">No new notifications</p>
                ) : (
                  notifications.map((notification) => (
                    <div key={notification.reminderId} className="notification-item">
                      <div className="notification-content">
                        <p className="notification-title">{notification.title}</p>
                        <p className="notification-desc">{notification.description}</p>
                        <span className="notification-time">
                          {new Date(notification.scheduledTime).toLocaleString()}
                        </span>
                      </div>
                      <button
                        className="dismiss-btn"
                        onClick={() => clearNotification(notification.reminderId)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <Link
                  to="/reminders"
                  className="view-all"
                  onClick={() => setShowNotifications(false)}
                >
                  View All Reminders
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
