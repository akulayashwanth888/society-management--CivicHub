import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { UserRole, ComplaintStatus, PaymentStatus, ComplaintPriority, Notice, Visitor, Complaint } from '../types';
import { StatCard } from '../components/StatCard';
import { DashboardLayout } from '../components/Layout';

/* =========================================================================
   SUB-COMPONENTS
   ========================================================================= */

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    OPEN: 'bg-rose-100 text-rose-700',
    IN_PROGRESS: 'bg-amber-100 text-amber-700',
    RESOLVED: 'bg-emerald-100 text-emerald-700',
    PAID: 'bg-emerald-100 text-emerald-700',
    PENDING: 'bg-amber-100 text-amber-700',
    OVERDUE: 'bg-rose-100 text-rose-700',
    IN: 'bg-emerald-100 text-emerald-700',
    OUT: 'bg-slate-100 text-slate-500',
  };
  return (
    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

const PriorityBadge = ({ priority }: { priority: string }) => {
   const styles: Record<string, string> = {
    LOW: 'text-slate-500 bg-slate-100',
    MEDIUM: 'text-blue-600 bg-blue-50',
    HIGH: 'text-orange-600 bg-orange-50',
    URGENT: 'text-rose-600 bg-rose-50',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-transparent ${styles[priority]}`}>
      {priority}
    </span>
  );
};

/* --- RESIDENT VIEWS --- */

const ResidentOverview: React.FC<{ setTab: (t: string) => void }> = ({ setTab }) => {
  const { complaints, notices, payments, user } = useApp();
  const myComplaints = complaints.filter(c => c.userId === user?.id);
  const myPendingDues = payments.filter(p => p.userId === user?.id && p.status !== PaymentStatus.PAID);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Pending Dues" value={`$${myPendingDues.reduce((acc, p) => acc + p.amount, 0)}`} icon="💳" color="bg-rose-50 text-rose-600" />
        <StatCard label="Active Complaints" value={myComplaints.filter(c => c.status !== ComplaintStatus.RESOLVED).length} icon="🛠" color="bg-amber-50 text-amber-600" />
        <StatCard label="Recent Notices" value={notices.length} icon="📢" color="bg-indigo-50 text-indigo-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Latest Notices</h3>
            <button onClick={() => setTab('notices')} className="text-indigo-600 font-semibold text-sm hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {notices.slice(0, 3).map(notice => (
              <div key={notice.id} className="p-4 rounded-xl border border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                    notice.category === 'Urgent' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {notice.category}
                  </span>
                  <span className="text-xs text-slate-400">{new Date(notice.createdAt).toLocaleDateString()}</span>
                </div>
                <h4 className="font-bold text-slate-800">{notice.title}</h4>
                <p className="text-sm text-slate-500 mt-1 line-clamp-1">{notice.content}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">My Complaints</h3>
            <button onClick={() => setTab('complaints')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">New Complaint</button>
          </div>
          {myComplaints.length > 0 ? (
            <div className="space-y-4">
              {myComplaints.slice(0, 3).map(c => (
                <div key={c.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-50">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{c.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Ref: #{c.id.slice(0, 8)}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <StatusBadge status={c.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center py-10 text-slate-400 text-sm">No active complaints</div>
          )}
        </div>
      </div>
    </div>
  );
};

/* --- ADMIN VIEWS --- */

const AdminOverview: React.FC<{ setTab: (t: string) => void }> = ({ setTab }) => {
  const { complaints, residents, visitors, handleSolveComplaint } = useApp();
  const activeComplaints = complaints.filter(c => c.status !== ComplaintStatus.RESOLVED);
  const urgentComplaints = activeComplaints.filter(c => c.priority === ComplaintPriority.URGENT || c.priority === ComplaintPriority.HIGH);
  const visitorsToday = visitors.filter(v => new Date(v.entryTime).toDateString() === new Date().toDateString()).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Pending Issues" value={activeComplaints.length} icon="🔥" color="bg-rose-50 text-rose-600" trend={{ value: 12, isUp: true }} />
        <StatCard label="Total Residents" value={residents.length} icon="👥" color="bg-indigo-50 text-indigo-600" />
        <StatCard label="Visitors Today" value={visitorsToday} icon="🛡" color="bg-emerald-50 text-emerald-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">Urgent Attention Needed</h3>
                <button onClick={() => setTab('complaints')} className="text-indigo-600 font-semibold text-sm hover:underline">Manage All</button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-50">
                            <th className="pb-3 pl-2">Issue</th>
                            <th className="pb-3">Unit</th>
                            <th className="pb-3">Priority</th>
                            <th className="pb-3 text-right pr-2">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {urgentComplaints.slice(0, 5).map(c => (
                            <tr key={c.id} className="group hover:bg-slate-50/50">
                                <td className="py-3 pl-2">
                                    <div className="font-bold text-slate-800 text-sm">{c.title}</div>
                                    <div className="text-xs text-slate-500">{c.category}</div>
                                </td>
                                <td className="py-3 text-sm text-slate-600">{c.unitNumber}</td>
                                <td className="py-3"><PriorityBadge priority={c.priority} /></td>
                                <td className="py-3 text-right pr-2">
                                    <button 
                                        onClick={() => handleSolveComplaint(c.id)}
                                        className="text-xs bg-white border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 px-3 py-1.5 rounded-lg font-bold transition-all shadow-sm"
                                    >
                                        Resolve
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {urgentComplaints.length === 0 && (
                            <tr><td colSpan={4} className="py-8 text-center text-slate-400 text-sm">No urgent issues pending!</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center">
             <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-3xl mb-4">📢</div>
             <h3 className="font-bold text-slate-800 mb-2">Broadcast Notice</h3>
             <p className="text-sm text-slate-500 mb-6">Post announcements to all residents instantly.</p>
             <button onClick={() => setTab('notices')} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors">Create Notice</button>
        </div>
      </div>
    </div>
  );
};

/* --- SHARED SECTIONS --- */

const ComplaintsSection: React.FC = () => {
    const { complaints, user, addComplaint, handleSolveComplaint } = useApp();
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', category: 'General', priority: ComplaintPriority.MEDIUM });

    const isAdmin = user?.role === UserRole.ADMIN;
    const filteredComplaints = isAdmin ? complaints : complaints.filter(c => c.userId === user?.id);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addComplaint(formData);
        setShowForm(false);
        setFormData({ title: '', description: '', category: 'General', priority: ComplaintPriority.MEDIUM });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Complaints & Issues</h2>
                    <p className="text-slate-500">Track and manage community maintenance requests.</p>
                </div>
                {!isAdmin && (
                    <button 
                        onClick={() => setShowForm(!showForm)} 
                        className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                    >
                        {showForm ? 'Cancel' : '+ New Ticket'}
                    </button>
                )}
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-xl mb-8 animate-in zoom-in-95 duration-200">
                    <h3 className="font-bold text-lg mb-4">New Maintenance Request</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-1">Issue Title</label>
                            <input 
                                required
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                                placeholder="e.g. Leaking Tap in Kitchen"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                            <textarea 
                                required
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-24" 
                                placeholder="Describe the issue in detail..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                            <select 
                                value={formData.category}
                                onChange={e => setFormData({...formData, category: e.target.value})}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option>General</option>
                                <option>Plumbing</option>
                                <option>Electrical</option>
                                <option>Security</option>
                                <option>Cleaning</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Priority</label>
                            <select 
                                value={formData.priority}
                                onChange={e => setFormData({...formData, priority: e.target.value as ComplaintPriority})}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value={ComplaintPriority.LOW}>Low</option>
                                <option value={ComplaintPriority.MEDIUM}>Medium</option>
                                <option value={ComplaintPriority.HIGH}>High</option>
                                <option value={ComplaintPriority.URGENT}>Urgent</option>
                            </select>
                        </div>
                        <div className="md:col-span-2 text-right mt-2">
                            <button type="submit" className="bg-slate-900 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-colors">
                                Submit Ticket
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                                <th className="p-4">Status</th>
                                <th className="p-4">Issue Details</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Raised By</th>
                                <th className="p-4">Date</th>
                                {isAdmin && <th className="p-4 text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredComplaints.map(c => (
                                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4"><StatusBadge status={c.status} /></td>
                                    <td className="p-4 max-w-xs">
                                        <div className="font-bold text-slate-800">{c.title}</div>
                                        <div className="text-sm text-slate-500 truncate">{c.description}</div>
                                        <div className="mt-1"><PriorityBadge priority={c.priority} /></div>
                                    </td>
                                    <td className="p-4 text-sm text-slate-600">{c.category}</td>
                                    <td className="p-4 text-sm text-slate-600">
                                        <div className="font-bold">{c.userName}</div>
                                        <div className="text-xs text-slate-400">{c.unitNumber}</div>
                                    </td>
                                    <td className="p-4 text-sm text-slate-500">
                                        {new Date(c.createdAt).toLocaleDateString()}
                                    </td>
                                    {isAdmin && (
                                        <td className="p-4 text-right">
                                            {c.status !== ComplaintStatus.RESOLVED && (
                                                <button 
                                                    onClick={() => handleSolveComplaint(c.id)}
                                                    className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                                                >
                                                    Mark Resolved
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {filteredComplaints.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-slate-400">No complaints found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const NoticesSection: React.FC = () => {
    const { notices, user, addNotice, deleteNotice } = useApp();
    const isAdmin = user?.role === UserRole.ADMIN;
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ title: '', content: '', category: 'General' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addNotice(formData as any);
        setShowForm(false);
        setFormData({ title: '', content: '', category: 'General' });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
             <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Notice Board</h2>
                    <p className="text-slate-500">Important announcements and community news.</p>
                </div>
                {isAdmin && (
                    <button 
                        onClick={() => setShowForm(!showForm)} 
                        className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                    >
                        {showForm ? 'Cancel' : '+ New Notice'}
                    </button>
                )}
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-xl mb-8 animate-in zoom-in-95 duration-200">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Title</label>
                            <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Content</label>
                            <textarea required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-24" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                                <option>General</option>
                                <option>Urgent</option>
                                <option>Event</option>
                                <option>Maintenance</option>
                            </select>
                        </div>
                        <button className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold">Post Notice</button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {notices.map(n => (
                    <div key={n.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                                n.category === 'Urgent' ? 'bg-rose-100 text-rose-600' : 
                                n.category === 'Event' ? 'bg-purple-100 text-purple-600' : 'bg-blue-50 text-blue-600'
                            }`}>{n.category}</span>
                            {isAdmin && <button onClick={() => deleteNotice(n.id)} className="text-slate-300 hover:text-rose-500">🗑</button>}
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">{n.title}</h3>
                        <p className="text-slate-600 text-sm leading-relaxed mb-4">{n.content}</p>
                        <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-50 pt-4">
                            <span>Posted by {n.postedBy}</span>
                            <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

/* =========================================================================
   MAIN DASHBOARD COMPONENT
   ========================================================================= */

export const Dashboard: React.FC = () => {
  const { user, residents, payments, payBill } = useApp();
  // Initialize tab based on role
  const [activeTab, setActiveTab] = useState(user?.role === UserRole.ADMIN ? 'overview' : 'dashboard');

  const renderContent = () => {
    switch(activeTab) {
      case 'overview':
      case 'dashboard':
        return user?.role === UserRole.ADMIN 
          ? <AdminOverview setTab={setActiveTab} /> 
          : <ResidentOverview setTab={setActiveTab} />;
      
      case 'complaints':
        return <ComplaintsSection />;
      
      case 'notices':
        return <NoticesSection />;

      case 'residents':
        return (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in">
             <div className="p-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-800">Resident Directory</h2>
             </div>
             <table className="w-full text-left">
                <thead className="bg-slate-50"><tr className="text-xs uppercase text-slate-500 font-bold"><th className="p-4">Name</th><th className="p-4">Unit</th><th className="p-4">Contact</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                    {residents.map(r => (
                        <tr key={r.id}>
                            <td className="p-4 font-bold text-slate-700">{r.name}</td>
                            <td className="p-4 text-slate-600">{r.unitNumber}</td>
                            <td className="p-4 text-slate-500">{r.email}</td>
                        </tr>
                    ))}
                </tbody>
             </table>
          </div>
        );

      case 'payments':
      case 'dues':
        return (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in">
             <div className="p-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-800">{user?.role === 'ADMIN' ? 'All Payments' : 'My Due Payments'}</h2>
             </div>
             <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead className="bg-slate-50"><tr className="text-xs uppercase text-slate-500 font-bold"><th className="p-4">Month</th><th className="p-4">Amount</th><th className="p-4">Unit</th><th className="p-4">Status</th><th className="p-4 text-right">Action</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                    {(user?.role === 'ADMIN' ? payments : payments.filter(p => p.userId === user?.id)).map(p => (
                        <tr key={p.id}>
                            <td className="p-4 font-medium text-slate-700">{p.month}</td>
                            <td className="p-4 font-bold text-slate-800">${p.amount}</td>
                            <td className="p-4 text-slate-500">{p.unitNumber}</td>
                            <td className="p-4"><StatusBadge status={p.status} /></td>
                            <td className="p-4 text-right">
                                {p.status !== 'PAID' && (
                                    <button onClick={() => payBill(p.id)} className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700">
                                        {user?.role === 'ADMIN' ? 'Mark Paid' : 'Pay Now'}
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
             </table>
             </div>
          </div>
        );

        case 'profile':
            return (
                <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center animate-in fade-in">
                    <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-4xl font-bold mx-auto mb-4">
                        {user?.name.charAt(0)}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">{user?.name}</h2>
                    <p className="text-slate-500 mb-6">{user?.role} • {user?.unitNumber}</p>
                    <div className="grid grid-cols-2 gap-4 text-left bg-slate-50 p-6 rounded-xl">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase">Email</label>
                            <p className="font-medium text-slate-700">{user?.email}</p>
                        </div>
                         <div>
                            <label className="text-xs font-bold text-slate-400 uppercase">Unit</label>
                            <p className="font-medium text-slate-700">{user?.unitNumber}</p>
                        </div>
                    </div>
                </div>
            );

      default:
        return <div className="p-10 text-center text-slate-400">Coming Soon</div>;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} setTab={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  );
};
