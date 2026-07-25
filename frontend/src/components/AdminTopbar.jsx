import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthAPI, NotificationAPI } from '../lib/api';
import { ChevronDown, Mail, Check, Bell } from 'lucide-react';

const SENDERS = [
  { name: 'Info', email: 'info@devugo-tech.com', type: 'Neutral & Informative' },
  { name: 'Saif', email: 'saif@devugo-tech.com', type: 'Personal & Founder-style' },
  { name: 'Support', email: 'support@devugo-tech.com', type: 'Helpful & Reassuring' },
];

export default function AdminTopbar() {
  // Simple auth check: show avatar only if adminUser exists in localStorage
  let adminUser = null;
  try { adminUser = JSON.parse(localStorage.getItem('adminUser')); } catch (e) { adminUser = null; }
  const initials = adminUser?.name ? adminUser.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : '';
  const avatarUrl = adminUser?.avatar;

  // Theme state (admin-light | admin-dark)
  const [theme, setTheme] = useState(() => localStorage.getItem('adminTheme') || 'admin-light');

  // Sender State
  const [sender, setSender] = useState(SENDERS[0]);
  const [senderOpen, setSenderOpen] = useState(false);
  const senderRef = useRef(null);

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  async function fetchNotifications() {
    try {
      const data = await NotificationAPI.list({ limit: 10 });
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    }
  }

  async function handleNotificationClick(notif) {
    if (!notif.isRead) {
      try {
        await NotificationAPI.markRead(notif._id);
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(notifications.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
      } catch (e) {
        console.error(e);
      }
    }
    if (notif.link) {
      navigate(notif.link);
      setNotificationsOpen(false);
    }
  }

  async function markAllRead() {
    try {
      await NotificationAPI.markAllRead();
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    // Apply theme class to body
    document.body.classList.remove('admin-light', 'admin-dark');
    document.body.classList.add(theme);
    localStorage.setItem('adminTheme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'admin-light' ? 'admin-dark' : 'admin-light'));

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onDocClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (senderRef.current && !senderRef.current.contains(e.target)) {
        setSenderOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    }
    function onKey(e) { if (e.key === 'Escape') { setMenuOpen(false); setSenderOpen(false); setNotificationsOpen(false); } }
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  async function handleLogout() {
    try { await AuthAPI.logout(); } catch (_e) { }
    try { localStorage.removeItem('adminUser'); localStorage.removeItem('adminToken'); } catch (_e) { }
    navigate('/admin/login');
  }

  return (
    <div className="admin-topbar">
      <div className="admin-topbar__inner">
        <div className="admin-search">
          <span className="admin-search__icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <input 
            className="admin-search__input" 
            placeholder="Search..." 
          />
          <span className="absolute right-2 px-1.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-400 text-[10px] font-medium tracking-wider pointer-events-none hidden sm:block" style={{ top: '50%', transform: 'translateY(-50%)' }}>
            ⌘K
          </span>
        </div>

        <div className="admin-topbar__actions">



          {/* Mobile menu button to open/collapse sidebar */}
          <button
            className="icon-btn mobile-only"
            title="Menu"
            aria-label="Open sidebar"
            onClick={() => {
              const ev = new CustomEvent('toggle-admin-sidebar');
              window.dispatchEvent(ev);
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <button className="icon-btn" title={theme === 'admin-light' ? 'Switch to dark' : 'Switch to light'} aria-label="Toggle theme" onClick={toggleTheme}>
            {theme === 'admin-light' ? (
              // Moon icon
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12.2A8.5 8.5 0 1 1 11.8 3a7 7 0 1 0 9.2 9.2z" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            ) : (
              // Sun icon
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
                <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.4 1.4M17.6 17.6L19 19M19 5l-1.4 1.4M7.4 17.6L5 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            )}
          </button>

          <div className="relative" ref={notifRef}>
            <button 
              className="icon-btn relative" 
              title="Notifications" 
              aria-label="Notifications"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9a6 6 0 1 1 12 0v4.2l1.3 2.6c.2.41-.09.9-.54.9H5.24c-.45 0-.74-.49-.54-.9L6 13.2V9z" stroke="currentColor" strokeWidth="1.6" />
                <path d="M9.5 18a2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[var(--admin-surface-strong)]"></span>
              )}
            </button>

            {notificationsOpen && (
              <div className="admin-dropdown" style={{ right: 0, width: '320px', padding: 0 }} role="menu">
                <div className="admin-dropdown__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--admin-border)' }}>
                  <strong style={{ fontSize: '14px' }}>Notifications</strong>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} style={{ fontSize: '12px', color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                      Mark all read
                    </button>
                  )}
                </div>
                <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--admin-muted)', fontSize: '13px' }}>
                      No recent notifications.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif._id} 
                        onClick={() => handleNotificationClick(notif)}
                        style={{ 
                          padding: '12px 16px', 
                          borderBottom: '1px solid var(--admin-border)',
                          cursor: 'pointer',
                          background: notif.isRead ? 'transparent' : 'rgba(67, 133, 205, 0.05)',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--admin-surface-strong)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = notif.isRead ? 'transparent' : 'rgba(67, 133, 205, 0.05)'}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <strong style={{ fontSize: '13px', color: notif.isRead ? 'var(--admin-text)' : 'var(--color-primary)' }}>{notif.title}</strong>
                          <span style={{ fontSize: '11px', color: 'var(--admin-muted)' }}>
                            {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--admin-muted)', lineHeight: 1.4 }}>
                          {notif.message}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          {adminUser && (
            <div className="admin-avatar" ref={menuRef} onMouseEnter={() => setMenuOpen(true)}>
              <button className="admin-avatar-btn" title={adminUser.name || 'Profile'} aria-haspopup="menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(v => !v)} onKeyDown={(e) => { if (e.key === 'Escape') setMenuOpen(false); }}>
                <span className="avatar avatar--sm">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="avatar" />
                  ) : (
                    <div className="center" style={{ width: '100%', height: '100%', fontSize: 12, fontWeight: 700, color: '#061c39', background: '#fff' }}>{initials}</div>
                  )}
                </span>
                <span className="admin-avatar__label">{adminUser?.name || 'Admin'}</span>
                <span className={`caret ${menuOpen ? 'open' : ''}`} aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>
              {menuOpen && (
                <div className="admin-dropdown" role="menu">
                  <div className="admin-dropdown__header">
                    <strong>{adminUser.name || 'Admin'}</strong>
                    <span className="muted">{adminUser.email}</span>
                  </div>
                  <Link className="admin-dropdown__item" role="menuitem" to="/admin/profile" onClick={() => setMenuOpen(false)}>
                    <span>Manage profile</span>
                  </Link>
                  <button className="admin-dropdown__item danger" role="menuitem" onClick={handleLogout}>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
