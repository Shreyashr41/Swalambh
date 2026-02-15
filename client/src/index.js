import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { I18nProvider } from './context/I18nContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import SkipLink from './components/Accessibility/SkipLink';
import AccessibilityPanel from './components/Accessibility/AccessibilityPanel';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <AccessibilityProvider>
          <AuthProvider>
            <SkipLink />
            <App />
            <AccessibilityPanel />
          </AuthProvider>
        </AccessibilityProvider>
      </I18nProvider>
    </BrowserRouter>
  </React.StrictMode>
);
