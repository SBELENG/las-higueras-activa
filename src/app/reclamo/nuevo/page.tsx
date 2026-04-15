'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import StepIndicator from '@/components/StepIndicator';

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
  const [loading, setLoading] = useState(false);
  const [limitError, setLimitError] = useState(false);

  // File input refs
  const cameraInputRef = React.useRef<HTMLInputElement>(null);
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
    if (step < 2) setStep(step + 1);
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
    const monthlyClaims = claims.filter((c: any) => c.id.toString().startsWith(currentMonthPrefix));
    const nextSequence = (monthlyClaims.length + 1).toString().padStart(4, '0');
    const newId = `${datePrefix}${nextSequence}`;

    const newClaim = {
      id: newId,
      category: category.label,
      description,
      photo,
      address: user.address || 'Ubicación registrada',
      location: user.location || { lat: -33.085, lng: -64.35 },
      user_name: user.name || 'Vecino Invitado',
      user_role: user.role || 'vecino',
      status: 'PENDING',
      date: now.toISOString(), // ISO format for robust filtering
    };

    localStorage.setItem('lh_claims', JSON.stringify([...claims, newClaim]));

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
        setPhoto(reader.result as string);
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
          <StepIndicator currentStep={step - 1} totalSteps={2} labels={['Categoría', 'Detalle']} />
          {/* Arrow indicator as requested */}
          <div className="flex justify-between items-center text-white/40 text-[10px] font-bold uppercase tracking-widest px-1">
             <span>{step === 1 ? 'Categoría' : 'Detalle'}</span>
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

                  {/* Hidden inputs */}
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment"
                    className="hidden" 
                    ref={cameraInputRef}
                    onChange={handlePhotoUpload}
                  />
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={galleryInputRef}
                    onChange={handlePhotoUpload}
                  />

                  {/* Photo preview */}
                  {photo ? (
                    <div className="w-full aspect-video rounded-2xl overflow-hidden border-2 border-[#2ECC71]/50 relative">
                      <img src={photo} alt="Vista previa" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPhoto(null)}
                        className="absolute top-3 right-3 bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20 backdrop-blur-md"
                      >
                        ✕ Cambiar
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="flex flex-col items-center justify-center gap-3 p-6 bg-white/5 border-2 border-dashed border-white/20 rounded-2xl hover:bg-white/10 hover:border-[#2ECC71]/50 transition-all cursor-pointer"
                      >
                        <span className="text-4xl">📷</span>
                        <span className="text-white/80 text-sm font-bold">Tomar Foto</span>
                        <span className="text-white/30 text-[10px] uppercase tracking-wider">Cámara</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        className="flex flex-col items-center justify-center gap-3 p-6 bg-white/5 border-2 border-dashed border-white/20 rounded-2xl hover:bg-white/10 hover:border-[#2ECC71]/50 transition-all cursor-pointer"
                      >
                        <span className="text-4xl">🖼️</span>
                        <span className="text-white/80 text-sm font-bold">Subir Foto</span>
                        <span className="text-white/30 text-[10px] uppercase tracking-wider">Galería</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-10">
                  <button
                    onClick={handleSubmit}
                    disabled={!description || (category?.critical && !photo) || loading}
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
