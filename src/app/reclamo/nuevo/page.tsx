'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import StepIndicator from '@/components/StepIndicator';
import dynamicImport from 'next/dynamic';

const InteractiveMap = dynamicImport(() => import('../../../components/InteractiveMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-black/20 animate-pulse rounded-2xl border border-white/5" />
});

const MAP_OPTIONS = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
  ]
};

const CATEGORIES = [
  { id: 'alumbrado', label: 'Alumbrado Público', icon: '💡' },
  { id: 'calles', label: 'Calles y Veredas', icon: '🛣️' },
  { id: 'agua', label: 'Agua y Cloacas', icon: '💧' },
  { id: 'residuos', label: 'Residuos', icon: '🗑️' },
  { id: 'espacios_verdes', label: 'Espacios Verdes', icon: '🌳' },
  { id: 'sanitarios', label: 'Servicios Sanitarios', icon: '🏥', critical: true },
  { id: 'otros', label: 'Otros', icon: '📋' },
];

export default function NuevoReclamoPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<any>(null);
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [claimAddress, setClaimAddress] = useState('');
  const [claimLocation, setClaimLocation] = useState({ lat: -33.0922, lng: -64.2889 });
  const [loading, setLoading] = useState(false);
  const [limitError, setLimitError] = useState(false);

  // Two separate references: one for direct camera, one for gallery
  const photoInputRef = React.useRef<HTMLInputElement>(null);
  const galleryInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check daily limit (MAX 3)
    const claims = JSON.parse(localStorage.getItem('lh_claims') || '[]');
    const today = new Date().toLocaleDateString();
    const todayClaims = claims.filter((c: any) => c.date === today);
    if (todayClaims.length >= 3) {
      setLimitError(true);
    }
  }, []);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else router.push('/home');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const user = JSON.parse(localStorage.getItem('lh_activa_user') || '{}');
    const claims = JSON.parse(localStorage.getItem('lh_claims') || '[]');
    
    // Generate custom ID: YYMMDD + Serial (reset monthly)
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const datePrefix = `${year}${month}${day}`;
    
    const currentMonthPrefix = `${year}${month}`;
    const monthlyClaims = claims.filter((c: any) => c.id?.toString().startsWith(currentMonthPrefix));
    const nextSequence = (monthlyClaims.length + 1).toString().padStart(4, '0');
    const newId = `${datePrefix}${nextSequence}`;

    const newClaim = {
      id: newId,
      category: category.label,
      description,
      photo,
      address: claimAddress,
      location: claimLocation,
      user_name: user.name || 'Vecino Invitado',
      user_role: user.role || 'vecino',
      status: 'PENDING',
      date: now.toISOString(),
    };

    try {
      localStorage.setItem('lh_claims', JSON.stringify([...claims, newClaim]));
    } catch (e) {
      console.warn("Local storage full, attempting to clear space...");
      if (claims.length > 10) {
        const smallerClaims = claims.slice(-10);
        localStorage.setItem('lh_claims', JSON.stringify([...smallerClaims, newClaim]));
      } else {
        newClaim.photo = null;
        localStorage.setItem('lh_claims', JSON.stringify([...claims, newClaim]));
      }
    }

    setTimeout(() => {
      setLoading(false);
      router.push('/home');
    }, 1500);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800; // Constrain resolution to save local storage base64 text space
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round(height * (MAX_WIDTH / width));
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round(width * (MAX_HEIGHT / height));
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Compress to low quality JPEG to guarantee success under 5MB limit
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
          setPhoto(compressedDataUrl);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  if (limitError) {
    return (
      <main className="min-h-screen relative p-6 flex items-center justify-center text-center">
        <div className="app-bg"></div>
        <div className="glass-card p-10 space-y-4 max-w-sm">
          <div className="text-5xl">🚫</div>
          <h2 className="text-2xl font-bold">Límite alcanzado</h2>
          <p className="text-white/60">Ya realizaste 3 reclamos hoy. Podés volver a reportar mañana.</p>
          <button onClick={() => router.push('/home')} className="btn-primary mt-6">Volver al Inicio</button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative p-6 flex flex-col items-center">
      <div className="app-bg"></div>
      
      <div className="w-full max-w-lg space-y-8 z-10 pt-4">
        {/* Back Button */}
        <button onClick={handleBack} className="text-white/60 hover:text-white flex items-center gap-2 mb-2 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Volver
        </button>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-shadow">Nuevo Reclamo</h1>
          <StepIndicator currentStep={step - 1} totalSteps={3} labels={['Categoría', 'Detalle', 'Ubicación']} />
          {/* Arrow indicator as requested */}
          <div className="flex justify-between items-center text-white/40 text-[10px] font-bold uppercase tracking-widest px-1">
             <span>{step === 1 ? 'Categoría' : step === 2 ? 'Detalle' : 'Ubicación'}</span>
             <div className="flex items-center gap-1">
                <span>Paso {step}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m9 18 6-6-6-6"/></svg>
             </div>
          </div>
        </div>

        <section className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {/* Step 1: Categoría */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <p className="text-white/70 font-medium">¿De qué trata tu reclamo?</p>
                <div className="grid grid-cols-2 gap-4">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { setCategory(cat); handleNext(); }}
                      className={`glass-card p-8 flex flex-col items-center gap-4 transition-all border-none ${
                        category?.id === cat.id ? 'bg-[#2ECC71]/20 ring-2 ring-[#2ECC71]' : 'hover:bg-white/10'
                      }`}
                    >
                      <span className="text-5xl mb-2">{cat.icon}</span>
                      <span className="text-xs font-bold text-center">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Descripción y Foto */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div className="space-y-6">
                  <label className="text-white/70 font-medium flex items-center gap-2">
                    <span className="text-2xl">{category?.icon}</span>
                    Detalle del problema ({category?.label})
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Contanos qué está pasando..."
                    className="w-full bg-white/5 border border-white/20 rounded-2xl px-10 py-6 text-white focus:outline-none focus:border-[#2ECC71] transition-all resize-none placeholder:text-white/20"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-white/70 font-medium flex items-center gap-2">
                    📸 Foto del lugar {category?.critical && <span className="text-[#2ECC71] text-xs font-bold">(Obligatoria)</span>}
                  </label>

                  {/* Camera specific input */}
                  <input 
                    type="file" 
                    accept="image/*"
                    capture="environment"
                    className="hidden" 
                    ref={photoInputRef}
                    onChange={handlePhotoUpload}
                  />

                  {/* Gallery specific input */}
                  <input 
                    type="file" 
                    accept="image/*"
                    className="hidden" 
                    ref={galleryInputRef}
                    onChange={handlePhotoUpload}
                  />

                  {/* Photo preview or dual add-photo buttons */}
                  {photo ? (
                    <div className="w-full aspect-video rounded-2xl overflow-hidden border-2 border-[#2ECC71]/50 relative">
                      <img src={photo} alt="Vista previa" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPhoto(null)}
                        className="absolute top-3 right-3 bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20 backdrop-blur-md"
                      >
                        ✕ Eliminar Foto
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="w-full flex flex-col items-center justify-center gap-3 p-6 bg-white/5 border-2 border-dashed border-white/20 rounded-2xl hover:bg-white/10 hover:border-[#2ECC71]/50 transition-all cursor-pointer"
                      >
                        <span className="text-4xl text-[#2ECC71]">📷</span>
                        <div className="flex flex-col items-center">
                          <span className="text-white/90 text-sm font-bold">Tomar Foto</span>
                          <span className="text-white/30 text-[10px] uppercase tracking-wider mt-1">ABRIR CÁMARA</span>
                        </div>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        className="w-full flex flex-col items-center justify-center gap-3 p-6 bg-white/5 border-2 border-dashed border-white/20 rounded-2xl hover:bg-white/10 hover:border-[#3498DB]/50 transition-all cursor-pointer"
                      >
                        <span className="text-4xl text-[#3498DB]">🖼️</span>
                        <div className="flex flex-col items-center">
                          <span className="text-white/90 text-sm font-bold">Subir Galería</span>
                          <span className="text-white/30 text-[10px] uppercase tracking-wider mt-1">ELEGIR ARCHIVO</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-10">
                  <button
                    onClick={handleNext}
                    disabled={!description || (category?.critical && !photo)}
                    className="w-full bg-[#2ECC71] hover:bg-[#27AE60] disabled:opacity-50 text-white font-bold p-5 rounded-2xl shadow-lg transition-all"
                  >
                    Siguiente: Ubicación
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Ubicación del Reclamo */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <p className="text-white/70 font-medium flex items-center gap-2">
                    <span className="text-2xl">📍</span>
                    ¿Dónde está el problema?
                  </p>
                  <p className="text-white/40 text-xs">Mova el marcador en el mapa para ubicar el reclamo con precisión.</p>
                </div>

                <div className="space-y-4">
                  <label className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Dirección o Referencia del Reclamo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Calle San Martín 123 o 'Frente al club'"
                    className="w-full bg-white/5 border border-white/20 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-[#2ECC71] transition-all placeholder:text-white/20"
                    value={claimAddress}
                    onChange={(e) => setClaimAddress(e.target.value)}
                  />
                </div>

                <div className="w-full h-[320px] rounded-3xl overflow-hidden border border-white/10 bg-black/20 relative shadow-inner">
                  <InteractiveMap 
                    center={claimLocation}
                    zoom={15}
                    onMarkerDragEnd={(e: any) => {
                      if (e.latLng) {
                        setClaimLocation({ lat: e.latLng.lat(), lng: e.latLng.lng() });
                      }
                    }}
                    draggableMarker
                    markerIcon={{
                      path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
                      fillColor: '#E74C3C',
                      fillOpacity: 1,
                      strokeWeight: 2,
                      strokeColor: '#FFFFFF',
                      scale: 1.8,
                      anchor: { x: 12, y: 24 }
                    }}
                  />
                  <div className="absolute top-4 left-4 right-4 bg-black/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-xs font-bold text-white text-center shadow-xl pointer-events-none">
                    📍 Arrastrá el marcador para ubicar el reclamo
                  </div>
                </div>

                <div className="flex justify-center -mt-4 z-20 relative px-4">
                  <button 
                    type="button"
                    onClick={() => {
                      if ("geolocation" in navigator) {
                        navigator.geolocation.getCurrentPosition((pos) => {
                          setClaimLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                        });
                      }
                    }}
                    className="bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl border border-white/20 flex items-center justify-center gap-2 w-full max-w-[280px] hover:bg-white/20 transition-all"
                  >
                    <span className="text-base leading-none">📍</span>
                    <span className="flex-1">Usar mi ubicación actual</span>
                  </button>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={!claimAddress || loading}
                    className="w-full bg-[#2ECC71] hover:bg-[#27AE60] disabled:opacity-50 text-white font-bold p-5 rounded-2xl shadow-lg transition-all"
                  >
                    {loading ? 'Enviando Reclamo...' : 'Confirmar y Enviar'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}
