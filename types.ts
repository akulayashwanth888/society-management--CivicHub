
export enum UserRole {
  ADMIN = 'ADMIN',
  RESIDENT = 'RESIDENT'
}

export enum ComplaintStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED'
}

export enum ComplaintPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum PaymentStatus {
  PAID = 'PAID',
  PENDING = 'PENDING',
  OVERDUE = 'OVERDUE'
}

export type NotificationType = 'COMPLAINT' | 'NOTICE' | 'PAYMENT' | 'SYSTEM' | 'SECURITY';

export interface Notification {
  id: string;
  userId: string; // Target user ID
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  targetTab?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  unitNumber?: string;
  phone?: string;
  avatar?: string;
}

export interface Complaint {
  id: string;
  userId: string;
  userName: string;
  unitNumber: string;
  title: string;
  description: string;
  category: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  createdAt: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  postedBy: string;
  createdAt: string;
  category: 'General' | 'Urgent' | 'Event' | 'Maintenance';
}

export interface Payment {
  id: string;
  userId: string;
  userName: string;
  unitNumber: string;
  amount: number;
  month: string;
  dueDate: string;
  status: PaymentStatus;
}

export interface Visitor {
  id: string;
  name: string;
  phone: string;
  purpose: string;
  residentId: string;
  residentName: string;
  unitNumber: string;
  entryTime: string;
  exitTime?: string;
  status: 'IN' | 'OUT';
}

export interface AppState {
  user: User | null;
  complaints: Complaint[];
  notices: Notice[];
  payments: Payment[];
  residents: User[];
  notifications: Notification[];
  visitors: Visitor[];
}
