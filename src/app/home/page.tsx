'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';
import GlassHeader from '@/components/GlassHeader';

export default function HomePage() {
  const router = useRouter();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [userData, setUserData] = useState<{name: string, location: string, role?: string}>({
    name: "Vecino",
    location: "Las Higueras, Córdoba",
    role: "vecino"
  });

  useEffect(() => {
    try {
      const msgs = JSON.parse(localStorage.getItem('lh_messages') || '[]');
      setUnreadMessages(msgs.filter((m: any) => !m.read).length);
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lh_activa_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        setUserData({
          name: parsed.name || "Vecino",
          location: parsed.barrio || (parsed.role === 'comercio' ? 'Comercio Local, Las Higueras' : 'Barrio San Alberto, Las Higueras'),
          role: parsed.role || "vecino"
        });
      }
    } catch (e) {
      console.error("Error loading user data", e);
    }
  }, []);

  const menuItems = [
    {
      id: 'reclamo',
      title: 'Hacer Reclamo',
      subtitle: 'Inicia un nuevo reporte',
      icon: '🚨',
      accent: '#2ECC71',
      href: '/reclamo/nuevo'
    },
    {
      id: 'mis-reclamos',
      title: 'Mis Reclamos',
      subtitle: 'Seguí el estado de tus trámites',
      icon: '🚥',
      accent: '#3498DB',
      href: '/reclamos'
    },
    {
      id: 'mensajes',
      title: 'Mensajes',
      subtitle: 'Novedades y avisos municipales',
      icon: '📢',
      accent: '#F1C40F',
      href: '/mensajes',
      badge: unreadMessages > 0 ? unreadMessages : undefined
    },
    {
      id: 'admin',
      title: 'Gestor Municipal',
      subtitle: 'Acceso privado para administración',
      icon: '🛡️',
      accent: '#9B59B6',
      href: '/admin'
    }
  ];

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

  const handleLogout = () => {
    localStorage.removeItem('lh_activa_user');
    router.push('/login');
  };

  return (
    <main className="min-h-screen relative p-6 md:p-12 flex flex-col items-center">
      <div className="app-bg"></div>
      
      <div className="w-full max-w-lg flex flex-col gap-10">
        {/* Welcome Header */}
        <GlassHeader 
          userName={userData.name} 
          location={userData.location} 
          onLogout={handleLogout}
        />

        {/* Dashboard Cards Container */}
        <div className="space-y-6">
          <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest px-1">Gestión Ciudadana</p>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-6"
          >
            {menuItems
              .filter(item => item.id !== 'admin' || userData.role === 'admin' || userData.role === 'gestor' || userData.role === 'intendente')
              .map((item) => (
              <motion.div key={item.id} variants={itemVariants}>
                <GlassCard 
                  title={item.title}
                  subtitle={item.subtitle}
                  icon={item.icon}
                  badge={item.badge}
                  accentColor={item.accent}
                  onClick={() => router.push(item.href)}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Footnote */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-white/40 text-sm mt-12 pb-10"
        >
          "Hacer un reclamo debe ser tan fácil como mandar un WhatsApp"
        </motion.p>
      </div>
    </main>
  );
}
