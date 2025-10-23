import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      'nav.home': 'Home',
      'nav.login': 'Login',
      'nav.logout': 'Logout',
      'nav.dashboard': 'Dashboard',
      'nav.transactions': 'Transactions',
      'nav.history': 'History',
      'nav.settings': 'Settings',

      // Common
      'common.loading': 'Loading...',
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.view': 'View',
      'common.submit': 'Submit',
      'common.back': 'Back',
      'common.next': 'Next',
      'common.previous': 'Previous',
      'common.search': 'Search',
      'common.filter': 'Filter',

      // Transaction Types
      'transaction.deposit': 'Deposit',
      'transaction.withdraw': 'Withdrawal',
      'transaction.pending': 'Pending',
      'transaction.success': 'Success',
      'transaction.failed': 'Failed',
      'transaction.cancelled': 'Cancelled',
      'transaction.in_progress': 'In Progress',

      // Forms
      'form.username': 'Username',
      'form.password': 'Password',
      'form.email': 'Email',
      'form.amount': 'Amount',
      'form.currency': 'Currency',
      'form.notes': 'Notes',
      'form.required': 'This field is required',

      // Messages
      'message.success': 'Operation successful',
      'message.error': 'An error occurred',
      'message.confirm': 'Are you sure?',
      'message.noData': 'No data available',

      // Player
      'player.newTransaction': 'New Transaction',
      'player.transactionHistory': 'Transaction History',
      'player.selectLanguage': 'Select Language',

      // Agent
      'agent.tasks': 'Tasks',
      'agent.processTransaction': 'Process Transaction',
      'agent.uploadEvidence': 'Upload Evidence',

      // Admin
      'admin.assignAgent': 'Assign Agent',
      'admin.updateStatus': 'Update Status',
      'admin.manageAgents': 'Manage Agents',
      'admin.configuration': 'Configuration',
    },
  },
  es: {
    translation: {
      // Navigation
      'nav.home': 'Inicio',
      'nav.login': 'Iniciar sesión',
      'nav.logout': 'Cerrar sesión',
      'nav.dashboard': 'Panel',
      'nav.transactions': 'Transacciones',
      'nav.history': 'Historial',
      'nav.settings': 'Configuración',

      // Common
      'common.loading': 'Cargando...',
      'common.save': 'Guardar',
      'common.cancel': 'Cancelar',
      'common.delete': 'Eliminar',
      'common.edit': 'Editar',
      'common.view': 'Ver',
      'common.submit': 'Enviar',
      'common.back': 'Atrás',
      'common.next': 'Siguiente',
      'common.previous': 'Anterior',
      'common.search': 'Buscar',
      'common.filter': 'Filtrar',

      // Transaction Types
      'transaction.deposit': 'Depósito',
      'transaction.withdraw': 'Retiro',
      'transaction.pending': 'Pendiente',
      'transaction.success': 'Éxito',
      'transaction.failed': 'Fallido',
      'transaction.cancelled': 'Cancelado',
      'transaction.in_progress': 'En Progreso',
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;

