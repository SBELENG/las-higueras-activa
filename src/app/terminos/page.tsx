'use client';

import React from 'react';

export default function TerminosPage() {
  const handleVolver = () => {
    // If opened as new tab, close it; otherwise go back
    if (window.history.length <= 1) {
      window.close();
    } else {
      window.history.back();
    }
  };

  return (
    <main className="min-h-screen relative p-6 flex flex-col items-center">
      <div className="app-bg"></div>

      <div className="w-full max-w-2xl z-10 pt-4 space-y-8">
        <button
          onClick={handleVolver}
          className="text-white/60 hover:text-white flex items-center gap-2 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Cerrar
        </button>

        <div className="glass-card p-8 md:p-12 space-y-8 border-white/10">
          <div className="text-center space-y-3 pb-6 border-b border-white/10">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-2xl bg-[#2ECC71]/15 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2ECC71" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Términos y Condiciones de Uso
            </h1>
            <p className="text-white/40 text-xs uppercase tracking-widest font-bold">
              Aplicación: Las Higueras Activa · Versión 1.0 (MVP)
            </p>
          </div>

          <div className="prose-legal space-y-8 text-white/70 text-sm leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-white font-bold text-base flex items-center gap-2">
                <span className="text-[#2ECC71] text-xs font-black bg-[#2ECC71]/10 px-2 py-0.5 rounded-md">1</span>
                Aceptación de los términos
              </h2>
              <p>
                El uso de la aplicación &quot;Las Higueras Activa&quot; implica la aceptación plena de los presentes Términos y Condiciones por parte del usuario. En caso de no estar de acuerdo, deberá abstenerse de utilizar la plataforma.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-white font-bold text-base flex items-center gap-2">
                <span className="text-[#2ECC71] text-xs font-black bg-[#2ECC71]/10 px-2 py-0.5 rounded-md">2</span>
                Titularidad del servicio
              </h2>
              <p>
                La aplicación es gestionada por la <strong className="text-white/90">Municipalidad de Las Higueras, Córdoba, Argentina</strong>, con desarrollo tecnológico a cargo de Ideas Digitales.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-white font-bold text-base flex items-center gap-2">
                <span className="text-[#2ECC71] text-xs font-black bg-[#2ECC71]/10 px-2 py-0.5 rounded-md">3</span>
                Objeto de la aplicación
              </h2>
              <p>
                La plataforma tiene como finalidad facilitar la comunicación entre los ciudadanos y el municipio para la gestión de reclamos vinculados a servicios públicos e infraestructura urbana.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-white font-bold text-base flex items-center gap-2">
                <span className="text-[#2ECC71] text-xs font-black bg-[#2ECC71]/10 px-2 py-0.5 rounded-md">4</span>
                Condiciones de uso
              </h2>
              <p>El usuario se compromete a:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-[#2ECC71] mt-1 shrink-0">•</span>
                  Proporcionar información veraz y actualizada.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#2ECC71] mt-1 shrink-0">•</span>
                  Utilizar la aplicación únicamente para fines legítimos.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#2ECC71] mt-1 shrink-0">•</span>
                  No realizar reclamos falsos, maliciosos o reiterativos sin fundamento.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#2ECC71] mt-1 shrink-0">•</span>
                  No publicar contenido ofensivo, discriminatorio o ilegal.
                </li>
              </ul>
              <p className="text-white/50 text-xs italic">
                El incumplimiento podrá derivar en la suspensión del acceso.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-white font-bold text-base flex items-center gap-2">
                <span className="text-[#2ECC71] text-xs font-black bg-[#2ECC71]/10 px-2 py-0.5 rounded-md">5</span>
                Registro y acceso
              </h2>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-[#2ECC71] mt-1 shrink-0">•</span>
                  El acceso se realiza mediante número de teléfono validado por SMS.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#2ECC71] mt-1 shrink-0">•</span>
                  El usuario es responsable del uso de su línea telefónica y del acceso a la aplicación.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-white font-bold text-base flex items-center gap-2">
                <span className="text-[#2ECC71] text-xs font-black bg-[#2ECC71]/10 px-2 py-0.5 rounded-md">6</span>
                Funcionamiento del servicio
              </h2>
              <p>El municipio:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-[#2ECC71] mt-1 shrink-0">•</span>
                  No garantiza tiempos específicos de resolución.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#2ECC71] mt-1 shrink-0">•</span>
                  Se compromete a gestionar los reclamos según prioridades operativas.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#2ECC71] mt-1 shrink-0">•</span>
                  Puede modificar funcionalidades o suspender el servicio por mantenimiento.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-white font-bold text-base flex items-center gap-2">
                <span className="text-[#2ECC71] text-xs font-black bg-[#2ECC71]/10 px-2 py-0.5 rounded-md">7</span>
                Limitación de responsabilidad
              </h2>
              <p>La Municipalidad no será responsable por:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-[#2ECC71] mt-1 shrink-0">•</span>
                  Errores en la geolocalización proporcionada por el dispositivo.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#2ECC71] mt-1 shrink-0">•</span>
                  Fallas técnicas externas (internet, servidores, servicios de terceros).
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#2ECC71] mt-1 shrink-0">•</span>
                  Uso indebido por parte de los usuarios.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-white font-bold text-base flex items-center gap-2">
                <span className="text-[#2ECC71] text-xs font-black bg-[#2ECC71]/10 px-2 py-0.5 rounded-md">8</span>
                Propiedad intelectual
              </h2>
              <p>
                Todos los contenidos, diseños y funcionalidades pertenecen a la Municipalidad o a sus desarrolladores y están protegidos por la legislación vigente.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-white font-bold text-base flex items-center gap-2">
                <span className="text-[#2ECC71] text-xs font-black bg-[#2ECC71]/10 px-2 py-0.5 rounded-md">9</span>
                Modificaciones
              </h2>
              <p>
                Los términos podrán ser modificados en cualquier momento. Se notificará a los usuarios mediante la aplicación.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-white font-bold text-base flex items-center gap-2">
                <span className="text-[#2ECC71] text-xs font-black bg-[#2ECC71]/10 px-2 py-0.5 rounded-md">10</span>
                Jurisdicción
              </h2>
              <p>
                Se rigen por las leyes de la República Argentina. Cualquier conflicto será resuelto en los tribunales competentes de la Provincia de Córdoba.
              </p>
            </section>

            <section className="space-y-3 bg-white/5 p-6 rounded-2xl border border-white/10">
              <h2 className="text-white font-bold text-base flex items-center gap-2">
                <span className="text-[#F1C40F] text-xs font-black bg-[#F1C40F]/10 px-2 py-0.5 rounded-md">11</span>
                Condiciones técnicas del servicio
              </h2>
              <p>
                La aplicación se encuentra en una fase inicial (MVP), por lo que parte de la información generada por el usuario puede almacenarse localmente en su dispositivo.
              </p>
              <p>Esto implica que:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-[#F1C40F] mt-1 shrink-0">⚠</span>
                  Los datos pueden perderse si el usuario borra el historial o cambia de dispositivo.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F1C40F] mt-1 shrink-0">⚠</span>
                  La disponibilidad de la información depende del correcto funcionamiento del navegador.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F1C40F] mt-1 shrink-0">⚠</span>
                  El municipio no garantiza la persistencia de los datos en esta etapa.
                </li>
              </ul>
              <p className="text-white/60 font-semibold text-xs mt-4 pt-4 border-t border-white/10">
                El usuario declara conocer y aceptar esta condición técnica.
              </p>
            </section>
          </div>

          <div className="pt-6 border-t border-white/10 text-center">
            <p className="text-white/20 text-[10px] uppercase tracking-widest font-bold">
              Última actualización: Mayo 2026
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
