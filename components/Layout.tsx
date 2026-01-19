import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../AppContext';
import { UserRole, Notification } from '../types';

interface SidebarItemProps {
  label: string;
  icon: string;
  active?: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ label, icon, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
        : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
    }`}
  >
    <span className="text-xl">{icon}</span>
    <span className="font-medium">{label}</span>
  </button>
);

const NotificationItem: React.FC<{ notification: Notification; onRead: (id: string) => void; setTab: (t: string) => void; close: () => void }> = ({ notification, onRead, setTab, close }) => {
  const getTypeIcon = () => {
    switch (notification.type) {
      case 'COMPLAINT': return '🛠';
      case 'NOTICE': return '📢';
      case 'PAYMENT': return '💳';
      case 'SECURITY': return '🛡';
      default: return '✨';
    }
  };

  return (
    <div 
      onClick={() => {
        onRead(notification.id);
        if (notification.targetTab) setTab(notification.targetTab);
        close();
      }}
      className={`p-4 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors ${!notification.isRead ? 'bg-indigo-50/30' : ''}`}
    >
      <div className="flex space-x-3">
        <div className="text-lg mt-0.5">{getTypeIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <p className={`text-sm ${!notification.isRead ? 'font-bold' : 'font-semibold'} text-slate-800`}>{notification.title}</p>
            {!notification.isRead && <div className="w-2 h-2 bg-indigo-600 rounded-full mt-1.5 ml-2 shrink-0"></div>}
          </div>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notification.message}</p>
          <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold tracking-wider">
            {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </div>
  );
};

const Sidebar: React.FC<{ activeTab: string; setTab: (t: string) => void; isOpen: boolean; close: () => void }> = ({ activeTab, setTab, isOpen, close }) => {
  const { user, logout } = useApp();
  const isAdmin = user?.role === UserRole.ADMIN;

  const adminTabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'complaints', label: 'Complaints', icon: '🛠' },
    { id: 'residents', label: 'Residents', icon: '👥' },
    { id: 'notices', label: 'Notices', icon: '📢' },
    { id: 'visitors', label: 'Visitors', icon: '🛡' },
    { id: 'payments', label: 'Payments', icon: '💳' },
    { id: 'profile', label: 'My Profile', icon: '👤' },
  ];

  const residentTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'complaints', label: 'My Complaints', icon: '🛠' },
    { id: 'notices', label: 'Notice Board', icon: '📢' },
    { id: 'dues', label: 'My Dues', icon: '💳' },
    { id: 'profile', label: 'My Profile', icon: '👤' },
  ];

  const tabs = isAdmin ? adminTabs : residentTabs;

  return (
    <>
      {/* Mobile Overlay - High Z-index to cover content */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-[90] md:hidden backdrop-blur-sm transition-opacity"
          onClick={close}
        ></div>
      )}

      {/* Sidebar Container - Highest Z-index to sit on top of everything */}
      <aside className={`fixed top-0 left-0 z-[100] w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 h-[100dvh] shadow-2xl md:shadow-none`}>
        {/* Header */}
        <div className="p-6 shrink-0 flex justify-between items-center bg-white">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">C</div>
            <span className="text-xl font-bold text-slate-800">CivicHub</span>
          </div>
          <button onClick={close} className="md:hidden text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
            ✕
          </button>
        </div>

        {/* Scrollable Navigation Area */}
        <nav className="flex-1 px-4 space-y-2 mt-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
          {tabs.map(tab => (
            <SidebarItem
              key={tab.id}
              label={tab.label}
              icon={tab.icon}
              active={activeTab === tab.id}
              onClick={() => {
                setTab(tab.id);
                if (window.innerWidth < 768) close();
              }}
            />
          ))}
        </nav>

        {/* Footer (Pinned to bottom) */}
        <div className="p-4 border-t border-slate-100 shrink-0 bg-white">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 uppercase tracking-tighter truncate">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors border border-transparent hover:border-red-100 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
            </svg>
            <span className="font-bold text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export const DashboardLayout: React.FC<{ children: React.ReactNode; activeTab: string; setTab: (t: string) => void }> = ({ children, activeTab, setTab }) => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, user } = useApp();
  const [showNotifs, setShowNotifs] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead && n.userId === user?.id).length;
  const myNotifications = notifications.filter(n => n.userId === user?.id);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 relative">
      <Sidebar 
        activeTab={activeTab} 
        setTab={setTab} 
        isOpen={sidebarOpen} 
        close={() => setSidebarOpen(false)} 
      />
      
      {/* Main Content Wrapper - Adjusted margins and widths for responsiveness */}
      <div className="md:ml-64 min-h-screen flex flex-col transition-all duration-300 w-full md:w-auto">
        {/* Header - Sticky with proper Z-index */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
              aria-label="Open Menu"
            >
              <span className="text-2xl">☰</span>
            </button>
            <h1 className="text-lg font-semibold text-slate-800 capitalize hidden sm:block">{activeTab}</h1>
            <span className="sm:hidden font-bold text-indigo-600 text-lg">CivicHub</span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setShowNotifs(!showNotifs)}
                className="p-2 text-slate-400 hover:text-slate-600 relative transition-colors rounded-full hover:bg-slate-50"
              >
                <span className="text-xl">🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-800">Notifications</h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllNotificationsAsRead}
                        className="text-xs text-indigo-600 font-bold hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto overscroll-contain">
                    {myNotifications.length > 0 ? (
                      myNotifications.map(n => (
                        <NotificationItem 
                          key={n.id} 
                          notification={n} 
                          onRead={markNotificationAsRead} 
                          setTab={setTab} 
                          close={() => setShowNotifs(false)} 
                        />
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <div className="text-3xl mb-2">🎈</div>
                        <p className="text-sm text-slate-500">All caught up!</p>
                      </div>
                    )}
                  </div>
                  {myNotifications.length > 0 && (
                    <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
                      <button className="text-xs font-bold text-slate-500 hover:text-indigo-600">View All Notifications</button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <button 
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-50" 
              onClick={() => setTab('profile')}
            >
              <span className="text-xl">👤</span>
            </button>
          </div>
        </header>
        
        {/* Main Content Area - constrained width */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden w-full max-w-7xl mx-auto">
            {children}
        </main>
      </div>
    </div>
  );
};
