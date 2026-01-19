
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

/* =========================
   MOCK DATABASE (In-Memory)
========================= */

// Initial Data mirroring constants.tsx
let USERS = [
  {
    id: 'admin-1',
    name: 'Sarah Connor',
    email: 'admin@civichub.com',
    password: 'admin', // In real app, hash this
    role: 'ADMIN',
    phone: '+1 234 567 8900',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'res-1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password',
    role: 'RESIDENT',
    unitNumber: 'B-402',
    phone: '+1 987 654 3210',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'res-2',
    name: 'Alice Smith',
    email: 'alice@example.com',
    password: 'password',
    role: 'RESIDENT',
    unitNumber: 'A-101',
    phone: '+1 555 123 4567',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80'
  }
];

let COMPLAINTS = [
  {
    id: 'c1',
    userId: 'res-1',
    userName: 'John Doe',
    unitNumber: 'B-402',
    title: 'Water Leakage in Kitchen',
    description: 'There is a persistent drip from the main sink pipe.',
    category: 'Plumbing',
    priority: 'HIGH',
    status: 'OPEN',
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
    priority: 'LOW',
    status: 'IN_PROGRESS',
    createdAt: new Date(Date.now() - 259200000).toISOString()
  }
];

let NOTICES = [
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

let VISITORS = [
  {
    id: "v1",
    name: "Michael Scott",
    phone: "555-0199",
    purpose: "Delivery",
    residentId: "res-1",
    residentName: "John Doe",
    unitNumber: "B-402",
    entryTime: new Date(Date.now() - 3600000).toISOString(),
    status: "IN"
  }
];

let PAYMENTS = [
  {
    id: 'p1',
    userId: 'res-1',
    userName: 'John Doe',
    unitNumber: 'B-402',
    amount: 250,
    month: 'October 2023',
    dueDate: '2023-10-10',
    status: 'PAID'
  },
  {
    id: 'p2',
    userId: 'res-1',
    userName: 'John Doe',
    unitNumber: 'B-402',
    amount: 250,
    month: 'November 2023',
    dueDate: '2023-11-10',
    status: 'PENDING'
  },
  {
    id: 'p3',
    userId: 'res-2',
    userName: 'Alice Smith',
    unitNumber: 'A-101',
    amount: 300,
    month: 'November 2023',
    dueDate: '2023-11-10',
    status: 'OVERDUE'
  }
];

/* =========================
   AUTH ROUTES
========================= */

app.post('/api/auth/login', (req, res) => {
  const { email, password, role, name, unitNumber } = req.body;
  
  // Simple mock authentication
  // In a real app, verify password hash
  let user = USERS.find(u => u.email === email && u.role === role);

  if (!user) {
    // If user doesn't exist but it's a "signup" flow (simplified for this demo)
    // We'll create one on the fly if name provided, otherwise fail
    if (name) {
      user = {
        id: `res-${Date.now()}`,
        name,
        email,
        password: password || '123456',
        role,
        unitNumber: unitNumber || 'N/A',
        avatar: 'https://ui-avatars.com/api/?name=' + name
      };
      USERS.push(user);
    } else {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  }

  // Create a fake JWT token structure (header.payload.signature)
  // This allows the frontend's atob() logic to work without crashing
  const payload = JSON.stringify({
    id: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    unitNumber: user.unitNumber
  });
  
  const token = `fakeHeader.${Buffer.from(payload).toString('base64')}.fakeSignature`;

  res.json({ token, user });
});

/* =========================
   COMPLAINT ROUTES
========================= */

app.get('/api/complaints', (req, res) => {
  res.json(COMPLAINTS);
});

app.post('/api/complaints', (req, res) => {
  const newComplaint = {
    id: `c-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'OPEN',
    ...req.body
  };
  COMPLAINTS.unshift(newComplaint);
  res.status(201).json(newComplaint);
});

app.put('/api/complaints/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, resolvedAt } = req.body;
  
  const index = COMPLAINTS.findIndex(c => c.id === id);
  if (index !== -1) {
    COMPLAINTS[index].status = status;
    if (resolvedAt) COMPLAINTS[index].resolvedAt = resolvedAt;
    res.json(COMPLAINTS[index]);
  } else {
    res.status(404).json({ message: 'Complaint not found' });
  }
});

/* =========================
   NOTICE ROUTES
========================= */

app.get('/api/notices', (req, res) => {
  res.json(NOTICES);
});

app.post('/api/notices', (req, res) => {
  const newNotice = {
    id: `n-${Date.now()}`,
    createdAt: new Date().toISOString(),
    postedBy: 'Admin', // Simplified
    ...req.body
  };
  NOTICES.unshift(newNotice);
  res.status(201).json(newNotice);
});

app.delete('/api/notices/:id', (req, res) => {
  const { id } = req.params;
  NOTICES = NOTICES.filter(n => n.id !== id);
  res.status(200).json({ message: 'Deleted' });
});

/* =========================
   VISITOR ROUTES
========================= */

app.get('/api/visitors', (req, res) => {
  res.json(VISITORS);
});

app.post('/api/visitors', (req, res) => {
  const newVisitor = {
    id: `v-${Date.now()}`,
    entryTime: new Date().toISOString(),
    status: 'IN',
    ...req.body
  };
  VISITORS.unshift(newVisitor);
  res.status(201).json(newVisitor);
});

app.put('/api/visitors/:id/exit', (req, res) => {
  const { id } = req.params;
  const index = VISITORS.findIndex(v => v.id === id);
  if (index !== -1) {
    VISITORS[index].status = 'OUT';
    VISITORS[index].exitTime = new Date().toISOString();
    res.json(VISITORS[index]);
  } else {
    res.status(404).json({ message: 'Visitor not found' });
  }
});

/* =========================
   PAYMENT ROUTES
========================= */

app.get('/api/payments', (req, res) => {
  res.json(PAYMENTS);
});

app.put('/api/payments/:id/pay', (req, res) => {
    const { id } = req.params;
    const index = PAYMENTS.findIndex(p => p.id === id);
    if (index !== -1) {
        PAYMENTS[index].status = 'PAID';
        res.json(PAYMENTS[index]);
    } else {
        res.status(404).json({ message: 'Invoice not found' });
    }
});

/* =========================
   RESIDENT/USER ROUTES
========================= */

app.get('/api/residents', (req, res) => {
  res.json(USERS.filter(u => u.role === 'RESIDENT'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
