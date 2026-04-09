// ============================================
// Tipos TypeScript para Las Higueras Activa
// ============================================

export type ClaimStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';

export type UserType = 'vecino' | 'comercio' | 'institucion' | 'escuela';

export type CategoryId =
  | 'alumbrado'
  | 'calles'
  | 'agua'
  | 'residuos'
  | 'espacios_verdes'
  | 'sanitarios'
  | 'otros';

export interface User {
  id: string;
  phone: string;
  name: string;
  type: UserType;
  location?: string;
  createdAt: string;
}

export interface Claim {
  id: string;
  userId: string;
  userName: string;
  category: CategoryId;
  categoryLabel: string;
  description: string;
  photoUrl?: string;
  latitude: number;
  longitude: number;
  address: string;
  status: ClaimStatus;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface Message {
  id: string;
  title: string;
  body: string;
  date: string;
  read: boolean;
  from: string;
}
