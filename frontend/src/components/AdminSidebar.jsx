import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

export default function AdminSidebar() {
  const [open, setOpen] = useState(true);
  const toggle = () => setOpen(v => !v);

  return (
    <aside className={`admin-sidebar ${open ? 'open' : 'collapsed'}`} aria-label="Admin sidebar navigation">
      <div className="admin-sidebar__header">
        <strong>Admin</strong>
        <button className="admin-sidebar__toggle" onClick={toggle} aria-expanded={open} aria-label="Toggle sidebar">≡</button>
      </div>

      <nav className="admin-sidebar__nav">
        <NavLink to="/admin" end className={({isActive})=>`admin-link ${isActive?'active':''}`}>
          <span className="icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
          </span><span className="label">Dashboard</span>
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
    </aside>
  );
}
