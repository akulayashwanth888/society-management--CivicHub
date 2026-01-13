import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from "react";

import {
  User,
  UserRole,
  Complaint,
  Notice,
  Payment,
  AppState,
  ComplaintStatus,
  ComplaintPriority,
  Notification,
  Visitor
} from "./types";

import {
  MOCK_ADMIN,
  MOCK_RESIDENT,
  INITIAL_COMPLAINTS,
  INITIAL_NOTICES,
  INITIAL_PAYMENTS
} from "./constants";

/* =========================
   CONFIG
========================= */
const API_URL = "https://civichub-society-management-pro.onrender.com";

/* =========================
   CONTEXT TYPE
========================= */
interface AppContextType extends AppState {
  // Fixed: Updated login signature to accept 4 arguments as used in AuthPage.tsx
  login: (email: string, role: UserRole, unitNumber?: string, name?: string) => Promise<void>;
  logout: () => void;
  addComplaint: (complaint: Partial<Complaint>) => void;
  updateComplaintStatus: (id: string, status: ComplaintStatus) => void;
  addNotice: (notice: Partial<Notice>) => void;
  deleteNotice: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addVisitor: (visitor: Partial<Visitor>) => void;
  updateVisitorExit: (id: string) => void;
  residents: User[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

/* =========================
   INITIAL DATA
========================= */
const INITIAL_VISITORS: Visitor[] = [
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

/* =========================
   PROVIDER
========================= */
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);
  const [notices, setNotices] = useState<Notice[]>(INITIAL_NOTICES);
  const [payments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>(INITIAL_VISITORS);
  const [residents] = useState<User[]>([
    MOCK_RESIDENT,
    { ...MOCK_RESIDENT, id: "res-2", name: "Alice Smith", unitNumber: "A-101" }
  ]);

  /* =========================
     LOGIN (REAL BACKEND)
  ========================= */
  // Fixed: Updated login implementation to match the new signature and include name/unitNumber
  const login = async (email: string, role: UserRole, unitNumber?: string, name?: string) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role, unitNumber, name })
    });

    if (!res.ok) {
      alert("Login failed");
      return;
    }

    const data = await res.json();

    // Save token
    localStorage.setItem("token", data.token);

    // Decode token payload
    const payload = JSON.parse(atob(data.token.split(".")[1]));

    setUser({
      id: payload.id,
      role: payload.role,
      name: name || (payload.role === "admin" ? "Admin" : "Resident"),
      email,
      unitNumber: unitNumber || payload.unitNumber
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  /* =========================
     NOTIFICATIONS
  ========================= */
  const createNotification = (notif: Partial<Notification>) => {
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      userId: notif.userId || "",
      title: notif.title || "",
      message: notif.message || "",
      type: notif.type || "SYSTEM",
      isRead: false,
      createdAt: new Date().toISOString(),
      targetTab: notif.targetTab
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  /* =========================
     COMPLAINTS (TEMP MOCK)
     ⚠️ Backend integration next step
  ========================= */
  const addComplaint = (data: Partial<Complaint>) => {
    if (!user) return;

    const complaint: Complaint = {
      id: `c-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      unitNumber: user.unitNumber || "N/A",
      title: data.title || "",
      description: data.description || "",
      category: data.category || "General",
      // Fixed: Replaced string literal "MEDIUM" with ComplaintPriority.MEDIUM to match enum type
      priority: data.priority || ComplaintPriority.MEDIUM,
      status: ComplaintStatus.OPEN,
      createdAt: new Date().toISOString()
    };

    setComplaints(prev => [complaint, ...prev]);
  };

  const updateComplaintStatus = (id: string, status: ComplaintStatus) => {
    setComplaints(prev =>
      prev.map(c => (c.id === id ? { ...c, status } : c))
    );
  };

  /* =========================
     NOTICES
  ========================= */
  const addNotice = (notice: Partial<Notice>) => {
    const n: Notice = {
      id: `n-${Date.now()}`,
      title: notice.title || "",
      content: notice.content || "",
      category: notice.category || "General",
      postedBy: user?.name || "Admin",
      createdAt: new Date().toISOString()
    };
    setNotices(prev => [n, ...prev]);
  };

  const deleteNotice = (id: string) => {
    setNotices(prev => prev.filter(n => n.id !== id));
  };

  /* =========================
     VISITORS
  ========================= */
  const addVisitor = (v: Partial<Visitor>) => {
    const visitor: Visitor = {
      id: `v-${Date.now()}`,
      name: v.name || "",
      phone: v.phone || "",
      purpose: v.purpose || "",
      residentId: v.residentId || "",
      residentName: v.residentName || "",
      unitNumber: v.unitNumber || "",
      entryTime: new Date().toISOString(),
      status: "IN"
    };
    setVisitors(prev => [visitor, ...prev]);
  };

  const updateVisitorExit = (id: string) => {
    setVisitors(prev =>
      prev.map(v =>
        v.id === id
          ? { ...v, status: "OUT", exitTime: new Date().toISOString() }
          : v
      )
    );
  };

  /* =========================
     PROVIDER EXPORT
  ========================= */
  return (
    <AppContext.Provider
      value={{
        user,
        complaints,
        notices,
        payments,
        residents,
        notifications,
        visitors,
        login,
        logout,
        addComplaint,
        updateComplaintStatus,
        addNotice,
        deleteNotice,
        markNotificationAsRead: () => {},
        markAllNotificationsAsRead: () => {},
        addVisitor,
        updateVisitorExit
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

/* =========================
   HOOK
========================= */
export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
};
