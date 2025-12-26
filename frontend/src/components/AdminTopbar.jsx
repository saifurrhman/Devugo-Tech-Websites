import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthAPI } from '../lib/api';
import { ChevronDown, Mail, Check } from 'lucide-react';

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
    }
    function onKey(e) { if (e.key === 'Escape') { setMenuOpen(false); setSenderOpen(false); } }
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
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
              <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
          <input className="admin-search__input" placeholder="Search..." />
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
          <button className="icon-btn" title="System" aria-label="System">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7z" stroke="currentColor" strokeWidth="1.6" />
              <path d="M4 12h2.2M17.8 12H20M12 20v-2.2M12 6.2V4M6.7 6.7l1.6 1.6M15.7 15.7l1.6 1.6M6.7 17.3l1.6-1.6M15.7 8.3l1.6-1.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
          <button className="icon-btn" title="Notifications" aria-label="Notifications">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9a6 6 0 1 1 12 0v4.2l1.3 2.6c.2.41-.09.9-.54.9H5.24c-.45 0-.74-.49-.54-.9L6 13.2V9z" stroke="currentColor" strokeWidth="1.6" />
              <path d="M9.5 18a2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
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
