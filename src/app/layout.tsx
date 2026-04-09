import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Las Higueras Activa — Gestión de Reclamos',
  description:
    'Plataforma municipal de reclamos vecinales. Hacé tu reclamo de forma rápida y seguí su estado en tiempo real. Las Higueras, Córdoba.',
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
      </head>
      <body>
        <div className="app-background-image" />
        <div className="app-container">{children}</div>
      </body>
    </html>
  );
}
