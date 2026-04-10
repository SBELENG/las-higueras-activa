'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

import { MAP_OPTIONS } from '@/config/mapStyle';

const USER_ROLES = [
  { id: 'vecino', label: 'Vecino común', icon: '🏠' },
  { id: 'comercio', label: 'Comercio', icon: '🏪' },
  { id: 'institucion', label: 'Institución / Asociación', icon: '🏛️' }
];

const INITIAL_CENTER = { lat: -33.0858, lng: -64.2934 }; // Centro exacto Las Higueras

export default function LoginPage() {
  const router = useRouter();
  const [isClient, setIsClient] = React.useState(false);
  const [step, setStep] = useState(1); // 1: Phone, 2: Profile
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [dni, setDni] = useState('');
  const [barrio, setBarrio] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState(INITIAL_CENTER);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
    language: 'es',
    region: 'AR'
  });

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Sigo con el resto pero protegiendo el render inicial
  if (!isClient) return null;

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 8) return;

    setLoading(true);
    // Simulating SMS sending
    setTimeout(() => {
      setLoading(false);
      setMessage('✅ Código enviado al ' + phone);
      setTimeout(() => {
        setStep(2);
        setMessage('');
      }, 1500);
    }, 1000);
  };

  const handleFinishProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role || !address) return;

    // Simulate saving profile and logging in
    localStorage.setItem('lh_activa_user', JSON.stringify({ 
      name, 
      dni,
      phone, 
      barrio, 
      address,
      location,
      role 
    }));
    router.push('/home');
  };

  const onMapClick = (e: any) => {
    if (e.latLng) {
      setLocation({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    }
  };

  const markerIcon = React.useMemo(() => {
    // Avoid using global google object directly for constructors to prevent crashes
    return {
      path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
      fillColor: '#2ECC71',
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: '#FFFFFF',
      scale: 1.5,
      // React Google Maps accepts plain objects for Point/Size
      anchor: { x: 12, y: 24 } as any,
    };
  }, []);

  return (
    <main className="min-h-screen relative p-6 flex items-center justify-center">
      <div className="app-bg"></div>

      <div className="w-full max-w-lg px-4 flex flex-col items-center">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="phone-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="glass-card space-y-8 w-full"
            >
              <div className="text-center space-y-2">
                <div className="flex justify-center mb-6">
                  <img src="/assets/logo.svg" alt="Las Higueras Activa" className="h-16 w-auto drop-shadow-2xl" />
                </div>
                <h1 className="text-3xl font-bold text-white text-shadow tracking-tight">Identificación</h1>
                <p className="text-white/50 text-sm">Tu puerta de confianza a Las Higueras</p>
              </div>

              <form onSubmit={handleSendCode} className="space-y-12">
                <div className="space-y-4">
                  <label className="text-white/70 text-xs font-bold uppercase tracking-widest ml-1">N° de Teléfono</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ej: 3584123456"
                    className="w-full bg-white/5 border border-white/20 rounded-2xl px-10 py-6 text-white text-lg focus:outline-none focus:border-[#2ECC71] transition-all placeholder:text-white/20"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  />
                </div>

                {message && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="text-[#2ECC71] text-center text-sm font-medium"
                  >
                    {message}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={loading || phone.length < 8}
                  className="w-full bg-[#2ECC71] hover:bg-[#27AE60] disabled:opacity-50 text-white font-bold p-4 rounded-2xl shadow-lg transition-all transform active:scale-95"
                >
                  {loading ? 'Enviando...' : 'Recibir código'}
                </button>
              </form>

              <p className="text-center text-white/30 text-xs">
                Sin contraseñas, directo a tu teléfono.
              </p>
            </motion.div>
          ) : (
            <div
              key="profile-step"
              className="glass-card space-y-10 relative flex flex-col"
            >
              {/* Back to Phone Step */}
              <button 
                onClick={() => setStep(1)}
                className="absolute top-10 left-10 text-white/40 hover:text-white transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
              </button>

              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-white text-shadow">Completar Perfil</h1>
                <p className="text-white/50 text-xs uppercase tracking-widest font-medium">Contanos un poco sobre vos</p>
              </div>

              <form onSubmit={handleFinishProfile} className="space-y-8">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Tu Nombre</label>
                    <input
                      type="text"
                      required
                      placeholder="Escribí tu nombre"
                      className="w-full bg-white/5 border border-white/20 rounded-2xl px-10 py-6 text-white focus:outline-none focus:border-[#2ECC71] transition-all placeholder:text-white/20"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] ml-1">DNI</label>
                    <input
                      type="text"
                      required
                      placeholder="Tu DNI sin puntos"
                      className="w-full bg-white/5 border border-white/20 rounded-2xl px-10 py-6 text-white focus:outline-none focus:border-[#2ECC71] transition-all placeholder:text-white/20"
                      value={dni}
                      onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Dirección Exacta</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Calle San Martín 123"
                      className="w-full bg-white/5 border border-white/20 rounded-2xl px-10 py-6 text-white focus:outline-none focus:border-[#2ECC71] transition-all placeholder:text-white/20"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Barrio / Zona (Opcional)</label>
                    <input
                      type="text"
                      placeholder="Ej: Barrio San Alberto"
                      className="w-full bg-white/5 border border-white/20 rounded-2xl px-10 py-6 text-white focus:outline-none focus:border-[#2ECC71] transition-all placeholder:text-white/20"
                      value={barrio}
                      onChange={(e) => setBarrio(e.target.value)}
                    />
                  </div>

                  <div className="w-full h-[300px] rounded-3xl overflow-hidden border border-white/10 bg-black/20 relative shadow-inner">
                    {isLoaded ? (
                      <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '100%' }}
                        center={location}
                        zoom={16}
                        onClick={onMapClick}
                        options={{...MAP_OPTIONS, zoomControl: true}}
                      >
                        <Marker 
                          position={location} 
                          draggable 
                          onDragEnd={(e: any) => e.latLng && setLocation({ lat: e.latLng.lat(), lng: e.latLng.lng() })} 
                          icon={markerIcon as any}
                        />
                      </GoogleMap>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20 italic text-xs">
                        Cargando mapa...
                      </div>
                    )}
                    <div className="absolute top-4 left-4 right-4 bg-black/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-xs font-bold text-white text-center shadow-xl">
                      📍 Toca el mapa para marcar donde vivís
                    </div>
                  </div>
                  <div className="flex justify-center -mt-6 z-20 relative px-4">
                    <button 
                      type="button"
                      onClick={() => {
                        if ("geolocation" in navigator) {
                          navigator.geolocation.getCurrentPosition((pos) => {
                            setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                          });
                        }
                      }}
                      className="bg-[#2ECC71] text-white px-6 py-4 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl ring-4 ring-black flex items-center justify-center gap-2 w-full max-w-[280px]"
                    >
                      <span className="text-base leading-none">📍</span>
                      <span className="flex-1">Detectar mi ubicación automática</span>
                    </button>
                  </div>

                <div className="space-y-6">
                  <label className="text-white/70 text-xs font-bold uppercase tracking-widest ml-1">¿Cómo te identificás?</label>
                  <div className="grid grid-cols-1 gap-4">
                    {USER_ROLES.map((uRole) => (
                      <label 
                        key={uRole.id}
                        className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                          role === uRole.id 
                            ? 'bg-white/10 border-[#2ECC71] shadow-[0_0_15px_rgba(46,204,113,0.2)]' 
                            : 'bg-white/5 border-white/10 hover:border-white/30'
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          className="hidden"
                          value={uRole.id}
                          checked={role === uRole.id}
                          onChange={(e) => setRole(e.target.value)}
                        />
                        <span className="text-2xl">{uRole.icon}</span>
                        <div className="flex-1">
                          <p className="text-white font-bold text-sm">{uRole.label}</p>
                        </div>
                        {role === uRole.id && (
                          <div className="w-5 h-5 rounded-full bg-[#2ECC71] flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                  </div>
                </div>

                <div className="pt-8">
                  <button
                    type="submit"
                    disabled={!name || !role || !address || !dni}
                    className="w-full bg-[#2ECC71] hover:bg-[#27AE60] disabled:opacity-50 text-white font-bold p-5 rounded-2xl shadow-lg transition-all transform active:scale-95"
                  >
                    Comenzar
                  </button>
                </div>
              </form>
            </div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
