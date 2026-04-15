'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-black/40 rounded-2xl border border-white/10 p-8">
          <span className="text-4xl">🗺️</span>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest text-center">
            Mapa no disponible
          </p>
          <p className="text-white/20 text-[10px] text-center max-w-xs">
            {this.state.error?.message || 'Error al cargar el componente'}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
