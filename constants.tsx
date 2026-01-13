
import { UserRole, ComplaintStatus, ComplaintPriority, PaymentStatus, User, Complaint, Notice, Payment } from './types';

export const MOCK_ADMIN: User = {
  id: 'admin-1',
  name: 'Sarah Connor',
  email: 'admin@civichub.com',
  role: UserRole.ADMIN,
  phone: '+1 234 567 8900',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'
};

export const MOCK_RESIDENT: User = {
  id: 'res-1',
  name: 'John Doe',
  email: 'john@example.com',
  role: UserRole.RESIDENT,
  unitNumber: 'B-402',
  phone: '+1 987 654 3210',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
};

export const INITIAL_NOTICES: Notice[] = [
  {
    id: 'n1',
    title: 'Elevator Maintenance Scheduled',
    content: 'Elevator in Block B will be under maintenance this Friday from 10 AM to 4 PM.',
    postedBy: 'Admin Team',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    category: 'Urgent'
  },
  {
    id: 'n2',
    title: 'Weekend Yoga Session',
    content: 'Join us for a community yoga session in the central park this Sunday at 7 AM.',
    postedBy: 'Society Secretary',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    category: 'Event'
  }
];

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'c1',
    userId: 'res-1',
    userName: 'John Doe',
    unitNumber: 'B-402',
    title: 'Water Leakage in Kitchen',
    description: 'There is a persistent drip from the main sink pipe.',
    category: 'Plumbing',
    priority: ComplaintPriority.HIGH,
    status: ComplaintStatus.OPEN,
    createdAt: new Date(Date.now() - 43200000).toISOString()
  },
  {
    id: 'c2',
    userId: 'res-2',
    userName: 'Alice Smith',
    unitNumber: 'A-101',
    title: 'Broken Lobby Light',
    description: 'The light near the entrance of Block A is flickering.',
    category: 'Electrical',
    priority: ComplaintPriority.LOW,
    status: ComplaintStatus.IN_PROGRESS,
    createdAt: new Date(Date.now() - 259200000).toISOString()
  }
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'p1',
    userId: 'res-1',
    userName: 'John Doe',
    unitNumber: 'B-402',
    amount: 250,
    month: 'October 2023',
    dueDate: '2023-10-10',
    status: PaymentStatus.PAID
  },
  {
    id: 'p2',
    userId: 'res-1',
    userName: 'John Doe',
    unitNumber: 'B-402',
    amount: 250,
    month: 'November 2023',
    dueDate: '2023-11-10',
    status: PaymentStatus.PENDING
  }
];
