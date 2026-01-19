
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from "react";
import { supabase } from "./supabaseClient";

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
  Visitor,
  PaymentStatus
} from "./types";

import { 
  MOCK_ADMIN, 
  MOCK_RESIDENT, 
  INITIAL_COMPLAINTS, 
  INITIAL_NOTICES, 
  INITIAL_PAYMENTS 
} from './constants';

/* =========================
   CONTEXT TYPE
========================= */
interface AppContextType extends AppState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: UserRole, name: string, unitNumber: string) => Promise<void>;
  logout: () => void;
  addComplaint: (complaint: Partial<Complaint>) => void;
  updateComplaintStatus: (id: string, status: ComplaintStatus) => void;
  handleSolveComplaint: (id: string) => Promise<void>;
  addNotice: (notice: Partial<Notice>) => void;
  deleteNotice: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addVisitor: (visitor: Partial<Visitor>) => void;
  updateVisitorExit: (id: string) => void;
  payBill: (id: string) => Promise<void>;
  residents: User[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

/* =========================
   PROVIDER
========================= */
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [residents, setResidents] = useState<User[]>([]);

  // Check active session on mount
  useEffect(() => {
    const initSession = async () => {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) throw error;
            if (session?.user) {
                await fetchProfile(session.user.id, session.user.email!);
            }
        } catch (err) {
            console.warn("Session check failed (likely offline/mock mode needed):", err);
            // We stay logged out, user must login manually to trigger mock fallback
        }
    };
    
    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email!);
      } else {
        // Only clear if we aren't in a manually set mock session (which has no supabase session)
        // However, Supabase auth change fires on init. 
        // We'll rely on the user state to persist if set manually.
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string, email: string) => {
    try {
        const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

        if (error) throw error;

        if (data) {
            setUser({
                id: data.id,
                name: data.name,
                email: data.email,
                role: data.role as UserRole,
                unitNumber: data.unitNumber
            });
        }
    } catch (error: any) {
        console.error("Profile fetch failed, checking mocks...", error);
        
        // Fallback to Mock Data if network fails
        const mockUser = [MOCK_ADMIN, MOCK_RESIDENT].find(u => u.email === email);
        if (mockUser) {
            setUser(mockUser);
            // If we are falling back to mock user, we should also load mock data
            loadMockData();
        } else if (error.code === 'PGRST116') {
             // Auto-healing for missing profile in real DB
             const name = email.split('@')[0];
             await supabase.from('profiles').insert([{
                 id: userId,
                 email,
                 name: name,
                 role: 'RESIDENT',
                 unitNumber: 'N/A'
             }]);
             // Retry once
             fetchProfile(userId, email);
        }
    }
  };

  const loadMockData = () => {
    setComplaints(INITIAL_COMPLAINTS);
    setNotices(INITIAL_NOTICES);
    setPayments(INITIAL_PAYMENTS);
    setResidents([MOCK_ADMIN, MOCK_RESIDENT]);
    setVisitors([
        {
            id: 'v1',
            name: 'Michael Scott',
            phone: '555-0199',
            purpose: 'Delivery',
            residentId: 'res-1',
            residentName: 'John Doe',
            unitNumber: 'B-402',
            entryTime: new Date(Date.now() - 3600000).toISOString(),
            status: 'IN'
        }
    ]);
  };

  // Fetch Data when User logs in
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    // If we are using a mock user ID, skip real fetch
    if (user?.id === MOCK_ADMIN.id || user?.id === MOCK_RESIDENT.id) {
        loadMockData();
        return;
    }

    try {
      const [resComplaints, resNotices, resVisitors, resResidents, resPayments] = await Promise.all([
        supabase.from('complaints').select('*').order('createdAt', { ascending: false }),
        supabase.from('notices').select('*').order('createdAt', { ascending: false }),
        supabase.from('visitors').select('*').order('entryTime', { ascending: false }),
        supabase.from('profiles').select('*').eq('role', 'RESIDENT'),
        supabase.from('payments').select('*')
      ]);

      if (resComplaints.data) setComplaints(resComplaints.data as any);
      if (resNotices.data) setNotices(resNotices.data as any);
      if (resVisitors.data) setVisitors(resVisitors.data as any);
      if (resResidents.data) setResidents(resResidents.data as any);
      if (resPayments.data) setPayments(resPayments.data as any);

    } catch (error) {
      console.error("Failed to fetch data, using fallback:", error);
      loadMockData();
    }
  };

  /* =========================
     AUTH
  ========================= */
  const login = async (email: string, password: string) => {
    try {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
    } catch (error: any) {
        console.warn("Supabase Login failed, attempting mock login:", error.message);
        
        // Mock Fallback
        const mockUser = [MOCK_ADMIN, MOCK_RESIDENT].find(u => u.email === email);
        if (mockUser) {
            setUser(mockUser);
            loadMockData();
            return;
        }

        alert("Login failed: " + error.message);
        throw error;
    }
  };

  const register = async (email: string, password: string, role: UserRole, name: string, unitNumber: string) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').insert([{
          id: authData.user.id,
          email,
          name,
          role,
          unitNumber
        }]);
        
        if (profileError) {
           console.error("Profile creation failed", profileError);
        }
        
        alert("Account created! Please log in.");
        if (authData.session) {
            await fetchProfile(authData.user.id, email);
        }
      }
    } catch (error: any) {
      console.error("Registration Error:", error);
      alert(error.message || "Registration failed");
      throw error;
    }
  };

  const logout = async () => {
    try {
        await supabase.auth.signOut();
    } catch(e) { console.log('Signout local only'); }
    setUser(null);
    setComplaints([]);
    setNotices([]);
    setVisitors([]);
    setResidents([]);
  };

  /* =========================
     NOTIFICATIONS (Local State)
  ========================= */
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  /* =========================
     COMPLAINTS
  ========================= */
  const addComplaint = async (data: Partial<Complaint>) => {
    if (!user) return;

    const payload = {
      userId: user.id,
      userName: user.name,
      unitNumber: data.unitNumber || user.unitNumber || "N/A", 
      title: data.title,
      description: data.description,
      category: data.category || "General",
      priority: data.priority || ComplaintPriority.MEDIUM,
      status: 'OPEN'
    };

    // Optimistic Update
    const tempId = `temp-${Date.now()}`;
    const optimisticComplaint = { ...payload, id: tempId, createdAt: new Date().toISOString() } as Complaint;
    setComplaints(prev => [optimisticComplaint, ...prev]);

    setNotifications(prev => [{
        id: `notif-${Date.now()}`,
        userId: user.id,
        title: 'Complaint Raised',
        message: `Ticket has been created successfully for ${payload.unitNumber}.`,
        type: 'COMPLAINT',
        isRead: false,
        createdAt: new Date().toISOString()
    }, ...prev]);

    try {
        const { data: saved, error } = await supabase.from('complaints').insert([payload]).select().single();
        if (error) throw error;
        // Replace temp with real
        setComplaints(prev => prev.map(c => c.id === tempId ? saved as any : c));
    } catch (e) {
        console.warn("Backend add failed, keeping optimistic data");
    }
  };

  const updateComplaintStatus = async (id: string, status: ComplaintStatus) => {
    // We update local state with timestamp for UI feedback
    const resolvedAt = status === ComplaintStatus.RESOLVED ? new Date().toISOString() : undefined;
    setComplaints(prev => prev.map(c => (c.id === id ? { ...c, status, ...(resolvedAt ? { resolvedAt } : {}) } : c)));

    try {
        // Only update status in DB to avoid 'column not found' errors if schema is missing resolvedAt
        await supabase.from('complaints').update({ status }).eq('id', id);
    } catch (e) {
        console.warn("Backend update failed");
    }
  };

  const handleSolveComplaint = async (id: string) => {
    // 0. Snapshot for rollback
    const previousComplaints = [...complaints];
    
    // 1. Prepare Update Data
    const resolvedAt = new Date().toISOString();
    const status = ComplaintStatus.RESOLVED; 

    // 2. Optimistic Update (Update UI immediately)
    setComplaints(prev => prev.map(c => 
      c.id === id ? { ...c, status, resolvedAt } : c
    ));

    // 3. Supabase Update
    try {
        // FIX: Removed 'resolvedAt' from DB update to prevent schema mismatch error.
        // The status update will persist the "Solved" state correctly.
        const { error } = await supabase
            .from('complaints')
            .update({ status: 'RESOLVED' }) 
            .eq('id', id);

        if (error) throw error;
    } catch (error: any) {
        console.error("Backend solve failed:", error.message || error);
        
        // 4. Rollback on Error
        setComplaints(previousComplaints);
        
        // 5. Notify User
        alert(`Failed to resolve complaint: ${error.message || "Check your network or permissions."}`);
    }
  };

  /* =========================
     NOTICES
  ========================= */
  const addNotice = async (notice: Partial<Notice>) => {
    if (!user) return;
    const payload = {
       title: notice.title,
       content: notice.content,
       category: notice.category || "General",
       postedBy: user.name
    };

    const tempId = `temp-notice-${Date.now()}`;
    const optimisticNotice = { ...payload, id: tempId, createdAt: new Date().toISOString() } as Notice;
    setNotices(prev => [optimisticNotice, ...prev]);

    try {
        const { data: saved, error } = await supabase.from('notices').insert([payload]).select().single();
        if (!error && saved) {
            setNotices(prev => prev.map(n => n.id === tempId ? saved as any : n));
        }
    } catch (e) { console.warn("Backend notice add failed"); }
  };

  const deleteNotice = async (id: string) => {
    setNotices(prev => prev.filter(n => n.id !== id));
    try {
        await supabase.from('notices').delete().eq('id', id);
    } catch(e) { console.warn("Backend notice delete failed"); }
  };

  /* =========================
     VISITORS
  ========================= */
  const addVisitor = async (v: Partial<Visitor>) => {
    const tempId = `temp-visitor-${Date.now()}`;
    const optimisticVisitor = { ...v, id: tempId, status: 'IN', entryTime: new Date().toISOString() } as Visitor;
    setVisitors(prev => [optimisticVisitor, ...prev]);

    try {
        const { data: saved, error } = await supabase.from('visitors').insert([v]).select().single();
        if (!error && saved) {
            setVisitors(prev => prev.map(vis => vis.id === tempId ? saved as any : vis));
        }
    } catch(e) { console.warn("Backend visitor add failed"); }
  };

  const updateVisitorExit = async (id: string) => {
    const updates = { status: 'OUT', exitTime: new Date().toISOString() };
    setVisitors(prev => prev.map(v => v.id === id ? { ...v, ...updates } as any : v));

    try {
        await supabase.from('visitors').update(updates).eq('id', id);
    } catch(e) { console.warn("Backend visitor exit failed"); }
  };

  /* =========================
     PAYMENTS
  ========================= */
  const payBill = async (id: string) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'PAID' as PaymentStatus } : p));
    
    if (user) {
        setNotifications(prev => [{
            id: `notif-${Date.now()}`,
            userId: user.id,
            title: 'Payment Successful',
            message: `Thank you! Your payment has been marked as received.`,
            type: 'PAYMENT',
            isRead: false,
            createdAt: new Date().toISOString()
        }, ...prev]);
    }

    try {
        await supabase.from('payments').update({ status: 'PAID' }).eq('id', id);
    } catch(e) { console.warn("Backend payment update failed"); }
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
        register,
        logout,
        addComplaint,
        updateComplaintStatus,
        handleSolveComplaint,
        addNotice,
        deleteNotice,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addVisitor,
        updateVisitorExit,
        payBill
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
