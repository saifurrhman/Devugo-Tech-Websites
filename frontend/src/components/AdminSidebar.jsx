import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthAPI } from '../lib/api';

export default function AdminSidebar() {
  const [open, setOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const toggle = () => setOpen(v => !v);
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem('adminTheme') || 'admin-dark');

  useEffect(() => {
    document.body.classList.remove('admin-light', 'admin-dark');
    document.body.classList.add(theme);
    localStorage.setItem('adminTheme', theme);
  }, [theme]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 920px)');
    const apply = () => {
      const mobile = mq.matches;
      setIsMobile(mobile);
      setOpen(!mobile);
    };
    apply();
    
    const handleMediaChange = (e) => apply();
    if (mq.addEventListener) {
      mq.addEventListener('change', handleMediaChange);
    } else if (mq.addListener) {
      mq.addListener(handleMediaChange);
    }
    
    const onToggle = () => setOpen(v => !v);
    window.addEventListener('toggle-admin-sidebar', onToggle);
    
    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener('change', handleMediaChange);
      } else if (mq.removeListener) {
        mq.removeListener(handleMediaChange);
      }
      window.removeEventListener('toggle-admin-sidebar', onToggle);
    };
  }, []);

  async function handleLogout() {
    try { await AuthAPI.logout(); } catch (_e) {}
    try { localStorage.removeItem('adminUser'); localStorage.removeItem('adminToken'); } catch (_e) {}
    navigate('/admin/login');
  }

  return (
    <>
      {isMobile && open && <div className="admin-backdrop" onClick={() => setOpen(false)} aria-hidden="true"></div>}
      <aside className={`admin-sidebar ${open ? 'open' : 'collapsed'}`} aria-label="Admin sidebar navigation">
        <div className="admin-sidebar__header">
          <NavLink to="/admin" className="brand" aria-label="Go to Admin dashboard" title="Devugo Tech">
            <img className="brand-logo" src="/Devugo Tech.png" alt="Devugo Tech Logo" />
            <div className="brand-text">
              <span>Devugo</span>
              <small className="sub">Tech Solutions</small>
            </div>
          </NavLink>
          <div style={{ display: 'flex', gap: '.35rem' }}>
            <button className="admin-sidebar__toggle" onClick={toggle} aria-expanded={open} aria-label="Toggle sidebar" style={{ fontSize: '24px', padding: '4px 8px' }}>≡</button>
          </div>
        </div>

        <nav className="admin-sidebar__nav">
          <NavLink to="/admin" end className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
            <span className="icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </span>
            <span className="label">Dashboard</span>
          </NavLink>

          <NavLink to="/admin/services" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
            <span className="icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </span>
            <span className="label">Services</span>
          </NavLink>

          <NavLink to="/admin/pricing" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
            <span className="icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="2"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </span>
            <span className="label">Pricing</span>
          </NavLink>

          <NavLink to="/admin/portfolio" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
            <span className="icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </span>
            <span className="label">Portfolio</span>
          </NavLink>

          <NavLink to="/admin/reviews" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
            <span className="icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </span>
            <span className="label">Reviews</span>
          </NavLink>

          <NavLink to="/admin/faqs" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
            <span className="icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="2"/>
                <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2.5"/>
              </svg>
            </span>
            <span className="label">FAQs</span>
          </NavLink>

          <NavLink to="/admin/forms" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
            <span className="icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="currentColor" strokeWidth="2"/>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke="currentColor" strokeWidth="2"/>
                <path d="M9 12h6M9 16h6" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </span>
            <span className="label">Forms</span>
          </NavLink>

          <NavLink to="/admin/social-links" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
            <span className="icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2"/>
                <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="currentColor" strokeWidth="2"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </span>
            <span className="label">Social Links</span>
          </NavLink>

          <NavLink to="/admin/blog" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
            <span className="icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34" stroke="currentColor" strokeWidth="2"/>
                <polygon points="18 2 22 6 12 16 8 16 8 12 18 2" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </span>
            <span className="label">Blog</span>
          </NavLink>
          
          <NavLink to="/admin/team" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
            <span className="icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </span>
            <span className="label">Team</span>
          </NavLink>

          <NavLink to="/admin/contacts" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
            <span className="icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </span>
            <span className="label">Contacts</span>
          </NavLink>

          {/* 🔥 EMAIL MARKETING SECTION 🔥 */}
          <div className="nav-divider">
            <span className="nav-divider__label">Email Marketing</span>
          </div>

          <NavLink to="/admin/campaigns" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
            <span className="icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2"/>
                <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </span>
            <span className="label">Campaigns</span>
            <span className="badge badge--new">New</span>
          </NavLink>

          <NavLink to="/admin/recipients" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
            <span className="icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </span>
            <span className="label">Recipients</span>
          </NavLink>

          <NavLink to="/admin/inbox" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
            <span className="icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" stroke="currentColor" strokeWidth="2"/>
                <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </span>
            <span className="label">Inbox</span>
          </NavLink>

          <NavLink to="/admin/templates" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
            <span className="icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
                <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2"/>
                <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/>
                <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/>
                <polyline points="10 9 9 9 8 9" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </span>
            <span className="label">Templates</span>
          </NavLink>

          <NavLink to="/admin/email-analytics" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
            <span className="icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" stroke="currentColor" strokeWidth="2"/>
                <line x1="12" y1="20" x2="12" y2="4" stroke="currentColor" strokeWidth="2"/>
                <line x1="6" y1="20" x2="6" y2="14" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </span>
            <span className="label">Email Analytics</span>
          </NavLink>

          {/* 🔥 CRM & PROJECTS SECTION 🔥 */}
          <div className="nav-divider">
            <span className="nav-divider__label">CRM & Projects</span>
          </div>

          <NavLink to="/admin/pipeline" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
            <span className="icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="20" x2="12" y2="10" stroke="currentColor" strokeWidth="2"/>
                <line x1="18" y1="20" x2="18" y2="4" stroke="currentColor" strokeWidth="2"/>
                <line x1="6" y1="20" x2="6" y2="16" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </span>
            <span className="label">Pipeline</span>
            <span className="badge badge--new">New</span>
          </NavLink>

          <NavLink to="/admin/projects" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
            <span className="icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2"/>
                <line x1="12" y1="11" x2="12" y2="17" stroke="currentColor" strokeWidth="2"/>
                <line x1="9" y1="14" x2="15" y2="14" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </span>
            <span className="label">Projects</span>
            <span className="badge badge--new">New</span>
          </NavLink>

          <NavLink to="/admin/invoices" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
            <span className="icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
                <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2"/>
                <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/>
                <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </span>
            <span className="label">Invoices</span>
            <span className="badge badge--new">New</span>
          </NavLink>

          <NavLink to="/admin/meetings" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
            <span className="icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </span>
            <span className="label">Meetings</span>
            <span className="badge badge--new">New</span>
          </NavLink>

          {/* DIVIDER BEFORE ANALYTICS */}
          <div className="nav-divider"></div>

          <NavLink to="/admin/analytics" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
            <span className="icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83" stroke="currentColor" strokeWidth="2"/>
                <path d="M22 12A10 10 0 0 0 12 2v10z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </span>
            <span className="label">Analytics</span>
          </NavLink>

          <NavLink to="/admin/settings" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
            <span className="icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 1v6m0 6v6M1 12h6m6 0h6" stroke="currentColor" strokeWidth="2"/>
                <path d="m4.93 4.93 4.24 4.24m5.66 0 4.24-4.24M4.93 19.07l4.24-4.24m5.66 0 4.24 4.24" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </span>
            <span className="label">Settings</span>
          </NavLink>
        </nav>

        <div className="admin-sidebar__footer">
          <button className="sidebar-action" onClick={() => navigate('/admin/profile')}>
            <span className="icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </span>
            <span className="label">Manage profile</span>
          </button>
          <button className="sidebar-action danger" onClick={handleLogout}>
            <span className="icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2"/>
                <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2"/>
                <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </span>
            <span className="label">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}