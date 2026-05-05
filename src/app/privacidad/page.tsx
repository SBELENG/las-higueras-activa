'use client';

import React from 'react';

export default function PrivacidadPage() {
  const handleVolver = () => {
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
              <div className="w-14 h-14 rounded-2xl bg-[#3498DB]/15 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3498DB" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Política de Privacidad
            </h1>
            <p className="text-white/40 text-xs uppercase tracking-widest font-bold">
              Aplicación: Las Higueras Activa · Versión 1.0 (MVP) · Mayo 2026
            </p>
          </div>

          <div className="prose-legal space-y-8 text-white/70 text-sm leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-white font-bold text-base flex items-center gap-2">
                <span className="text-[#3498DB] text-xs font-black bg-[#3498DB]/10 px-2 py-0.5 rounded-md">1</span>
                Responsable del tratamiento de los datos
              </h2>
              <p>
                La <strong className="text-white/90">Municipalidad de Las Higueras, Provincia de Córdoba, República Argentina</strong>, es responsable del tratamiento de los datos personales recolectados a través de la aplicación Las Higueras Activa.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-white font-bold text-base flex items-center gap-2">
                <span className="text-[#3498DB] text-xs font-black bg-[#3498DB]/10 px-2 py-0.5 rounded-md">2</span>
                Finalidad de la aplicación
              </h2>
              <p>
                La aplicación tiene como finalidad facilitar la gestión de reclamos ciudadanos relacionados con servicios públicos e infraestructura urbana, promoviendo la comunicación directa entre la comunidad y el municipio.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-white font-bold text-base flex items-center gap-2">
                <span className="text-[#3498DB] text-xs font-black bg-[#3498DB]/10 px-2 py-0.5 rounded-md">3</span>
                Datos personales que se recopilan
              </h2>
              <div className="bg-white/5 p-5 rounded-xl border border-white/10 space-y-4">
                <div>
                  <p className="text-white/90 font-semibold text-xs uppercase tracking-wider mb-2">📌 Datos proporcionados por el usuario:</p>
                  <ul className="space-y-1.5 ml-4">
                    <li className="flex items-start gap-2"><span className="text-[#3498DB] mt-1 shrink-0">•</span>Nombre</li>
                    <li className="flex items-start gap-2"><span className="text-[#3498DB] mt-1 shrink-0">•</span>Número de teléfono celular (verificado mediante SMS)</li>
                    <li className="flex items-start gap-2"><span className="text-[#3498DB] mt-1 shrink-0">•</span>Tipo de usuario (vecino, comercio o institución)</li>
                  </ul>
                </div>
                <div>
                  <p className="text-white/90 font-semibold text-xs uppercase tracking-wider mb-2">📌 Datos generados por el uso de la aplicación:</p>
                  <ul className="space-y-1.5 ml-4">
                    <li className="flex items-start gap-2"><span className="text-[#3498DB] mt-1 shrink-0">•</span>Ubicación geográfica (coordenadas GPS)</li>
                    <li className="flex items-start gap-2"><span className="text-[#3498DB] mt-1 shrink-0">•</span>Dirección o referencia del reclamo</li>
                    <li className="flex items-start gap-2"><span className="text-[#3498DB] mt-1 shrink-0">•</span>Descripción del problema reportado</li>
                    <li className="flex items-start gap-2"><span className="text-[#3498DB] mt-1 shrink-0">•</span>Fotografías adjuntas (cuando corresponda)</li>
                    <li className="flex items-start gap-2"><span className="text-[#3498DB] mt-1 shrink-0">•</span>Fecha y hora del reclamo</li>
                    <li className="flex items-start gap-2"><span className="text-[#3498DB] mt-1 shrink-0">•</span>Estado y evolución del reclamo</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-white font-bold text-base flex items-center gap-2">
                <span className="text-[#3498DB] text-xs font-black bg-[#3498DB]/10 px-2 py-0.5 rounded-md">4</span>
                Finalidad del tratamiento de los datos
              </h2>
              <p>Los datos personales serán utilizados para:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2"><span className="text-[#3498DB] mt-1 shrink-0">•</span>Gestionar y dar seguimiento a reclamos ciudadanos</li>
                <li className="flex items-start gap-2"><span className="text-[#3498DB] mt-1 shrink-0">•</span>Mejorar la calidad de los servicios públicos</li>
                <li className="flex items-start gap-2"><span className="text-[#3498DB] mt-1 shrink-0">•</span>Elaborar estadísticas para la toma de decisiones municipales</li>
                <li className="flex items-start gap-2"><span className="text-[#3498DB] mt-1 shrink-0">•</span>Enviar comunicaciones institucionales relacionadas con el servicio</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-white font-bold text-base flex items-center gap-2">
                <span className="text-[#3498DB] text-xs font-black bg-[#3498DB]/10 px-2 py-0.5 rounded-md">5</span>
                Base legal del tratamiento
              </h2>
              <p>El tratamiento de los datos se realiza conforme a:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2"><span className="text-[#3498DB] mt-1 shrink-0">•</span>Ley N° 25.326 de Protección de Datos Personales</li>
                <li className="flex items-start gap-2"><span className="text-[#3498DB] mt-1 shrink-0">•</span>Normativa aplicable a la administración pública</li>
                <li className="flex items-start gap-2"><span className="text-[#3498DB] mt-1 shrink-0">•</span>Interés público en la gestión de servicios municipales</li>
              </ul>
            </section>

            <section className="space-y-3 bg-white/5 p-6 rounded-2xl border border-white/10">
              <h2 className="text-white font-bold text-base flex items-center gap-2">
                <span className="text-[#F1C40F] text-xs font-black bg-[#F1C40F]/10 px-2 py-0.5 rounded-md">6</span>
                Almacenamiento de los datos
              </h2>
              <p>
                La aplicación se encuentra en una <strong className="text-white/90">fase inicial (MVP)</strong>, por lo que:
              </p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2"><span className="text-[#3498DB] mt-1 shrink-0">•</span>Parte o la totalidad de la información puede almacenarse localmente en el dispositivo del usuario mediante tecnologías como localStorage del navegador.</li>
                <li className="flex items-start gap-2"><span className="text-[#3498DB] mt-1 shrink-0">•</span>Los datos pueden no estar alojados en servidores centralizados en esta etapa.</li>
              </ul>
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-[#F1C40F]/80 font-semibold text-xs uppercase tracking-wider mb-2">⚠️ Implicancias importantes:</p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2"><span className="text-[#F1C40F] mt-1 shrink-0">⚠</span>Los datos pueden perderse si el usuario borra el historial o datos del navegador</li>
                  <li className="flex items-start gap-2"><span className="text-[#F1C40F] mt-1 shrink-0">⚠</span>Los datos pueden perderse si el usuario cambia de dispositivo</li>
                  <li className="flex items-start gap-2"><span className="text-[#F1C40F] mt-1 shrink-0">⚠</span>Los datos pueden perderse si el usuario reinstala o restablece su equipo</li>
                  <li className="flex items-start gap-2"><span className="text-[#F1C40F] mt-1 shrink-0">⚠</span>La disponibilidad de la información depende del correcto funcionamiento del dispositivo y navegador</li>
                </ul>
              </div>
              <p className="text-white/60 font-semibold text-xs mt-4 pt-4 border-t border-white/10">
                El usuario declara conocer y aceptar estas condiciones al utilizar la aplicación.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-white font-bold text-base flex items-center gap-2">
                <span className="text-[#3498DB] text-xs font-black bg-[#3498DB]/10 px-2 py-0.5 rounded-md">7</span>
                Conservación de los datos
              </h2>
              <p>Los datos serán conservados:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2"><span className="text-[#3498DB] mt-1 shrink-0">•</span>Durante el tiempo necesario para cumplir con la finalidad del servicio</li>
                <li className="flex items-start gap-2"><span className="text-[#3498DB] mt-1 shrink-0">•</span>O hasta que el usuario solicite su eliminación, cuando sea técnicamente posible</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-white font-bold text-base flex items-center gap-2">
                <span className="text-[#3498DB] text-xs font-black bg-[#3498DB]/10 px-2 py-0.5 rounded-md">8</span>
                Compartición de datos
              </h2>
              <p>Los datos personales:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2"><span className="text-[#3498DB] mt-1 shrink-0">•</span>No serán vendidos ni cedidos a terceros con fines comerciales</li>
                <li className="flex items-start gap-2"><span className="text-[#3498DB] mt-1 shrink-0">•</span>Podrán ser compartidos exclusivamente entre áreas internas de la Municipalidad para la gestión de reclamos</li>
                <li className="flex items-start gap-2"><span className="text-[#3498DB] mt-1 shrink-0">•</span>Podrán ser utilizados de forma anonimizada para fines estadísticos</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-white font-bold text-base flex items-center gap-2">
                <span className="text-[#3498DB] text-xs font-black bg-[#3498DB]/10 px-2 py-0.5 rounded-md">9</span>
                Seguridad de la información
              </h2>
              <p>
                La Municipalidad adopta medidas técnicas y organizativas razonables para proteger los datos personales. No obstante, el usuario reconoce que:
              </p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2"><span className="text-[#3498DB] mt-1 shrink-0">•</span>Ningún sistema es completamente seguro</li>
                <li className="flex items-start gap-2"><span className="text-[#3498DB] mt-1 shrink-0">•</span>Existen riesgos inherentes al uso de tecnologías digitales</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-white font-bold text-base flex items-center gap-2">
                <span className="text-[#3498DB] text-xs font-black bg-[#3498DB]/10 px-2 py-0.5 rounded-md">10</span>
                Derechos del titular de los datos
              </h2>
              <p>El usuario podrá ejercer los siguientes derechos:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2"><span className="text-[#3498DB] mt-1 shrink-0">•</span>Acceso a sus datos personales</li>
                <li className="flex items-start gap-2"><span className="text-[#3498DB] mt-1 shrink-0">•</span>Rectificación de datos inexactos</li>
                <li className="flex items-start gap-2"><span className="text-[#3498DB] mt-1 shrink-0">•</span>Actualización</li>
                <li className="flex items-start gap-2"><span className="text-[#3498DB] mt-1 shrink-0">•</span>Supresión (cuando corresponda)</li>
              </ul>
              <p className="text-white/50 text-xs italic">
                De conformidad con los artículos 14 y 16 de la Ley N° 25.326.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-white font-bold text-base flex items-center gap-2">
                <span className="text-[#3498DB] text-xs font-black bg-[#3498DB]/10 px-2 py-0.5 rounded-md">11</span>
                Autoridad de control
              </h2>
              <p>
                La <strong className="text-white/90">Agencia de Acceso a la Información Pública (AAIP)</strong> es el órgano de control de la Ley de Protección de Datos Personales.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-white font-bold text-base flex items-center gap-2">
                <span className="text-[#3498DB] text-xs font-black bg-[#3498DB]/10 px-2 py-0.5 rounded-md">12</span>
                Consentimiento
              </h2>
              <p>
                El uso de la aplicación implica el consentimiento libre, expreso e informado del usuario para el tratamiento de sus datos personales conforme a la presente política.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-white font-bold text-base flex items-center gap-2">
                <span className="text-[#3498DB] text-xs font-black bg-[#3498DB]/10 px-2 py-0.5 rounded-md">13</span>
                Modificaciones de la política
              </h2>
              <p>
                La presente Política de Privacidad podrá ser actualizada en cualquier momento para adaptarse a cambios normativos o mejoras del servicio. Las modificaciones serán notificadas a través de la aplicación.
              </p>
            </section>

            <section className="space-y-3 bg-white/5 p-6 rounded-2xl border border-white/10">
              <h2 className="text-white font-bold text-base flex items-center gap-2">
                <span className="text-[#3498DB] text-xs font-black bg-[#3498DB]/10 px-2 py-0.5 rounded-md">14</span>
                Contacto
              </h2>
              <p>Para consultas relacionadas con la privacidad de los datos, el usuario podrá comunicarse con:</p>
              <div className="space-y-2 ml-4 mt-2">
                <p className="flex items-center gap-2"><span className="text-[#3498DB]">🏛</span> <strong className="text-white/90">Municipalidad de Las Higueras</strong></p>
                <p className="flex items-center gap-2"><span className="text-[#3498DB]">✉</span> munilashigueras@gmail.com</p>
                <p className="flex items-center gap-2"><span className="text-[#3498DB]">✉</span> administracion@lashigueras.gov.ar</p>
                <p className="flex items-center gap-2"><span className="text-[#3498DB]">📍</span> Pje. Bulnes 151</p>
                <p className="flex items-center gap-2"><span className="text-[#3498DB]">📞</span> 358-4970006</p>
              </div>
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
