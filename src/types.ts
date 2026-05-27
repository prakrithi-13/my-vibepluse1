export type PageType = 'LANDING' | 'CREATE_EVENT' | 'DISCOVER' | 'DASHBOARD' | 'ADMIN' | 'SECURE_SECTOR';

export type EventType = 'live' | 'dj' | 'festival' | 'underground' | 'workshop';

export interface MusicEvent {
  id: string;
  name: string;
  type: EventType;
  maxCapacity: number;
  currentCapacity: number; // dynamically updated when user registers
  location: string;
  address: string;
  description: string;
  startTime: string; // datetime string
  endTime: string; // datetime string
  price: number;
  email: string;
  phone: string;
  bannerUrl: string;
  tag?: string; // e.g. "Selling Fast", "VIP Open", etc.
  usersCount?: number; // total users attending or checked in (for operations reporting)
  isUserRegistered?: boolean; // track if the current user registered
  createdBy?: string;
  createdAt?: string;
}

export interface UserStats {
  registeredEventsCount: number;
  completedExperiencesCount: number;
  vibePoints: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'VIP Platinum';
}

export interface PlatformStats {
  totalEventsCount: number;
  activeUsersCount: number;
  ticketsSoldCount: number;
  revenueRub: number; // represented in Rupees/Dollars
}
