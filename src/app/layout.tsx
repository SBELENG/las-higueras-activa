import type { Metadata } from 'next';
import './globals.css';
import InstallGuide from '@/components/InstallGuide';

export const metadata: Metadata = {
  title: 'Las Higueras Activa — Gestión de Reclamos',
  description:
    'Plataforma municipal de reclamos vecinales. Hacé tu reclamo de forma rápida y seguí su estado en tiempo real. Las Higueras, Córdoba.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'LH Activa',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/assets/logo.svg" />
      </head>
      <body>
        <div className="app-background-image" />
        <div className="app-container">
          {children}
          <InstallGuide />
        </div>
      </body>
    </html>
  );
}
