'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import StatusBadge from '@/components/StatusBadge';
import GlassCard from '@/components/GlassCard';

export default function MisReclamosPage() {
  const router = useRouter();
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulating fetching from localStorage/mock API
    const savedClaims = JSON.parse(localStorage.getItem('lh_claims') || '[]');
    
    // Sort by status order: PENDING → IN_PROGRESS → RESOLVED → REJECTED
    // Within each group: oldest first (ascending date)
    const statusOrder: Record<string, number> = {
      'PENDING': 1,
      'IN_PROGRESS': 2,
      'RESOLVED': 3,
      'REJECTED': 4
    };
    
    savedClaims.sort((a: any, b: any) => {
      const statusA = statusOrder[a.status] || 99;
      const statusB = statusOrder[b.status] || 99;
      if (statusA !== statusB) return statusA - statusB;
      // Within same status: oldest first
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    
    setClaims(savedClaims);
    setLoading(false);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <main className="min-h-screen relative p-6 flex flex-col items-center">
      <div className="app-bg"></div>
      
      <div className="w-full max-w-lg space-y-8 z-10 pt-4">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <button onClick={() => router.push('/home')} className="text-white/60 hover:text-white flex items-center gap-2 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Inicio
          </button>
          <h1 className="text-2xl font-bold text-shadow">Mis Reclamos</h1>
        </div>

        {loading ? (
          <div className="flex justify-center p-20">
            <div className="w-8 h-8 border-4 border-[#2ECC71] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : claims.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-12 text-center space-y-4"
          >
            <div className="text-6xl opacity-40">📭</div>
            <h2 className="text-xl font-bold text-white/80">Sin reclamos aún</h2>
            <p className="text-white/40 text-sm">Tus reclamos se mostrarán aquí para que puedas seguir su resolución.</p>
            <button 
              onClick={() => router.push('/reclamo/nuevo')}
              className="btn-primary"
            >
              Comienza tu reclamo
            </button>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {claims.map((claim) => (
              <motion.div key={claim.id} variants={itemVariants}>
                <div className="glass-card p-6 group hover:border-[#2ECC71]/30 transition-all">
                  {/* Header row: icon + category + status badge */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl shrink-0">
                        {getIconForCategory(claim.category)}
                      </div>
                      <h3 className="text-white font-bold leading-tight">{claim.category}</h3>
                    </div>
                    <StatusBadge status={claim.status as any} size="sm" />
                  </div>

                  {/* Date row — separated clearly */}
                  <div className="flex items-center gap-2 mb-3 pl-1">
                    <span className="text-[10px] text-white/30">📅</span>
                    <p className="text-white/40 text-[11px] font-semibold">
                      {claim.date
                        ? new Date(claim.date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </p>
                  </div>

                  <div className="border-t border-white/5 pt-3 space-y-3">
                    <p className="text-white/70 text-sm line-clamp-2 italic">
                      &quot;{claim.description}&quot;
                    </p>
                    
                    <div className="flex items-center gap-2 text-white/40 text-xs">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {claim.address}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        <p className="text-center text-white/30 text-xs mt-12 pb-8">
          Actualizado en tiempo real por el Municipio.
        </p>
      </div>
    </main>
  );
}

function getIconForCategory(catLabel: string) {
  const icons: any = {
    'Alumbrado Público': '💡',
    'Calles y Veredas': '🛣️',
    'Agua y Cloacas': '💧',
    'Residuos': '🗑️',
    'Espacios Verdes': '🌳',
    'Servicios Sanitarios': '🏥',
    'Otros': '📋'
  };
  return icons[catLabel] || '❓';
}
