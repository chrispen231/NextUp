export type Role = 'PLAYER' | 'AGENT' | 'SCOUT' | 'CLUB' | 'ADMIN';
export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface Actor {
  id: string;
  role: Role;
  status: VerificationStatus;
  email: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Player extends Actor {
  role: 'PLAYER';
  profile: {
    position: string;
    dateOfBirth: string;
    height?: number;
    weight?: number;
    bio?: string;
  };
}

export interface Agent extends Actor {
  role: 'AGENT';
  licenseNumber?: string;
  organization?: string;
}

export interface Club extends Actor {
  role: 'CLUB';
  location: string;
  league?: string;
}
