'use client';

import React from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { MAP_OPTIONS } from '@/config/mapStyle';

interface InteractiveMapProps {
  center: { lat: number, lng: number };
  zoom: number;
  markers?: Array<{
    id: string | number;
    position: { lat: number, lng: number };
    status?: string;
    onClick?: () => void;
  }>;
  onMapClick?: (e: any) => void;
  onMarkerDragEnd?: (e: any) => void;
  draggableMarker?: boolean;
  markerIcon?: any;
}

export default function InteractiveMap({ 
  center, 
  zoom, 
  markers = [], 
  onMapClick, 
  onMarkerDragEnd,
  draggableMarker = false,
  markerIcon
}: InteractiveMapProps) {
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '',
    language: 'es',
    region: 'AR'
  });

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black/20 rounded-2xl border border-white/5 animate-pulse">
        <span className="text-white/20 text-xs font-bold uppercase tracking-widest">Cargando Mapa...</span>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100%', borderRadius: '1.5rem' }}
      center={center}
      zoom={zoom}
      options={MAP_OPTIONS}
      onClick={onMapClick}
    >
      {/* Single draggable marker (for login/new claim) */}
      {draggableMarker && (
        <Marker 
          position={center} 
          draggable 
          onDragEnd={onMarkerDragEnd} 
          icon={markerIcon}
        />
      )}

      {/* Multiple fixed markers (for admin) */}
      {!draggableMarker && markers.map((m) => (
        <Marker 
          key={m.id}
          position={m.position}
          onClick={m.onClick}
          icon={m.status ? {
            path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
            fillColor: m.status === 'RESOLVED' ? '#2ECC71' : m.status === 'IN_PROGRESS' ? '#F1C40F' : '#E74C3C',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#FFFFFF',
            scale: 1.5,
            anchor: { x: 12, y: 24 } as any,
          } : markerIcon}
        />
      ))}
    </GoogleMap>
  );
}
