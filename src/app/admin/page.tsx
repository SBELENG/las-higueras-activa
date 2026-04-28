'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamicMap from 'next/dynamic';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const InteractiveMap = dynamicMap(() => import('../../components/InteractiveMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-black/20 animate-pulse rounded-2xl border border-white/5" />
});

const INITIAL_CENTER = { lat: -33.0858, lng: -64.2934 }; // Centro de Las Higueras

export default function AdminDashboardPage() {
  const [isClient, setIsClient] = useState(false);
  const [claims, setClaims] = useState<any[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<any[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<any>(null);
  const [observation, setObservation] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejection, setShowRejection] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [isZoomed, setIsZoomed] = useState(false);
  const [mapCenter, setMapCenter] = useState(INITIAL_CENTER);
  const [mapZoom, setMapZoom] = useState(14);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [metrics, setMetrics] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0,
    priorities: 0
  });
  const [newClaimAlert, setNewClaimAlert] = useState<{show: boolean, message: string}>({show: false, message: ''});
  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const prevCountRef = React.useRef<number>(-1);

  useEffect(() => setIsClient(true), []);

  // Unlock AudioContext on first user interaction
  useEffect(() => {
    const init = () => {
      if (!audioCtxRef.current) {
        try { audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch(e) {}
      }
      document.removeEventListener('click', init);
    };
    document.addEventListener('click', init);
    return () => document.removeEventListener('click', init);
  }, []);

  useEffect(() => {
    const userStr = localStorage.getItem('lh_admin_user');
    if (userStr) setCurrentUser(JSON.parse(userStr));
    else {
      // Por defecto para testing
      setCurrentUser({ name: 'Gestor Municipal', role: 'gestor' });
    }
  }, []);

  const loadData = React.useCallback(() => {
    const allClaims = JSON.parse(localStorage.getItem('lh_claims') || '[]');
    setClaims(allClaims);
    
    // Metrics should be calculated before applying the status filter to show global distribution in the sidebar
    let contextFiltered = [...allClaims];
    if (categoryFilter !== 'all') contextFiltered = contextFiltered.filter((c) => c.category === categoryFilter);
    if (roleFilter !== 'all') contextFiltered = contextFiltered.filter((c) => c.user_role === roleFilter);
    if (timeFilter !== 'all') {
       const now = new Date();
       contextFiltered = contextFiltered.filter((c) => {
          const claimDate = new Date(c.date);
          if (timeFilter === 'today') return claimDate.toDateString() === now.toDateString();
          if (timeFilter === 'week') return claimDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (timeFilter === 'month') return claimDate.getMonth() === now.getMonth() && claimDate.getFullYear() === now.getFullYear();
          if (timeFilter === 'year') return claimDate.getFullYear() === now.getFullYear();
          return true;
       });
    }

    setMetrics({
      total: contextFiltered.length,
      pending: contextFiltered.filter((c: any) => c.status === 'PENDING').length,
      inProgress: contextFiltered.filter((c: any) => c.status === 'IN_PROGRESS').length,
      resolved: contextFiltered.filter((c: any) => c.status === 'RESOLVED').length,
      rejected: contextFiltered.filter((c: any) => c.status === 'REJECTED').length,
      priorities: contextFiltered.filter((c: any) => c.priority).length
    });

    // Now apply status filter for the actual list
    let filtered = [...contextFiltered];
    if (statusFilter !== 'all') {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }
    
    filtered.sort((a, b) => {
      if (a.priority && !b.priority) return -1;
      if (!a.priority && b.priority) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    setFilteredClaims(filtered);
  }, [statusFilter, categoryFilter, roleFilter, timeFilter]);

  // IMPORTANT: This useEffect must be BEFORE the conditional return to comply with React Rules of Hooks
  useEffect(() => {
    if (!isClient) return;
    loadData();
  }, [isClient, loadData]);

  const playNotifSound = React.useCallback(() => {
    try {
      const ctx = audioCtxRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;
      const t = ctx.currentTime;
      const o1 = ctx.createOscillator(); const g1 = ctx.createGain();
      o1.connect(g1); g1.connect(ctx.destination);
      o1.frequency.setValueAtTime(523, t); o1.frequency.setValueAtTime(659, t + 0.15);
      g1.gain.setValueAtTime(0.3, t); g1.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
      o1.start(t); o1.stop(t + 0.4);
      const o2 = ctx.createOscillator(); const g2 = ctx.createGain();
      o2.connect(g2); g2.connect(ctx.destination);
      o2.frequency.setValueAtTime(784, t + 0.2);
      g2.gain.setValueAtTime(0, t); g2.gain.setValueAtTime(0.3, t + 0.2);
      g2.gain.exponentialRampToValueAtTime(0.01, t + 0.6);
      o2.start(t + 0.2); o2.stop(t + 0.6);
    } catch (e) { console.warn('Sound error:', e); }
  }, []);

  // Poll for new claims every 5 seconds
  useEffect(() => {
    if (!isClient) return;
    const check = () => {
      const all = JSON.parse(localStorage.getItem('lh_claims') || '[]');
      const count = all.length;
      if (prevCountRef.current === -1) { prevCountRef.current = count; return; }
      if (count > prevCountRef.current) {
        const diff = count - prevCountRef.current;
        prevCountRef.current = count;
        playNotifSound();
        setNewClaimAlert({ show: true, message: `🚨 ${diff} nuevo${diff > 1 ? 's' : ''} reclamo${diff > 1 ? 's' : ''} recibido${diff > 1 ? 's' : ''}` });
        loadData();
        setTimeout(() => setNewClaimAlert({show: false, message: ''}), 8000);
      }
    };
    const id = setInterval(check, 5000);
    return () => clearInterval(id);
  }, [isClient, loadData, playNotifSound]);

  // IMPORTANT: getMarkerIcon must also be BEFORE the conditional return (Rules of Hooks)
  const getMarkerIcon = React.useCallback((status: string) => {
    return {
      path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
      fillColor: status === 'RESOLVED' ? '#2ECC71' : status === 'IN_PROGRESS' ? '#F1C40F' : '#E74C3C',
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: '#FFFFFF',
      scale: 1.5,
      anchor: { x: 12, y: 24 } as any,
    };
  }, []);

  if (!isClient) return null;

  const handleTogglePriority = (claimId: string, e: any) => {
    e.stopPropagation();
    const updated = claims.map(c => c.id === claimId ? { ...c, priority: !c.priority } : c);
    localStorage.setItem('lh_claims', JSON.stringify(updated));
    loadData();
    if (selectedClaim?.id === claimId) {
      setSelectedClaim(updated.find(c => c.id === claimId));
    }
  };

  const handleStatusChange = (claimId: string, newStatus: string, reason?: string) => {
    const updatedClaims = claims.map(c => {
      if (c.id === claimId) {
        // Strategic: Notify the user in 'lh_messages'
        const messages = JSON.parse(localStorage.getItem('lh_messages') || '[]');
        const now = new Date();
        const dateStr = now.toLocaleDateString();
        
        let statusTitle = 'Actualización de Reclamo';
        let statusBody = `Novedades sobre su reclamo #${c.id}: el estado ha cambiado a ${newStatus === 'IN_PROGRESS' ? 'EN PROCESO' : newStatus === 'RESOLVED' ? 'RESUELTO' : 'RECHAZADO'}.`;
        
        if (newStatus === 'REJECTED') {
          statusTitle = 'Reclamo No Corresponde';
          statusBody = `Su reclamo #${c.id} ha sido rechazado. Motivo: ${reason || 'Información insuficiente o no encuadra en servicios municipales.'}`;
        }

        const newMessage = {
          id: Date.now(),
          from: 'Gestión Municipal',
          title: statusTitle,
          body: statusBody,
          date: now.toISOString(),
          type: newStatus === 'REJECTED' ? 'alert' : 'update',
          read: false
        };
        localStorage.setItem('lh_messages', JSON.stringify([newMessage, ...messages]));

        return { 
          ...c, 
          status: newStatus, 
          last_observation: observation,
          rejection_reason: reason
        };
      }
      return c;
    });

    localStorage.setItem('lh_claims', JSON.stringify(updatedClaims));
    setObservation('');
    setSelectedClaim(null);
    loadData();
  };

  const handleSelectClaim = (claim: any) => {
    setSelectedClaim(claim);
    if (claim.location) {
      setMapCenter(claim.location);
      setMapZoom(17);
    }
  };

  return (
    <main className="min-h-screen relative p-4 md:p-8 flex flex-col items-center">
      <div className="app-bg"></div>

      {/* Notification Toast */}
      <AnimatePresence>
        {newClaimAlert.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] bg-[#E74C3C] text-white px-8 py-4 rounded-2xl shadow-2xl shadow-red-500/30 border border-red-400/30 flex items-center gap-3 backdrop-blur-xl cursor-pointer"
            onClick={() => { setNewClaimAlert({show: false, message: ''}); loadData(); }}
          >
            <span className="text-2xl animate-bounce">🔔</span>
            <span className="font-black text-sm tracking-wide">{newClaimAlert.message}</span>
            <span className="ml-2 text-white/60 text-xs">✕</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="w-full max-w-[1600px] space-y-6 z-10">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-black/40 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase">Panel de Control</h1>
            <p className="text-[#2ECC71] text-[10px] font-bold tracking-[0.2em] uppercase">Monitoreo de Gestión Municipal — Las Higueras</p>
          </div>
          <div className="flex flex-wrap gap-4 lg:gap-8 w-full lg:w-auto items-center">
            <div className="flex bg-black/40 p-2 px-4 rounded-xl border border-white/5 lg:mr-4 items-center w-full lg:w-auto justify-center mb-2 lg:mb-0">
               <span className="text-[10px] font-black text-white/50 tracking-widest uppercase">
                 Sesión Administrador: <span className="text-[#2ECC71]">{currentUser?.name || 'Gestor'}</span>
               </span>
            </div>
            <MetricItem label="PENDIENTES" value={metrics.pending} color="#E74C3C" />
            <MetricItem label="EN PROCESO" value={metrics.inProgress} color="#F1C40F" />
            <MetricItem label="RESUELTOS" value={metrics.resolved} color="#2ECC71" />
            <MetricItem label="PRIORIDADES" value={metrics.priorities} color="#9B59B6" />
          </div>
        </header>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 h-auto lg:h-[calc(100vh-200px)]">
          <aside className="lg:col-span-4 flex flex-col gap-4 overflow-hidden">
            <div className="glass-card glass-card-static p-6 border-none flex flex-col gap-5 shrink-0">
               <div className="space-y-4">
                 <p className="text-[10px] font-black text-[#2ECC71] tracking-widest uppercase ml-1">Filtros Avanzados</p>
                 <div className="grid grid-cols-1 gap-3">
                   <div className="grid grid-cols-2 gap-2">
                     <select 
                       value={statusFilter}
                       onChange={(e) => setStatusFilter(e.target.value)}
                       className="bg-black/40 border border-white/10 text-white text-[11px] font-bold rounded-xl px-3 py-3"
                     >
                       <option value="all">TODOS LOS ESTADOS</option>
                       <option value="PENDING">PENDIENTES</option>
                       <option value="IN_PROGRESS">EN PROCESO</option>
                       <option value="RESOLVED">RESUELTOS</option>
                       <option value="REJECTED">RECHAZADOS</option>
                     </select>
                     <select 
                       value={categoryFilter}
                       onChange={(e) => setCategoryFilter(e.target.value)}
                       className="bg-black/40 border border-white/10 text-white text-[11px] font-bold rounded-xl px-3 py-3"
                     >
                        <option value="all">TODAS CATEGORÍAS</option>
                        <option value="Alumbrado Público">ALUMBRADO</option>
                        <option value="Calles y Veredas">CALLES / BACHES</option>
                        <option value="Agua y Cloacas">AGUA / CLOACAS</option>
                        <option value="Residuos">RESIDUOS</option>
                        <option value="Espacios Verdes">ESPACIOS VERDES</option>
                        <option value="Servicios Sanitarios">SERVICIOS SANITARIOS</option>
                        <option value="Otros">OTROS</option>
                     </select>
                   </div>
                   <div className="grid grid-cols-2 gap-2">
                     <select 
                       value={roleFilter}
                       onChange={(e) => setRoleFilter(e.target.value)}
                       className="bg-black/40 border border-white/10 text-white text-[11px] font-bold rounded-xl px-3 py-3"
                     >
                       <option value="all">TODOS LOS ROLES</option>
                       <option value="vecino">VECINOS</option>
                       <option value="comercio">COMERCIOS</option>
                       <option value="institucion">INSTITUCIONES</option>
                     </select>
                     <select 
                       value={timeFilter}
                       onChange={(e) => setTimeFilter(e.target.value)}
                       className="bg-black/40 border border-white/10 text-white text-[11px] font-bold rounded-xl px-4 py-3"
                     >
                       <option value="all">TODO EL TIEMPO</option>
                       <option value="today">HOY</option>
                       <option value="week">ESTA SEMANA</option>
                       <option value="month">ESTE MES</option>
                       <option value="year">ÚLTIMO AÑO</option>
                     </select>
                   </div>
                 </div>
               </div>

               <div className="pt-2 border-t border-white/5">
                  <p className="text-[10px] font-black text-white/40 tracking-widest uppercase mb-4 ml-1">Distribución Actual</p>
                  <div className="space-y-3">
                     <StatBar label="Resueltos" value={metrics.resolved} total={metrics.total} color="#2ECC71" />
                     <StatBar label="En Proceso" value={metrics.inProgress} total={metrics.total} color="#F1C40F" />
                     <StatBar label="Pendientes" value={metrics.pending} total={metrics.total} color="#E74C3C" />
                     <StatBar label="Rechazados" value={metrics.rejected} total={metrics.total} color="rgba(255,255,255,0.4)" />
                  </div>
               </div>
            </div>

            <div className="flex-1 flex flex-col gap-3 overflow-hidden">
              <div className="flex justify-between items-center px-4 shrink-0">
                <h2 className="text-sm font-black text-white/80 uppercase tracking-wider">Lista de Reclamos</h2>
                <span className="text-[10px] text-white/30 font-bold">{filteredClaims.length} REPORTES</span>
              </div>
              
              <div 
                 id="claims-list"
                 className="flex-1 overflow-y-auto overflow-x-hidden pr-2 space-y-3 custom-scrollbar max-h-[500px] lg:max-h-full"
               >
                {filteredClaims.map((claim) => (
                  <div 
                    key={claim.id}
                    onClick={() => handleSelectClaim(claim)}
                    className={`group relative flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${selectedClaim?.id === claim.id ? 'bg-[#2ECC71]/10 border-[#2ECC71]/30 shadow-lg' : 'bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/10'}`}
                  >
                    
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black text-[#2ECC71] tracking-widest">{claim.id}</span>
                        {claim.priority && (
                          <span className="bg-[#9B59B6] text-white text-[8px] font-black px-2 py-0.5 rounded-md border border-white/20 shadow-md">
                            PRIORIDAD
                          </span>
                        )}
                        <span className="text-[11px] font-black text-white shrink-0">
                           {(() => {
                             const d = new Date(claim.date);
                             if (isNaN(d.getTime())) return claim.date;
                             return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear().toString().slice(-2)} - ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
                           })()}
                        </span>
                      </div>
                      {/* Swapped: Name as Title */}
                      <p className="text-sm font-black text-white uppercase tracking-tight leading-none mb-1">
                        {claim.user_name}
                      </p>
                      {/* Swapped: Category as Subtitle */}
                      <p className="text-[10px] text-white/50 truncate flex items-center gap-1.5">
                         <span className="text-[#2ECC71] font-black uppercase px-2 py-0.5 bg-[#2ECC71]/10 rounded-md">{claim.category}</span>
                         <span className="text-white/10">|</span> 📍 {claim.address}
                      </p>
                      <div className="flex justify-between items-center pt-2">
                        <p className="text-[9px] text-white/20 truncate uppercase font-black tracking-widest italic flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span> {claim.user_role}
                        </p>
                        <div className={`w-2 h-2 rounded-full shadow-lg ${claim.status === 'RESOLVED' ? 'bg-[#2ECC71]' : claim.status === 'IN_PROGRESS' ? 'bg-[#F1C40F]' : claim.status === 'REJECTED' ? 'bg-white/40' : 'bg-[#E74C3C]'}`} />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="sticky bottom-0 pt-4 pb-6 flex justify-center bg-gradient-to-t from-black/90 via-black/60 to-transparent -mx-2 px-2">
                   <button 
                     onClick={() => {
                        const list = document.getElementById('claims-list');
                        list?.scrollTo({ top: 0, behavior: 'smooth' });
                     }}
                     className="bg-[#2ECC71]/20 hover:bg-[#2ECC71]/30 text-[#2ECC71] text-[11px] font-black uppercase tracking-[0.15em] px-8 py-4 rounded-2xl border border-[#2ECC71]/30 transition-all shadow-lg shadow-green-500/10 flex items-center gap-2"
                   >
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 15l-6-6-6 6"/></svg>
                     VOLVER AL INICIO
                   </button>
                </div>
              </div>
            </div>
          </aside>

          <section className="lg:col-span-8 relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black min-h-[350px] lg:min-h-0 order-first lg:order-none my-2 lg:my-0">
            <ErrorBoundary fallback={
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-black/40 rounded-3xl border border-white/10">
                <span className="text-5xl">🗺️</span>
                <p className="text-white/30 text-xs font-black uppercase tracking-widest">Mapa no disponible</p>
                <p className="text-white/20 text-[10px] text-center max-w-xs px-8">Configurá la clave de Google Maps en Vercel para activar el mapa</p>
              </div>
            }>
              <div className="absolute inset-0">
                <InteractiveMap
                  center={mapCenter}
                  zoom={mapZoom}
                  markers={filteredClaims.filter(c => c.location).map(c => ({
                    id: c.id,
                    position: c.location,
                    status: c.status,
                    onClick: () => handleSelectClaim(c)
                  }))}
                />
              </div>
            </ErrorBoundary>

            <AnimatePresence>
              {selectedClaim && (
                  <motion.div 
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "100%", opacity: 0 }}
                    className="absolute inset-2 md:inset-6 lg:top-10 lg:right-10 lg:bottom-10 lg:left-auto lg:w-[600px] bg-[#0F172A] backdrop-blur-3xl rounded-3xl border border-white/20 shadow-[0_0_120px_rgba(0,0,0,1)] overflow-hidden flex flex-col z-[100] transition-all duration-300"
                  >
                  <div 
                    className="px-6 py-6 border-b border-white/10 flex justify-between items-center bg-white/5 transition-all w-full"
                  >
                    <div className="space-y-2 max-w-[80%]">
                      <div className="flex items-center gap-3">
                         <span className={`text-[10px] font-black px-4 py-1.5 rounded-lg backdrop-blur-md border border-white/10 ${selectedClaim.status === 'RESOLVED' ? 'bg-[#2ECC71]/30 text-[#2ECC71]' : selectedClaim.status === 'IN_PROGRESS' ? 'bg-[#F1C40F]/30 text-[#F1C40F]' : selectedClaim.status === 'REJECTED' ? 'bg-white/10 text-white/50' : 'bg-[#E74C3C]/30 text-[#E74C3C]'}`}>
                           {selectedClaim.status === 'RESOLVED' ? 'RESUELTO' : selectedClaim.status === 'IN_PROGRESS' ? 'EN PROCESO' : selectedClaim.status === 'REJECTED' ? 'RECHAZADO' : 'PENDIENTE'}
                         </span>
                         <span className="text-[10px] font-black text-white/20 tracking-[0.3em]">EXP. #{selectedClaim.id}</span>
                      </div>
                      <h2 className="text-3xl font-black text-white tracking-widest uppercase leading-tight">{selectedClaim.user_name}</h2>
                      <div className="flex items-center gap-2 text-white/30 text-[9px] font-black uppercase tracking-[0.2em]">
                         <div className="w-4 h-[1px] bg-[#2ECC71]/60"></div> 
                         <span>Ciudadano Informante</span>
                      </div>
                    </div>
                    <button onClick={() => { setSelectedClaim(null); setShowRejection(false); }} className="text-white/40 hover:text-white transition-all bg-white/5 hover:bg-white/10 p-4 rounded-2xl shadow-xl group border border-white/5">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="group-hover:rotate-90 transition-transform duration-300"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                  </div>

                  <div 
                    className="flex-1 overflow-y-auto px-6 py-8 md:px-8 space-y-6 custom-scrollbar scroll-smooth"
                  >
                    {/* Standalone High-Visibility Priority Toggle */}
                    <button 
                      onClick={(e) => handleTogglePriority(selectedClaim.id, e)}
                      className={`w-full py-5 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] border transition-all duration-500 shadow-xl flex items-center justify-center gap-3 ${selectedClaim.priority ? 'bg-gradient-to-tr from-[#9B59B6] to-purple-400 text-white border-purple-400/50 shadow-purple-500/20' : 'bg-black/40 text-white border-white/5 hover:bg-white/5'}`}
                    >
                      {selectedClaim.priority ? (
                        <>
                          <span className="text-xl">★</span> PRIORIDAD ALTA ASIGNADA
                        </>
                      ) : (
                        <>
                          <span className="text-xl">⚡</span> ESTABLECER COMO PRIORIDAD
                        </>
                      )}
                    </button>

                    <div className="bg-black/40 p-6 lg:p-8 rounded-[2rem] border border-white/5 group transition-all">
                      <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                         📌 Categoría
                      </p>
                      <p className="text-xl font-black text-white tracking-tight uppercase">{selectedClaim.category}</p>
                      <div className="mt-4">
                        <span className="text-[9px] font-black px-3 py-1.5 bg-white/5 rounded-lg text-white/40 uppercase tracking-[0.2em] border border-white/10">{selectedClaim.user_role}</span>
                      </div>
                    </div>

                    <div className="space-y-8">
                       <div className="bg-black/40 p-5 lg:p-10 rounded-[2rem] border border-white/5 group shadow-xl">
                         <p className="text-[10px] text-white/20 font-black tracking-[0.3em] uppercase mb-6 flex items-center gap-2">
                           <span className="text-[#1E5F9E]">📍</span> Ubicación Geográfica
                         </p>
                         <p className="text-xl font-black text-white tracking-tight">{selectedClaim.address}</p>
                       </div>
                       <div className="bg-black/40 p-5 lg:p-10 rounded-[2rem] border border-white/5 shadow-xl">
                         <p className="text-[10px] text-white/20 font-black tracking-[0.3em] uppercase mb-6 flex items-center gap-2">
                           <span className="text-white/20">📝</span> Declaración del Vecino
                         </p>
                         <p className="text-base text-white/80 leading-relaxed font-medium">
                           {selectedClaim.description}
                         </p>
                       </div>
                    </div>

                    <div className="space-y-4 px-2">
                      <p className="text-[10px] text-white/30 font-black tracking-widest uppercase ml-4">Evidencia Capturada</p>
                      <div 
                        className={`relative rounded-2xl bg-black/40 overflow-hidden border border-white/10 cursor-zoom-in transition-all duration-700 ${isZoomed ? 'aspect-square scale-105 z-50 ring-4 ring-[#2ECC71] shadow-[0_0_80px_rgba(46,204,113,0.3)]' : 'aspect-video shadow-2xl'}`}
                        onClick={() => setIsZoomed(!isZoomed)}
                      >
                        {selectedClaim.photo ? (
                          <img src={selectedClaim.photo} className="w-full h-full object-cover" alt="Evidencia" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/10 italic text-sm">Sin evidencia fotográfica</div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                        <div className="absolute bottom-6 left-6 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-white/70 text-[10px] font-black uppercase tracking-widest border border-white/10">
                          {isZoomed ? 'Contraer' : 'Expandir Vista'}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 px-2">
                      <p className="text-[10px] text-[#2ECC71] font-black tracking-widest uppercase ml-1">Observaciones de Gestión</p>
                      <textarea 
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white text-sm font-bold focus:outline-none focus:border-[#2ECC71] transition-all min-h-[120px] resize-none"
                        placeholder="Escriba aquí los detalles de la resolución o derivación..."
                        value={observation}
                        onChange={(e) => setObservation(e.target.value)}
                      />
                      
                      {showRejection ? (
                        <div className="space-y-4 bg-red-500/10 p-6 rounded-2xl border border-red-500/20 animate-in fade-in slide-in-from-top-1">
                          <p className="text-[10px] text-red-500 font-black uppercase tracking-widest flex items-center gap-2">
                             🚫 Motivo del Rechazo (Obligatorio)
                          </p>
                          <textarea 
                            className="w-full bg-black/40 border border-red-500/10 rounded-xl p-4 text-white text-xs font-bold focus:outline-none focus:border-red-500 transition-all min-h-[80px]"
                            placeholder="Ej: Reclamo duplicado / No corresponde a jurisdicción..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                          />
                          <div className="flex gap-3 mt-4">
                             <button onClick={() => setShowRejection(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white/60 text-[10px] font-bold py-3 rounded-xl transition-all">CANCELAR</button>
                             <button 
                               onClick={() => handleStatusChange(selectedClaim.id, 'REJECTED', rejectionReason)}
                               disabled={!rejectionReason}
                               className="flex-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold py-3 rounded-xl shadow-lg shadow-red-500/20 transition-all disabled:opacity-50"
                             >
                                CONFIRMAR RECHAZO
                             </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {selectedClaim.status === 'PENDING' && (
                            <button 
                              onClick={() => handleStatusChange(selectedClaim.id, 'IN_PROGRESS')}
                              disabled={!observation.trim()}
                              className="w-full bg-[#F1C40F] hover:bg-[#D4AC0D] text-black font-black py-4 rounded-xl text-xs uppercase tracking-widest transition-all shadow-xl shadow-yellow-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <span>⚡</span> Iniciar Gestión (En Proceso)
                            </button>
                          )}
                          {selectedClaim.status === 'IN_PROGRESS' && (
                            <button 
                              onClick={() => handleStatusChange(selectedClaim.id, 'RESOLVED')}
                              disabled={!observation.trim()}
                              className="w-full bg-[#2ECC71] hover:bg-[#27AE60] text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest transition-all shadow-xl shadow-green-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <span>✅</span> Finalizar y Marcar Resuelto
                            </button>
                          )}
                          <button 
                            onClick={() => setShowRejection(true)}
                            className="w-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-red-400 font-bold py-3 rounded-xl text-[10px] uppercase tracking-widest transition-all"
                          >
                            Rechazar Reclamo (No Corresponde)
                          </button>
                          {!observation.trim() && (
                            <p className="text-[9px] text-white/20 text-center uppercase tracking-widest italic animate-pulse">
                               * Complete las observaciones para habilitar acciones
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 text-white/60 text-[10px] font-bold flex gap-4">
               <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#E74C3C]"></span> PENDIENTE</span>
               <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#F1C40F]"></span> EN PROCESO</span>
               <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#2ECC71]"></span> RESUELTO</span>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function StatBar({ label, value, total, color }: { label: string, value: number, total: number, color: string }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
        <span className="text-white/50">{label}</span>
        <span style={{ color }}>{value}</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function MetricItem({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[8px] font-black text-white/30 tracking-[0.2em] mb-1">{label}</span>
      <span className="text-2xl font-black" style={{ color }}>{value}</span>
    </div>
  );
}
