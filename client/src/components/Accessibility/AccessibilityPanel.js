import React, { useState } from 'react';
import {
  Accessibility,
  Moon,
  Sun,
  ZoomIn,
  ZoomOut,
  Pause,
  Contrast,
  X,
  Globe,
} from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useI18n } from '../../context/I18nContext';
import './AccessibilityPanel.css';

const AccessibilityPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    settings,
    toggleDarkMode,
    increaseFontSize,
    decreaseFontSize,
    toggleReducedMotion,
    toggleHighContrast,
  } = useAccessibility();
  const { language, changeLanguage, availableLanguages } = useI18n();

  const languageNames = {
    en: 'English',
    es: 'Español',
    fr: 'Français',
  };

  return (
    <>
      <button
        className="accessibility-toggle"
        onClick={() => setIsOpen(true)}
        aria-label="Open accessibility settings"
        title="Accessibility Settings"
      >
        <Accessibility size={20} />
      </button>

      {isOpen && (
        <div className="accessibility-overlay" onClick={() => setIsOpen(false)}>
          <div
            className="accessibility-panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Accessibility Settings"
          >
            <div className="panel-header">
              <h2>
                <Accessibility size={20} />
                Accessibility
              </h2>
              <button
                className="close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close accessibility settings"
              >
                <X size={20} />
              </button>
            </div>

            <div className="panel-content">
              {/* Language */}
              <div className="setting-group">
                <h3>
                  <Globe size={18} />
                  Language
                </h3>
                <div className="language-options">
                  {availableLanguages.map((lang) => (
                    <button
                      key={lang}
                      className={`lang-btn ${language === lang ? 'active' : ''}`}
                      onClick={() => changeLanguage(lang)}
                    >
                      {languageNames[lang] || lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div className="setting-group">
                <h3>Font Size</h3>
                <div className="font-size-controls">
                  <button
                    className="control-btn"
                    onClick={decreaseFontSize}
                    disabled={settings.fontSize === 'small'}
                    aria-label="Decrease font size"
                  >
                    <ZoomOut size={20} />
                  </button>
                  <span className="font-size-label">
                    {settings.fontSize.charAt(0).toUpperCase() + settings.fontSize.slice(1)}
                  </span>
                  <button
                    className="control-btn"
                    onClick={increaseFontSize}
                    disabled={settings.fontSize === 'x-large'}
                    aria-label="Increase font size"
                  >
                    <ZoomIn size={20} />
                  </button>
                </div>
              </div>

              {/* Dark Mode */}
              <div className="setting-group">
                <div className="setting-row">
                  <div className="setting-info">
                    {settings.darkMode ? <Moon size={18} /> : <Sun size={18} />}
                    <span>Dark Mode</span>
                  </div>
                  <button
                    className={`toggle-switch ${settings.darkMode ? 'active' : ''}`}
                    onClick={toggleDarkMode}
                    role="switch"
                    aria-checked={settings.darkMode}
                    aria-label="Toggle dark mode"
                  >
                    <span className="toggle-knob"></span>
                  </button>
                </div>
              </div>

              {/* Reduced Motion */}
              <div className="setting-group">
                <div className="setting-row">
                  <div className="setting-info">
                    <Pause size={18} />
                    <span>Reduce Motion</span>
                  </div>
                  <button
                    className={`toggle-switch ${settings.reducedMotion ? 'active' : ''}`}
                    onClick={toggleReducedMotion}
                    role="switch"
                    aria-checked={settings.reducedMotion}
                    aria-label="Toggle reduced motion"
                  >
                    <span className="toggle-knob"></span>
                  </button>
                </div>
              </div>

              {/* High Contrast */}
              <div className="setting-group">
                <div className="setting-row">
                  <div className="setting-info">
                    <Contrast size={18} />
                    <span>High Contrast</span>
                  </div>
                  <button
                    className={`toggle-switch ${settings.highContrast ? 'active' : ''}`}
                    onClick={toggleHighContrast}
                    role="switch"
                    aria-checked={settings.highContrast}
                    aria-label="Toggle high contrast"
                  >
                    <span className="toggle-knob"></span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AccessibilityPanel;
