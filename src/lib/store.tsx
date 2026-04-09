'use client';

import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { User, Claim, Message, ClaimStatus, CategoryId } from './types';
import { CLAIM_CATEGORIES, MAX_DAILY_CLAIMS } from '@/config/theme';

// ============================================
// Estado global de la aplicación
// ============================================

interface AppState {
  user: User | null;
  claims: Claim[];
  messages: Message[];
  isLoggedIn: boolean;
}

type Action =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'ADD_CLAIM'; payload: Claim }
  | { type: 'UPDATE_CLAIM_STATUS'; payload: { id: string; status: ClaimStatus } }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'MARK_MESSAGE_READ'; payload: string }
  | { type: 'LOAD_STATE'; payload: AppState };

const initialState: AppState = {
  user: null,
  claims: [],
  messages: [],
  isLoggedIn: false,
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload, isLoggedIn: true };
    case 'LOGOUT':
      return { ...initialState };
    case 'ADD_CLAIM':
      return { ...state, claims: [action.payload, ...state.claims] };
    case 'UPDATE_CLAIM_STATUS':
      return {
        ...state,
        claims: state.claims.map((c) =>
          c.id === action.payload.id
            ? {
                ...c,
                status: action.payload.status,
                updatedAt: new Date().toISOString(),
                ...(action.payload.status === 'RESOLVED' ? { resolvedAt: new Date().toISOString() } : {}),
              }
            : c
        ),
      };
    case 'ADD_MESSAGE':
      return { ...state, messages: [action.payload, ...state.messages] };
    case 'MARK_MESSAGE_READ':
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.payload ? { ...m, read: true } : m
        ),
      };
    case 'LOAD_STATE':
      return action.payload;
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  todayClaimsCount: () => number;
  canCreateClaim: () => boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Cargar estado persistido
  useEffect(() => {
    try {
      const saved = localStorage.getItem('lh-activa-state');
      if (saved) {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'LOAD_STATE', payload: parsed });
      } else {
        // Cargar datos demo
        loadDemoData(dispatch);
      }
    } catch {
      loadDemoData(dispatch);
    }
  }, []);

  // Persistir en cada cambio
  useEffect(() => {
    if (state.isLoggedIn) {
      localStorage.setItem('lh-activa-state', JSON.stringify(state));
    }
  }, [state]);

  const todayClaimsCount = () => {
    const today = new Date().toISOString().split('T')[0];
    return state.claims.filter(
      (c) => c.userId === state.user?.id && c.createdAt.startsWith(today)
    ).length;
  };

  const canCreateClaim = () => todayClaimsCount() < MAX_DAILY_CLAIMS;

  return (
    <AppContext.Provider value={{ state, dispatch, todayClaimsCount, canCreateClaim }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider');
  return ctx;
}

// ============================================
// Datos demo para primera carga
// ============================================
function loadDemoData(dispatch: React.Dispatch<Action>) {
  const demoClaims: Claim[] = [
    {
      id: 'demo-1',
      userId: 'demo-user',
      userName: 'María González',
      category: 'alumbrado',
      categoryLabel: 'Alumbrado Público',
      description: 'La luminaria de la esquina de Av. San Martín y Belgrano no funciona hace 3 días.',
      latitude: -33.08,
      longitude: -64.35,
      address: 'Av. San Martín y Belgrano',
      status: 'PENDING',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'demo-2',
      userId: 'demo-user',
      userName: 'Carlos Ruiz',
      category: 'calles',
      categoryLabel: 'Calles y Veredas',
      description: 'Bache peligroso en calle Sarmiento al 400. Varios vehículos dañados.',
      latitude: -33.082,
      longitude: -64.348,
      address: 'Calle Sarmiento 400',
      status: 'IN_PROGRESS',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'demo-3',
      userId: 'demo-user',
      userName: 'Ana López',
      category: 'residuos',
      categoryLabel: 'Residuos',
      description: 'Contenedor desbordado en la plaza principal. Necesita recolección urgente.',
      latitude: -33.079,
      longitude: -64.352,
      address: 'Plaza Principal',
      status: 'RESOLVED',
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      resolvedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 'demo-4',
      userId: 'other-user',
      userName: 'Roberto Pérez',
      category: 'agua',
      categoryLabel: 'Agua y Cloacas',
      description: 'Pérdida de agua en la esquina de Mitre y Rivadavia. Lleva varios días.',
      latitude: -33.085,
      longitude: -64.345,
      address: 'Mitre y Rivadavia',
      status: 'PENDING',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'demo-5',
      userId: 'other-user',
      userName: 'Laura Fernández',
      category: 'espacios_verdes',
      categoryLabel: 'Espacios Verdes',
      description: 'Árbol caído en Parque Municipal bloquea el camino peatonal.',
      latitude: -33.077,
      longitude: -64.355,
      address: 'Parque Municipal',
      status: 'IN_PROGRESS',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
  ];

  const demoMessages: Message[] = [
    {
      id: 'msg-1',
      title: 'Bienvenido a Las Higueras Activa',
      body: 'Gracias por registrarte. A través de esta app podés hacer reclamos y seguir su estado en tiempo real. ¡Tu voz importa!',
      date: new Date().toISOString(),
      read: false,
      from: 'Municipalidad de Las Higueras',
    },
    {
      id: 'msg-2',
      title: 'Jornada de Limpieza Comunitaria',
      body: 'Este sábado realizamos una jornada de limpieza en el Parque Municipal. ¡Te esperamos de 9 a 12hs!',
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
      read: false,
      from: 'Secretaría de Ambiente',
    },
    {
      id: 'msg-3',
      title: 'Nuevo sistema de recolección',
      body: 'A partir del lunes cambian los horarios de recolección de residuos. Consultá el nuevo cronograma en la sección de novedades.',
      date: new Date(Date.now() - 86400000 * 5).toISOString(),
      read: true,
      from: 'Dirección de Servicios Públicos',
    },
  ];

  demoClaims.forEach((c) => dispatch({ type: 'ADD_CLAIM', payload: c }));
  demoMessages.forEach((m) => dispatch({ type: 'ADD_MESSAGE', payload: m }));
}

// Helper: generar ID único
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
