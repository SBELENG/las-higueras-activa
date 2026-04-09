// ============================================
// Las Higueras Activa — Configuración de Tema
// Punto central para cambiar colores, assets, y parámetros visuales
// ============================================

export const THEME = {
  colors: {
    bgDeep: '#0A192F',
    primary: '#1E5F9E',
    primaryLight: '#2B7BC8',
    accent: '#2ECC71',
    accentDark: '#27AE60',
    danger: '#E74C3C',
    warning: '#F39C12',
    success: '#2ECC71',
    white: '#FFFFFF',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    textMuted: 'rgba(255, 255, 255, 0.5)',
  },
  glass: {
    bg: 'rgba(255, 255, 255, 0.12)',
    bgHover: 'rgba(255, 255, 255, 0.16)',
    border: 'rgba(255, 255, 255, 0.25)',
    borderHover: 'rgba(255, 255, 255, 0.45)',
    blur: 'blur(20px) saturate(200%)',
    shadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
    radius: '24px',
  },
  assets: {
    bgImage: '/assets/foto-fondo.webp',
    logo: '/assets/logo.svg',
  },
  fonts: {
    heading: '"Montserrat", sans-serif',
    body: '"Inter", sans-serif',
  },
} as const;

// Estados de reclamo con colores
export const CLAIM_STATUS = {
  PENDING: { label: 'Pendiente', color: '#E74C3C', emoji: '🔴' },
  IN_PROGRESS: { label: 'En proceso', color: '#F39C12', emoji: '🟡' },
  RESOLVED: { label: 'Resuelto', color: '#2ECC71', emoji: '🟢' },
} as const;

// Categorías de reclamo
export const CLAIM_CATEGORIES = [
  { id: 'alumbrado', label: 'Alumbrado Público', icon: '💡', critical: false },
  { id: 'calles', label: 'Calles y Veredas', icon: '🛣️', critical: false },
  { id: 'agua', label: 'Agua y Cloacas', icon: '💧', critical: false },
  { id: 'residuos', label: 'Residuos', icon: '🗑️', critical: false },
  { id: 'espacios_verdes', label: 'Espacios Verdes', icon: '🌳', critical: false },
  { id: 'sanitarios', label: 'Servicios Sanitarios', icon: '🏥', critical: true },
  { id: 'otros', label: 'Otros', icon: '📋', critical: false },
] as const;

// Tipos de usuario
export const USER_TYPES = [
  { id: 'vecino', label: 'Vecino', icon: '🏠' },
  { id: 'comercio', label: 'Comercio', icon: '🏪' },
  { id: 'institucion', label: 'Institución', icon: '🏛️' },
  { id: 'escuela', label: 'Escuela', icon: '🏫' },
] as const;

export const MAX_DAILY_CLAIMS = 3;
