import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    chat: 'Chat',
    consultations: 'Consultations',
    reminders: 'Reminders',
    reports: 'Reports',
    profile: 'Profile',
    healthSummary: 'Health Summary',
    logout: 'Logout',
    
    // Auth
    login: 'Log In',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    firstName: 'First Name',
    lastName: 'Last Name',
    forgotPassword: 'Forgot Password?',
    noAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
    
    // Chat
    typeMessage: 'Type your message...',
    send: 'Send',
    uploadImage: 'Upload Image',
    analyzing: 'Analyzing...',
    newConsultation: 'New Consultation',
    
    // Dashboard
    welcome: 'Welcome',
    recentConsultations: 'Recent Consultations',
    upcomingReminders: 'Upcoming Reminders',
    quickStats: 'Quick Stats',
    viewAll: 'View All',
    
    // Common
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    search: 'Search',
    filter: 'Filter',
    noResults: 'No results found',
    
    // Risk Levels
    lowRisk: 'Low Risk',
    mediumRisk: 'Medium Risk',
    highRisk: 'High Risk',
    
    // Status
    pending: 'Pending',
    active: 'Active',
    completed: 'Completed',
    cancelled: 'Cancelled',
    
    // Accessibility
    skipToContent: 'Skip to main content',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    darkMode: 'Toggle dark mode',
    increaseFontSize: 'Increase font size',
    decreaseFontSize: 'Decrease font size',
  },
  es: {
    // Navigation
    dashboard: 'Panel',
    chat: 'Chat',
    consultations: 'Consultas',
    reminders: 'Recordatorios',
    reports: 'Informes',
    profile: 'Perfil',
    healthSummary: 'Resumen de Salud',
    logout: 'Cerrar Sesión',
    
    // Auth
    login: 'Iniciar Sesión',
    register: 'Registrarse',
    email: 'Correo Electrónico',
    password: 'Contraseña',
    confirmPassword: 'Confirmar Contraseña',
    firstName: 'Nombre',
    lastName: 'Apellido',
    forgotPassword: '¿Olvidaste tu contraseña?',
    noAccount: '¿No tienes una cuenta?',
    haveAccount: '¿Ya tienes una cuenta?',
    
    // Chat
    typeMessage: 'Escribe tu mensaje...',
    send: 'Enviar',
    uploadImage: 'Subir Imagen',
    analyzing: 'Analizando...',
    newConsultation: 'Nueva Consulta',
    
    // Dashboard
    welcome: 'Bienvenido',
    recentConsultations: 'Consultas Recientes',
    upcomingReminders: 'Próximos Recordatorios',
    quickStats: 'Estadísticas',
    viewAll: 'Ver Todo',
    
    // Common
    loading: 'Cargando...',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    create: 'Crear',
    search: 'Buscar',
    filter: 'Filtrar',
    noResults: 'Sin resultados',
    
    // Risk Levels
    lowRisk: 'Riesgo Bajo',
    mediumRisk: 'Riesgo Medio',
    highRisk: 'Riesgo Alto',
    
    // Status
    pending: 'Pendiente',
    active: 'Activo',
    completed: 'Completado',
    cancelled: 'Cancelado',
    
    // Accessibility
    skipToContent: 'Saltar al contenido principal',
    openMenu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
    darkMode: 'Cambiar modo oscuro',
    increaseFontSize: 'Aumentar tamaño de fuente',
    decreaseFontSize: 'Disminuir tamaño de fuente',
  },
  fr: {
    // Navigation
    dashboard: 'Tableau de Bord',
    chat: 'Chat',
    consultations: 'Consultations',
    reminders: 'Rappels',
    reports: 'Rapports',
    profile: 'Profil',
    healthSummary: 'Résumé Santé',
    logout: 'Déconnexion',
    
    // Auth
    login: 'Connexion',
    register: "S'inscrire",
    email: 'Email',
    password: 'Mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    firstName: 'Prénom',
    lastName: 'Nom',
    forgotPassword: 'Mot de passe oublié?',
    noAccount: "Vous n'avez pas de compte?",
    haveAccount: 'Vous avez déjà un compte?',
    
    // Chat
    typeMessage: 'Tapez votre message...',
    send: 'Envoyer',
    uploadImage: 'Télécharger une image',
    analyzing: 'Analyse en cours...',
    newConsultation: 'Nouvelle Consultation',
    
    // Dashboard
    welcome: 'Bienvenue',
    recentConsultations: 'Consultations Récentes',
    upcomingReminders: 'Rappels à Venir',
    quickStats: 'Statistiques',
    viewAll: 'Voir Tout',
    
    // Common
    loading: 'Chargement...',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    create: 'Créer',
    search: 'Rechercher',
    filter: 'Filtrer',
    noResults: 'Aucun résultat',
    
    // Risk Levels
    lowRisk: 'Risque Faible',
    mediumRisk: 'Risque Moyen',
    highRisk: 'Risque Élevé',
    
    // Status
    pending: 'En attente',
    active: 'Actif',
    completed: 'Terminé',
    cancelled: 'Annulé',
    
    // Accessibility
    skipToContent: 'Passer au contenu principal',
    openMenu: 'Ouvrir le menu',
    closeMenu: 'Fermer le menu',
    darkMode: 'Basculer le mode sombre',
    increaseFontSize: 'Augmenter la taille de police',
    decreaseFontSize: 'Diminuer la taille de police',
  },
};

const I18nContext = createContext();

export const I18nProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || navigator.language.split('-')[0] || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key) => {
    const lang = translations[language] || translations.en;
    return lang[key] || translations.en[key] || key;
  };

  const changeLanguage = (newLang) => {
    if (translations[newLang]) {
      setLanguage(newLang);
    }
  };

  const availableLanguages = Object.keys(translations);

  return (
    <I18nContext.Provider value={{ language, t, changeLanguage, availableLanguages }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
