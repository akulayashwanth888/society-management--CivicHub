
import React, { useState, useMemo } from 'react';
import { useApp } from '../AppContext';
import { UserRole, ComplaintStatus, PaymentStatus, ComplaintPriority, Notice, Visitor, Complaint } from '../types';
import { StatCard } from '../components/StatCard';
import { DashboardLayout } from '../components/Layout';

const ResidentOverview: React.FC = () => {
  const { complaints, notices, payments, user } = useApp();
  const myComplaints = complaints.filter(c => c.userId === user?.id);
  const myPendingDues = payments.filter(p => p.userId === user?.id && p.status !== PaymentStatus.PAID);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Pending Dues" value={`$${myPendingDues.reduce((acc, p) => acc + p.amount, 0)}`} icon="💳" color="bg-rose-50 text-rose-600" />
        <StatCard label="Active Complaints" value={myComplaints.filter(c => c.status !== ComplaintStatus.RESOLVED).length} icon="🛠" color="bg-amber-50 text-amber-600" />
        <StatCard label="Recent Notices" value={notices.length} icon="📢" color="bg-indigo-50 text-indigo-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Latest Notices</h3>
            <button className="text-indigo-600 font-semibold text-sm">View All</button>
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
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold">New Complaint</button>
          </div>
          {myComplaints.length > 0 ? (
            <div className="space-y-4">
              {myComplaints.map(c => (
                <div key={c.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-50">
                  <div>
                    <h4 className="font-bold text-slate-800">{c.title}</h4>
                    <p className="text-xs text-slate-400">Ref: #{c.id.slice(0, 8)}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      c.status === ComplaintStatus.OPEN ? 'bg-rose-50 text-rose-600' : 
                      c.status === ComplaintStatus.IN_PROGRESS ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {c.status === ComplaintStatus.OPEN ? 'PENDING' : 
                       c.status === ComplaintStatus.RESOLVED ? 'SOLVED' : 
                       'IN PROGRESS'}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">✨</div>
              <p className="text-slate-500 font-medium">No active complaints found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminOverview: React.FC = () => {
  const { complaints, notices, residents, visitors, updateComplaintStatus } = useApp();
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Residents" value={residents.length} icon="👥" color="bg-blue-50 text-blue-600" trend={{ value: 12, isUp: true }} />
        <StatCard label="Open Complaints" value={complaints.filter(c => c.status === ComplaintStatus.OPEN).length} icon="🛠" color="bg-rose-50 text-rose-600" />
        <StatCard label="Active Visitors" value={visitors.filter(v => v.status === 'IN').length} icon="🛡" color="bg-amber-50 text-amber-600" />
        <StatCard label="Total Dues" value="$12,450" icon="💰" color="bg-emerald-50 text-emerald-600" trend={{ value: 5, isUp: true }} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">Recent Complaints</h3>
          <button className="text-indigo-600 font-bold text-sm">Manage All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Flat / Bldg</th>
                <th className="px-6 py-4">Resident</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {complaints.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="inline-block bg-slate-100 text-slate-700 font-bold px-3 py-1.5 rounded-lg border border-slate-200">
                        {c.unitNumber || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] text-indigo-700 font-bold mr-2">
                            {c.userName ? c.userName.charAt(0) : '?'}
                        </div>
                        <span className="font-bold text-slate-800">{c.userName || 'Unknown'}</span>
                     </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{c.title}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                      c.priority === ComplaintPriority.HIGH ? 'bg-red-50 text-red-600' : 
                      c.priority === ComplaintPriority.MEDIUM ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {c.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      c.status === ComplaintStatus.OPEN ? 'bg-rose-50 text-rose-600' : 
                      c.status === ComplaintStatus.IN_PROGRESS ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {c.status === ComplaintStatus.OPEN ? 'PENDING' : 
                       c.status === ComplaintStatus.RESOLVED ? 'SOLVED' : 
                       'IN PROGRESS'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {c.status !== ComplaintStatus.RESOLVED && (
                        <div className="flex space-x-2">
                           <button 
                               onClick={() => updateComplaintStatus(c.id, ComplaintStatus.IN_PROGRESS)}
                               className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100" title="Mark In Progress"
                           >
                               ⏳
                           </button>
                           <button 
                               onClick={() => updateComplaintStatus(c.id, ComplaintStatus.RESOLVED)}
                               className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100" title="Mark Resolved"
                           >
                               ✅
                           </button>
                        </div>
                    )}
                    {c.status === ComplaintStatus.RESOLVED && (
                        <span className="text-xs font-bold text-emerald-600">✓ Solved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ProfileView: React.FC = () => {
  const { user, complaints } = useApp();
  const myComplaintHistory = complaints.filter(c => c.userId === user?.id);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>
        <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8 relative z-10">
          <div className="w-32 h-32 rounded-[2rem] border-4 border-white shadow-xl bg-indigo-100 flex items-center justify-center text-4xl text-indigo-600 font-bold">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div className="text-center md:text-left flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-3 mb-2">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{user?.name}</h2>
              <span className="inline-block px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full self-center">
                {user?.role}
              </span>
            </div>
            <p className="text-slate-500 font-medium mb-4">{user?.email}</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Status</p>
                <p className="text-lg font-bold text-emerald-600">Active</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                 <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Address</p>
                 <p className="text-lg font-bold text-slate-800">{user?.unitNumber || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Complaint History</h3>
            <p className="text-sm text-slate-500 font-medium">Detailed log of all your past service requests</p>
          </div>
          <div className="flex space-x-2">
            <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">
              Total: {myComplaintHistory.length}
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          {myComplaintHistory.length > 0 ? (
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-5">Complaint Details</th>
                  <th className="px-8 py-5">Category</th>
                  <th className="px-8 py-5">Priority</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Timelines</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myComplaintHistory.map(c => (
                  <tr key={c.id} className="hover:bg-indigo-50/10 transition-colors">
                    <td className="px-8 py-6">
                      <p className="font-bold text-slate-800 mb-1">{c.title}</p>
                      <p className="text-xs text-slate-500 line-clamp-1 max-w-xs">{c.description}</p>
                      <p className="text-[10px] text-indigo-600 font-bold mt-1">Unit: {c.unitNumber}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                        {c.category}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                        c.priority === ComplaintPriority.HIGH || c.priority === ComplaintPriority.URGENT ? 'text-rose-600' : 
                        c.priority === ComplaintPriority.MEDIUM ? 'text-amber-600' : 'text-blue-600'
                      }`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center w-fit ${
                        c.status === ComplaintStatus.OPEN ? 'bg-rose-50 text-rose-600' : 
                        c.status === ComplaintStatus.IN_PROGRESS ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                          c.status === ComplaintStatus.OPEN ? 'bg-rose-600' : 
                          c.status === ComplaintStatus.IN_PROGRESS ? 'bg-amber-600' : 'bg-emerald-600'
                        }`}></span>
                        {c.status === ComplaintStatus.OPEN ? 'PENDING' : 
                         c.status === ComplaintStatus.RESOLVED ? 'SOLVED' : 
                         'IN PROGRESS'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <p className="text-xs font-bold text-slate-400">
                        Filed: {new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                      {c.resolvedAt && (
                         <p className="text-xs font-bold text-emerald-600 mt-1">
                            Resolved: {new Date(c.resolvedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                         </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-24">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl opacity-50">📋</div>
              <h4 className="text-slate-900 font-bold text-lg mb-2">No complaints yet</h4>
              <p className="text-slate-500 max-w-xs mx-auto text-sm">You haven't filed any service requests. Your future history will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ComplaintForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { addComplaint, user } = useApp();
    // Pre-fill unit number if available in user profile
    const [formData, setFormData] = useState({ 
        title: '', 
        category: 'General', 
        priority: ComplaintPriority.MEDIUM, 
        description: '',
        unitNumber: user?.unitNumber || '' 
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addComplaint(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">Raise New Complaint</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Subject / Title</label>
                            <input 
                                required
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" 
                                placeholder="E.g. Leaking faucet"
                            />
                        </div>
                        
                        <div className="col-span-2">
                             <label className="block text-sm font-bold text-slate-700 mb-2">Flat / Building Number <span className="text-red-500">*</span></label>
                             <input 
                                 required
                                 value={formData.unitNumber}
                                 onChange={e => setFormData({ ...formData, unitNumber: e.target.value })}
                                 className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" 
                                 placeholder="E.g. B-404"
                             />
                             <p className="text-xs text-slate-400 mt-1">Required for maintenance team to locate you.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                            <select 
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option>General</option>
                                <option>Plumbing</option>
                                <option>Electrical</option>
                                <option>Security</option>
                                <option>Janitorial</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Priority</label>
                            <select 
                                value={formData.priority}
                                onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value={ComplaintPriority.LOW}>Low</option>
                                <option value={ComplaintPriority.MEDIUM}>Medium</option>
                                <option value={ComplaintPriority.HIGH}>High</option>
                                <option value={ComplaintPriority.URGENT}>Urgent</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                            <textarea 
                                rows={4}
                                required
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Please describe the issue in detail..."
                            ></textarea>
                        </div>
                    </div>
                    <div className="flex space-x-4">
                        <button type="button" onClick={onClose} className="flex-1 py-3 border-2 border-slate-100 rounded-xl font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                        <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">Submit Request</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ComplaintManager: React.FC = () => {
    const { complaints, user, updateComplaintStatus } = useApp();
    const [showModal, setShowModal] = useState(false);
    const isAdmin = user?.role === UserRole.ADMIN;
    
    const displayComplaints = isAdmin ? complaints : complaints.filter(c => c.userId === user?.id);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Support Tickets</h2>
                    <p className="text-slate-500">Manage maintenance requests and issues</p>
                </div>
                {!isAdmin && (
                    <button 
                        onClick={() => setShowModal(true)}
                        className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                    >
                        Raise Complaint
                    </button>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Flat / Bldg</th>
                                <th className="px-6 py-4">Resident</th>
                                <th className="px-6 py-4">Subject</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Timeline</th>
                                {isAdmin && <th className="px-6 py-4">Action</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {displayComplaints.map(c => (
                                <tr key={c.id}>
                                    <td className="px-6 py-4">
                                        <span className="inline-block bg-slate-100 text-slate-700 font-bold px-3 py-1.5 rounded-lg border border-slate-200">
                                            {c.unitNumber || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                       <div className="flex items-center">
                                          <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-[10px] text-indigo-700 font-bold mr-2">
                                              {c.userName ? c.userName.charAt(0) : '?'}
                                          </div>
                                          <span className="font-bold text-slate-800 text-sm">{c.userName || 'Unknown'}</span>
                                       </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-slate-800">{c.title}</p>
                                        <p className="text-xs text-slate-400 truncate max-w-xs">{c.description}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                            c.status === ComplaintStatus.OPEN ? 'bg-rose-50 text-rose-600' : 
                                            c.status === ComplaintStatus.IN_PROGRESS ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                                        }`}>
                                            {c.status === ComplaintStatus.OPEN ? 'PENDING' : 
                                             c.status === ComplaintStatus.RESOLVED ? 'SOLVED' : 
                                             'IN PROGRESS'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-400">
                                        <div className="flex flex-col space-y-1">
                                            <div className="flex items-center space-x-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                                <span className="text-xs text-slate-500 font-medium">Raised:</span>
                                                <span className="text-xs font-bold text-slate-700">{new Date(c.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            {c.resolvedAt ? (
                                                <div className="flex items-center space-x-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                    <span className="text-xs text-slate-500 font-medium">Resolved:</span>
                                                    <span className="text-xs font-bold text-emerald-600">{new Date(c.resolvedAt).toLocaleDateString()}</span>
                                                </div>
                                            ) : (
                                                 <div className="flex items-center space-x-2 opacity-50">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                                                    <span className="text-xs text-slate-400 italic">Resolution pending</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    {isAdmin && (
                                        <td className="px-6 py-4">
                                            {c.status !== ComplaintStatus.RESOLVED ? (
                                                <div className="flex space-x-2">
                                                    <button 
                                                        onClick={() => updateComplaintStatus(c.id, ComplaintStatus.IN_PROGRESS)}
                                                        className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100" title="Mark In Progress"
                                                    >
                                                        ⏳
                                                    </button>
                                                    <button 
                                                        onClick={() => updateComplaintStatus(c.id, ComplaintStatus.RESOLVED)}
                                                        className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100" title="Resolve"
                                                    >
                                                        ✅
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-emerald-600 font-bold text-xs">✓ Solved</span>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && <ComplaintForm onClose={() => setShowModal(false)} />}
        </div>
    );
};

const NoticeManager: React.FC = () => {
    const { notices, user, addNotice, deleteNotice } = useApp();
    const isAdmin = user?.role === UserRole.ADMIN;
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<{
        title: string;
        category: 'General' | 'Urgent' | 'Event' | 'Maintenance';
        content: string;
    }>({ title: '', category: 'General', content: '' });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Notice Board</h2>
                    <p className="text-slate-500">Keep up to date with society news</p>
                </div>
                {isAdmin && (
                    <button 
                        onClick={() => setShowForm(true)}
                        className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700"
                    >
                        Post Notice
                    </button>
                )}
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-2xl border-2 border-indigo-100 shadow-lg animate-in slide-in-from-top duration-300">
                    <h3 className="text-lg font-bold mb-4">Post New Announcement</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <input 
                            placeholder="Notice Title"
                            className="px-4 py-2 bg-slate-50 border rounded-xl"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                        <select 
                            className="px-4 py-2 bg-slate-50 border rounded-xl"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                        >
                            <option value="General">General</option>
                            <option value="Urgent">Urgent</option>
                            <option value="Event">Event</option>
                            <option value="Maintenance">Maintenance</option>
                        </select>
                        <textarea 
                            placeholder="Announcement content..."
                            className="col-span-2 px-4 py-2 bg-slate-50 border rounded-xl h-24"
                            value={formData.content}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                        ></textarea>
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button onClick={() => setShowForm(false)} className="px-4 py-2 font-bold text-slate-500">Cancel</button>
                        <button 
                            onClick={() => {
                                addNotice(formData);
                                setShowForm(false);
                                setFormData({ title: '', category: 'General', content: '' });
                            }}
                            className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl"
                        >
                            Post Now
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {notices.map(n => (
                    <div key={n.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative">
                        {isAdmin && (
                            <button 
                                onClick={() => deleteNotice(n.id)}
                                className="absolute top-4 right-4 text-slate-300 hover:text-red-500"
                            >
                                🗑️
                            </button>
                        )}
                        <div className="flex items-center space-x-3 mb-4">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                n.category === 'Urgent' ? 'bg-red-50 text-red-600' : 
                                n.category === 'Event' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'
                            }`}>
                                {n.category}
                            </span>
                            <span className="text-xs text-slate-400">{new Date(n.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">{n.title}</h3>
                        <p className="text-slate-600 text-sm leading-relaxed mb-4">{n.content}</p>
                        <div className="flex items-center text-xs text-slate-400">
                            <span className="mr-1">By</span>
                            <span className="font-bold text-slate-600">{n.postedBy}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const VisitorForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { addVisitor, residents } = useApp();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        purpose: 'Guest',
        residentId: residents[0]?.id || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const resident = residents.find(r => r.id === formData.residentId);
        addVisitor({
            ...formData,
            residentName: resident?.name || 'Unknown',
            unitNumber: 'N/A' // Defaulted
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800">New Guest Entry</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Visitor Name</label>
                            <input 
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" 
                                placeholder="Full Name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                            <input 
                                required
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" 
                                placeholder="Contact Number"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Purpose</label>
                                <select 
                                    value={formData.purpose}
                                    onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option>Guest</option>
                                    <option>Delivery</option>
                                    <option>Maintenance</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Visiting Resident</label>
                                <select 
                                    value={formData.residentId}
                                    onChange={e => setFormData({ ...formData, residentId: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    {residents.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="flex space-x-4">
                        <button type="button" onClick={onClose} className="flex-1 py-3 border-2 border-slate-100 rounded-xl font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                        <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">Log Entry</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const VisitorManager: React.FC = () => {
    const { visitors, updateVisitorExit } = useApp();
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'IN' | 'OUT'>('ALL');

    const filteredVisitors = useMemo(() => {
        return visitors.filter(v => {
            const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'ALL' || v.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [visitors, searchTerm, filterStatus]);

    const stats = {
        total: visitors.length,
        currentlyIn: visitors.filter(v => v.status === 'IN').length,
        exited: visitors.filter(v => v.status === 'OUT').length
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Security Gate Log</h2>
                    <p className="text-slate-500 font-medium">Enterprise-grade visitor tracking and monitoring</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center space-x-2"
                >
                    <span className="text-xl">+</span>
                    <span>Log New Guest</span>
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Today</p>
                    <p className="text-3xl font-black text-slate-900">{stats.total}</p>
                </div>
                <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Currently Inside</p>
                    <p className="text-3xl font-black text-indigo-600">{stats.currentlyIn}</p>
                </div>
                <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Recently Exited</p>
                    <p className="text-3xl font-black text-slate-600">{stats.exited}</p>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                    <input 
                        type="text"
                        placeholder="Search by visitor name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
                    {(['ALL', 'IN', 'OUT'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`flex-1 md:w-24 py-2 px-4 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                                filterStatus === status 
                                    ? 'bg-white text-indigo-600 shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {status === 'ALL' ? 'Show All' : status === 'IN' ? 'Inside' : 'Exited'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Log Table */}
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                            <tr>
                                <th className="px-8 py-5">Visitor Profile</th>
                                <th className="px-8 py-5">Purpose</th>
                                <th className="px-8 py-5">Visiting Resident</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5">Log Timing</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredVisitors.map(v => (
                                <tr key={v.id} className="hover:bg-indigo-50/10 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 uppercase">
                                                {v.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{v.name}</p>
                                                <p className="text-xs text-slate-400 font-medium">{v.phone}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                                            v.purpose === 'Delivery' ? 'bg-amber-50 text-amber-600' : 
                                            v.purpose === 'Maintenance' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                                        }`}>
                                            {v.purpose}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{v.residentName}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center ${
                                            v.status === 'IN' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full mr-2 ${v.status === 'IN' ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'}`}></span>
                                            {v.status === 'IN' ? 'Currently In' : 'Logged Out'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center text-xs text-slate-600 font-bold">
                                                <span className="w-12 text-slate-400 uppercase text-[9px]">Entry:</span>
                                                {new Date(v.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            {v.exitTime && (
                                                <div className="flex items-center text-xs text-slate-400 font-bold">
                                                    <span className="w-12 text-slate-400 uppercase text-[9px]">Exit:</span>
                                                    {new Date(v.exitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        {v.status === 'IN' ? (
                                            <button 
                                                onClick={() => updateVisitorExit(v.id)}
                                                className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm"
                                            >
                                                Log Exit
                                            </button>
                                        ) : (
                                            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest italic">Session Ended</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredVisitors.length === 0 && (
                    <div className="text-center py-24 bg-slate-50/50">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-sm">🛡️</div>
                        <h4 className="text-slate-900 font-bold text-lg mb-2">No visitor logs found</h4>
                        <p className="text-slate-500 max-w-xs mx-auto text-sm font-medium">Try adjusting your search terms or filters to find specific records.</p>
                    </div>
                )}
            </div>

            {showModal && <VisitorForm onClose={() => setShowModal(false)} />}
        </div>
    );
};

const PaymentManager: React.FC = () => {
    const { payments, user, payBill } = useApp();
    const isAdmin = user?.role === UserRole.ADMIN;
    
    // Admin sees all, Resident sees only theirs
    const displayPayments = isAdmin ? payments : payments.filter(p => p.userId === user?.id);

    const stats = {
        collected: payments.filter(p => p.status === PaymentStatus.PAID).reduce((a, b) => a + b.amount, 0),
        pending: payments.filter(p => p.status !== PaymentStatus.PAID).reduce((a, b) => a + b.amount, 0)
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Billing & Payments</h2>
                    <p className="text-slate-500">Track monthly maintenance dues and invoices</p>
                </div>
                <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl font-bold border border-emerald-100 flex items-center">
                   <span className="text-xl mr-2">💰</span> 
                   <span>{isAdmin ? 'Total Collected' : 'Total Paid'}: ${isAdmin ? stats.collected : displayPayments.filter(p => p.status === PaymentStatus.PAID).reduce((a,b) => a+b.amount, 0)}</span>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Invoice For</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Due Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {displayPayments.map(p => (
                                <tr key={p.id}>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-slate-800">{p.month}</p>
                                        {isAdmin && <p className="text-xs text-slate-400">{p.userName}</p>}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-800">${p.amount}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(p.dueDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                            p.status === PaymentStatus.PAID ? 'bg-emerald-50 text-emerald-600' : 
                                            p.status === PaymentStatus.OVERDUE ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                                        }`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {p.status !== PaymentStatus.PAID && !isAdmin && (
                                            <button 
                                                onClick={() => payBill(p.id)}
                                                className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                                            >
                                                Pay Now
                                            </button>
                                        )}
                                        {p.status === PaymentStatus.PAID && (
                                            <span className="text-emerald-600 text-sm font-bold">✓ Paid</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {displayPayments.length === 0 && (
                    <div className="p-12 text-center text-slate-400">No payment records found.</div>
                )}
            </div>
        </div>
    );
};

export const Dashboard: React.FC = () => {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState(user?.role === UserRole.ADMIN ? 'overview' : 'dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
      case 'dashboard':
        return user?.role === UserRole.ADMIN ? <AdminOverview /> : <ResidentOverview />;
      case 'complaints':
        return <ComplaintManager />;
      case 'notices':
        return <NoticeManager />;
      case 'visitors':
        return <VisitorManager />;
      case 'residents':
        return <div className="text-center py-20 text-slate-500 font-medium">Resident Directory Management System - Coming Soon</div>;
      case 'payments':
      case 'dues':
        return <PaymentManager />;
      case 'profile':
        return <ProfileView />;
      default:
        return <div>Tab not found</div>;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} setTab={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  );
};
