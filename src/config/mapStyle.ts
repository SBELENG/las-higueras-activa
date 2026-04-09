export const MAP_DARK_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1a1c2c' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1c2c' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#5d627c' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#2ECC71' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#2ECC71' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2d334a' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1a1c2c' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8b93af' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e101a' }] },
];

export const MAP_OPTIONS = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: MAP_DARK_STYLE,
  gestureHandling: 'greedy',
  backgroundColor: '#0a0b14',
};
