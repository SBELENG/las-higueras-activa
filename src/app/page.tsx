'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { THEME } from '@/config/theme';

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <div className="splash-screen relative overflow-hidden">
      {/* Decorative gradient blob */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full"></div>

      <div
        className="glass-card max-w-[90vw] md:max-w-xl mx-auto flex flex-col items-center gap-10 border-white/10 text-center"
      >
        <div>
          <Image
            src={THEME.assets.logo}
            alt="Las Higueras Activa"
            width={120}
            height={120}
            className="splash-logo shadow-2xl"
            priority
          />
        </div>

        <div className="space-y-4">
          <h1
            className="splash-title !mb-0 text-3xl md:text-5xl"
          >
            Las Higueras Activa
          </h1>

          <p
            className="splash-subtitle !mb-0 mx-auto"
          >
            Tu voz importa. Hacé tu reclamo en segundos y seguilo en tiempo real.
          </p>
        </div>

        <div
          className="w-full max-w-xs"
        >
          <button
            className="btn-primary group"
            onClick={() => router.push('/login')}
            id="btn-start"
          >
            <span>Comienza tu reclamo</span>
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="3"
              className="group-hover:translate-x-1 transition-transform"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <p
          style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}
        >
          Municipalidad de Las Higueras · Córdoba, Argentina
        </p>
      </div>
    </div>
  );
}
