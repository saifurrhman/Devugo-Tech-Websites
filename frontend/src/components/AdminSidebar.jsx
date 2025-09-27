import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthAPI } from '../lib/api';

export default function AdminSidebar() {
  const [open, setOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const toggle = () => setOpen(v => !v);
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem('adminTheme') || 'admin-dark');

  // Apply theme class to body (stay in sync with topbar)
  useEffect(()=>{
    document.body.classList.remove('admin-light', 'admin-dark');
    document.body.classList.add(theme);
    localStorage.setItem('adminTheme', theme);
  },[theme]);

  // Responsive: collapse on small screens by default
  useEffect(()=>{
    const mq = window.matchMedia('(max-width: 1024px)');
    const apply = () => {
      const mobile = mq.matches;
      setIsMobile(mobile);
      setOpen(!mobile); // open on desktop, collapsed on mobile
    };
    apply();
    mq.addEventListener?.('change', apply);
    const onToggle = () => setOpen(v => !v);
    window.addEventListener('toggle-admin-sidebar', onToggle);
    return () => {
      mq.removeEventListener?.('change', apply);
      window.removeEventListener('toggle-admin-sidebar', onToggle);
    };
  },[]);

  async function handleLogout(){
    try{ await AuthAPI.logout(); }catch(_e){}
    try{ localStorage.removeItem('adminUser'); localStorage.removeItem('adminToken'); }catch(_e){}
    navigate('/admin/login');
  }

  return (
    <>
    {isMobile && open && <div className="admin-backdrop" onClick={()=>setOpen(false)} aria-hidden="true"></div>}
    <aside className={`admin-sidebar ${open ? 'open' : 'collapsed'}`} aria-label="Admin sidebar navigation">
      <div className="admin-sidebar__header">
        <strong>Admin</strong>
        <div style={{display:'flex',gap:'.35rem'}}>
          {/* <button className="admin-sidebar__toggle" title={theme==='admin-light'?'Switch to dark':'Switch to light'} aria-label="Toggle theme" onClick={()=>setTheme(t=>t==='admin-light'?'admin-dark':'admin-light')}>
            {theme==='admin-light' ? '☾' : '☀'}
          </button> */}
          <button className="admin-sidebar__toggle" onClick={toggle} aria-expanded={open} aria-label="Toggle sidebar">≡</button>
        </div>
      </div>

      <nav className="admin-sidebar__nav">
        <NavLink to="/admin" end className={({isActive})=>`admin-link ${isActive?'active':''}`}>
          <span className="icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
          </span><span className="label">Dashboard</span>
        </NavLink>
        <NavLink to="/admin/services" className={({isActive})=>`admin-link ${isActive?'active':''}`}>
          <span className="icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </span><span className="label">Services</span>
        </NavLink>
        <NavLink to="/admin/pricing" className={({isActive})=>`admin-link ${isActive?'active':''}`}>
          <span className="icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M7 10h10M7 14h6" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </span><span className="label">Pricing</span>
        </NavLink>
        <NavLink to="/admin/completed" className={({isActive})=>`admin-link ${isActive?'active':''}`}>
          <span className="icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 7 10 17l-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="3" y="3" width="18" height="18" rx="3" ry="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
          </span><span className="label">Completed</span>
        </NavLink>
        <NavLink to="/admin/portfolio" className={({isActive})=>`admin-link ${isActive?'active':''}`}>
          <span className="icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="7" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </span><span className="label">Portfolio</span>
        </NavLink>
        <NavLink to="/admin/blog" className={({isActive})=>`admin-link ${isActive?'active':''}`}>
          <span className="icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 5h12a3 3 0 0 1 3 3v11H7a3 3 0 0 1-3-3V5z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 9h8M8 13h6" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </span><span className="label">Blog</span>
        </NavLink>
        <NavLink to="/admin/team" className={({isActive})=>`admin-link ${isActive?'active':''}`}>
          <span className="icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="16" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M3 20a5 5 0 0 1 10 0M11 20a5 5 0 0 1 10 0" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </span><span className="label">Team</span>
        </NavLink>
        <NavLink to="/admin/contacts" className={({isActive})=>`admin-link ${isActive?'active':''}`}>
          <span className="icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 5h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-4 3v-3H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </span><span className="label">Contacts</span>
        </NavLink>
        <NavLink to="/admin/analytics" className={({isActive})=>`admin-link ${isActive?'active':''}`}>
          <span className="icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 19V10M10 19V5M16 19v-7M22 19V8" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </span><span className="label">Analytics</span>
        </NavLink>
      </nav>
      <div className="admin-sidebar__footer">
        <button className="sidebar-action" onClick={() => navigate('/admin/profile')}>
          <span className="icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M4 20a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </span>
          <span className="label">Manage profile</span>
        </button>
        <button className="sidebar-action danger" onClick={handleLogout}>
          <span className="icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 6V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M14 12H3m0 0 3-3m-3 3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <span className="label">Logout</span>
        </button>
      </div>
    </aside>
    </>
  );
}
