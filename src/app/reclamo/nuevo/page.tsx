'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import StepIndicator from '@/components/StepIndicator';
import dynamicImport from 'next/dynamic';
import { createClaim } from '@/lib/db';

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
  const [usingGeoLocation, setUsingGeoLocation] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [markerMoved, setMarkerMoved] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem('lh_activa_user') || '{}');
      
      const newClaim = {
        user_phone: user.phone || 'Desconocido',
        user_name: user.name || 'Vecino Invitado',
        user_role: user.role || 'vecino',
        category: category.label,
        description,
        address: claimAddress,
        location: claimLocation,
        photoBase64: photo
      };

      await createClaim(newClaim as any);
      
      router.push('/home');
    } catch (e) {
      console.error("Error al enviar reclamo:", e);
      alert("Error al enviar el reclamo. Por favor, intente de nuevo.");
    } finally {
      setLoading(false);
    }
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
                className="glass-card w-full flex flex-col justify-between min-h-[65vh] p-6 md:p-10 gap-8"
              >
                <div className="space-y-4 flex-1 flex flex-col">
                  <label className="text-white/90 text-[11px] md:text-xs font-black uppercase tracking-[0.2em] ml-2 drop-shadow-md flex items-center gap-2">
                    <span className="text-2xl drop-shadow-md">{category?.icon}</span>
                    Detalle del problema ({category?.label})
                  </label>
                  <textarea
                    required
                    placeholder="Contanos qué está pasando..."
                    className="flex-1 w-full bg-white/10 border-2 border-white/20 focus:border-[#2ECC71] rounded-3xl p-6 text-white text-lg focus:outline-none transition-all resize-none placeholder:text-white/30 backdrop-blur-md shadow-inner min-h-[120px]"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-white/90 text-[11px] md:text-xs font-black uppercase tracking-[0.2em] ml-2 drop-shadow-md flex items-center gap-2">
                    📸 Foto del lugar {category?.critical && <span className="text-[#2ECC71] font-bold text-[10px]">(Obligatoria)</span>}
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
                    <div className="w-full aspect-video rounded-3xl overflow-hidden border-2 border-[#2ECC71]/50 relative shadow-lg">
                      <img src={photo} alt="Vista previa" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPhoto(null)}
                        className="absolute top-4 right-4 bg-black/70 text-white text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-white/20 backdrop-blur-md hover:bg-black/90 transition-all active:scale-95"
                      >
                        ✕ Eliminar Foto
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="w-full flex flex-col items-center justify-center gap-3 p-6 bg-white/10 border-2 border-white/20 rounded-3xl hover:bg-white/20 hover:border-[#2ECC71]/50 transition-all cursor-pointer shadow-inner active:scale-95"
                      >
                        <span className="text-4xl drop-shadow-md">📷</span>
                        <span className="text-white/90 text-[11px] md:text-xs font-black uppercase tracking-[0.15em]">Tomar Foto</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        className="w-full flex flex-col items-center justify-center gap-3 p-6 bg-white/10 border-2 border-white/20 rounded-3xl hover:bg-white/20 hover:border-[#3498DB]/50 transition-all cursor-pointer shadow-inner active:scale-95"
                      >
                        <span className="text-4xl drop-shadow-md">🖼️</span>
                        <span className="text-white/90 text-[11px] md:text-xs font-black uppercase tracking-[0.15em]">Galería</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-6 mt-auto">
                  <button
                    onClick={handleNext}
                    disabled={!description || (category?.critical && !photo)}
                    className="w-full bg-gradient-to-b from-[#2ECC71] to-[#27AE60] hover:from-[#27AE60] hover:to-[#219a52] disabled:opacity-50 text-white font-bold py-5 rounded-[1.5rem] border-2 border-white/20 transition-all active:scale-95 text-lg md:text-xl shadow-[0_0_20px_rgba(46,204,113,0.3)] hover:shadow-[0_0_30px_rgba(46,204,113,0.5)] tracking-wide"
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
                <div className="space-y-4">
                  <p className="text-white/70 font-medium flex items-center gap-2">
                    <span className="text-2xl">📍</span>
                    ¿Dónde está el problema?
                  </p>
                  <p className="text-white/70 text-sm leading-relaxed">Mueva el marcador en el mapa para ubicar el reclamo con precisión.</p>
                </div>

                <div className="space-y-3">
                  <label className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Dirección o Referencia del Reclamo</label>
                  <input
                    type="text"
                    placeholder="Ej: Calle San Martín 123 o 'Frente al club'"
                    className="w-full bg-white/5 border border-white/20 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-[#2ECC71] transition-all placeholder:text-white/20"
                    value={claimAddress}
                    onChange={(e) => { setClaimAddress(e.target.value); if (usingGeoLocation && e.target.value) setUsingGeoLocation(false); }}
                    onBlur={() => {
                      if (claimAddress && !usingGeoLocation && typeof google !== 'undefined' && google.maps) {
                        setIsGeocoding(true);
                        const geocoder = new google.maps.Geocoder();
                        const searchAddress = claimAddress.toLowerCase().includes('las higueras') ? claimAddress : `${claimAddress}, Las Higueras, Córdoba`;
                        geocoder.geocode({ address: searchAddress }, (results: any, status: any) => {
                          setIsGeocoding(false);
                          if (status === 'OK' && results?.[0]) {
                            const lat = results[0].geometry.location.lat();
                            const lng = results[0].geometry.location.lng();
                            setClaimLocation({ lat, lng });
                            setMarkerMoved(true);
                          }
                        });
                      }
                    }}
                  />
                  {!claimAddress && (
                    <p className="text-white/60 text-xs italic ml-1 mt-1">Si no conocés la dirección, usá el botón de ubicación actual más abajo.</p>
                  )}
                </div>

                <div className="w-full h-[320px] rounded-3xl overflow-hidden border border-white/10 bg-black/20 relative shadow-inner">
                  <InteractiveMap 
                    center={claimLocation}
                    zoom={15}
                    onMarkerDragEnd={(e: any) => {
                      if (e.latLng) {
                        const lat = e.latLng.lat();
                        const lng = e.latLng.lng();
                        setClaimLocation({ lat, lng });
                        setMarkerMoved(true);
                        // Auto-fill address with GPS coords if address is empty
                        if (!claimAddress) {
                          if (typeof google !== 'undefined' && google.maps) {
                            const geocoder = new google.maps.Geocoder();
                            geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
                              if (status === 'OK' && results?.[0]) {
                                setClaimAddress(results[0].formatted_address);
                              } else {
                                setClaimAddress(`GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
                              }
                            });
                          } else {
                            setClaimAddress(`GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
                          }
                        }
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

                {/* Botón Usar mi ubicación */}
                <div className="flex justify-center z-20 relative mt-4">
                  <button 
                    type="button"
                    disabled={geoLoading}
                    onClick={() => {
                      if ("geolocation" in navigator) {
                        setGeoLoading(true);
                        navigator.geolocation.getCurrentPosition(
                          (pos) => {
                            const lat = pos.coords.latitude;
                            const lng = pos.coords.longitude;
                            setClaimLocation({ lat, lng });
                            setUsingGeoLocation(true);
                            setGeoLoading(false);
                            // Try to reverse-geocode the coordinates to auto-fill address
                            if (typeof google !== 'undefined' && google.maps) {
                              const geocoder = new google.maps.Geocoder();
                              geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
                                if (status === 'OK' && results?.[0]) {
                                  setClaimAddress(results[0].formatted_address);
                                } else {
                                  // If geocoding fails, set coords as address
                                  setClaimAddress(`GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
                                }
                              });
                            } else {
                              setClaimAddress(`GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
                            }
                          },
                          (error) => {
                            setGeoLoading(false);
                            alert('No se pudo obtener la ubicación. Asegurate de tener el GPS activado y los permisos otorgados.');
                          },
                          { enableHighAccuracy: true, timeout: 10000 }
                        );
                      } else {
                        alert('Tu navegador no soporta geolocalización.');
                      }
                    }}
                    className={`backdrop-blur-xl text-white px-8 py-4 rounded-2xl text-sm font-bold shadow-[0_8px_30px_-8px_rgba(52,152,219,0.4)] border flex items-center justify-center gap-3 w-full transition-all transform active:scale-95 ${
                      usingGeoLocation 
                        ? 'bg-[#2ECC71]/20 border-[#2ECC71]/50 shadow-[0_8px_30px_-8px_rgba(46,204,113,0.4)]' 
                        : 'bg-white/10 border-[#3498DB]/30 hover:bg-[#3498DB]/20 hover:border-[#3498DB]/60'
                    }`}
                  >
                    {geoLoading ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Obteniendo ubicación...</span>
                      </>
                    ) : usingGeoLocation ? (
                      <>
                        <span className="text-xl leading-none">✅</span>
                        <span>Ubicación obtenida</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xl leading-none">📍</span>
                        <span>Usar mi ubicación actual</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Separador visual */}
                <div className="flex items-center gap-4 py-6">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"></div>
                </div>

                {/* Botón Confirmar y Enviar */}
                <div className="pb-8">
                  <button
                    onClick={handleSubmit}
                    disabled={(!claimAddress && !usingGeoLocation && !markerMoved) || loading || isGeocoding}
                    className="w-full bg-gradient-to-r from-[#2ECC71] to-[#27AE60] hover:from-[#27AE60] hover:to-[#219a52] disabled:opacity-50 text-white font-black py-5 px-8 rounded-2xl shadow-[0_8px_30px_-8px_rgba(46,204,113,0.5)] transition-all transform active:scale-95 text-base tracking-wide"
                  >
                    {loading ? 'Enviando Reclamo...' : isGeocoding ? 'Buscando Dirección...' : '✅ Confirmar y Enviar'}
                  </button>
                  {!claimAddress && !usingGeoLocation && !markerMoved && (
                    <p className="text-white/50 text-xs text-center mt-3 italic">Ingresá una dirección, usá tu ubicación o mové el marcador en el mapa</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}
