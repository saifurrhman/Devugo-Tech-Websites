import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthAPI } from '../lib/api';
import {
  LayoutDashboard, Briefcase, CreditCard, Image, Star, HelpCircle, FileText,
  Share2, Edit, Users, UserCheck, Send, UserPlus, Inbox, Layout, BarChart,
  GitMerge, Folder, Calendar, PieChart, Settings, User, LogOut, Menu, Shield
} from 'lucide-react';

export default function AdminSidebar() {
  const [open, setOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const toggle = () => setOpen(v => !v);
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(() => localStorage.getItem('adminTheme') || 'admin-dark');

  useEffect(() => {
    document.body.classList.remove('admin-light', 'admin-dark');
    document.body.classList.add(theme);
    localStorage.setItem('adminTheme', theme);
  }, [theme]);

  // Get current user role
  const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const role = user.role || 'user';
  const isSuperAdmin = role === 'admin';
  const isEmailAdmin = role === 'email_marketing' || isSuperAdmin;
  const isCrmAdmin = role === 'crm' || isSuperAdmin;
  const isBlogWriter = role === 'blog_writer' || isSuperAdmin;
  const isWebsiteManager = role === 'website_manager' || isSuperAdmin;

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
    try { await AuthAPI.logout(); } catch (_e) { }
    try { localStorage.removeItem('adminUser'); localStorage.removeItem('adminToken'); } catch (_e) { }
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
            <button className="admin-sidebar__toggle" onClick={toggle} aria-expanded={open} aria-label="Toggle sidebar" style={{ padding: '4px' }}>
              <Menu size={24} />
            </button>
          </div>
        </div>

        <nav className="admin-sidebar__nav">
          <NavLink to="/admin" end className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
            <span className="icon"><LayoutDashboard size={20} /></span>
            <span className="label">Dashboard</span>
          </NavLink>

          {isWebsiteManager && (
            <>
              <NavLink to="/admin/services" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
                <span className="icon"><Briefcase size={20} /></span>
                <span className="label">Services</span>
              </NavLink>

              <NavLink to="/admin/brands" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
                <span className="icon"><Star size={20} /></span>
                <span className="label">Brands</span>
              </NavLink>

              <NavLink to="/admin/pricing" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
                <span className="icon"><CreditCard size={20} /></span>
                <span className="label">Pricing</span>
              </NavLink>

              <NavLink to="/admin/portfolio" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
                <span className="icon"><Image size={20} /></span>
                <span className="label">Portfolio</span>
              </NavLink>

              <NavLink to="/admin/reviews" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
                <span className="icon"><Star size={20} /></span>
                <span className="label">Reviews</span>
              </NavLink>

              <NavLink to="/admin/faqs" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
                <span className="icon"><HelpCircle size={20} /></span>
                <span className="label">FAQs</span>
              </NavLink>

              <NavLink to="/admin/forms" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
                <span className="icon"><FileText size={20} /></span>
                <span className="label">Forms</span>
              </NavLink>

              <NavLink to="/admin/social-links" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
                <span className="icon"><Share2 size={20} /></span>
                <span className="label">Social Links</span>
              </NavLink>

              <NavLink to="/admin/team" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
                <span className="icon"><Users size={20} /></span>
                <span className="label">Team</span>
              </NavLink>

              <NavLink to="/admin/careers" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
                <span className="icon"><Briefcase size={20} /></span>
                <span className="label">Careers</span>
              </NavLink>
            </>
          )}

          {isBlogWriter && (
            <>
              <NavLink to="/admin/blog" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
                <span className="icon"><Edit size={20} /></span>
                <span className="label">Blog</span>
              </NavLink>

            </>
          )}

          {isSuperAdmin && (
            <NavLink to="/admin/users" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
              <span className="icon"><Shield size={20} /></span>
              <span className="label">Users & Roles</span>
            </NavLink>
          )}

          {/* CONTACTS - Visible to Admin & Email Marketing */}
          {isEmailAdmin && (
            <NavLink
              to="/admin/contacts"
              className={({ isActive }) => `admin-link ${isActive && !location.pathname.includes('/recipients') ? 'active' : ''}`}
            >
              <span className="icon"><UserCheck size={20} /></span>
              <span className="label">Contacts</span>
            </NavLink>
          )}

          {/* 🔥 EMAIL MARKETING SECTION 🔥 */}
          {isEmailAdmin && (
            <>
              <div className="nav-divider">
                <span className="nav-divider__label">Email Marketing</span>
              </div>

              <NavLink to="/admin/campaigns" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
                <span className="icon"><Send size={20} /></span>
                <span className="label">Campaigns</span>
                <span className="badge badge--new">New</span>
              </NavLink>

              <NavLink
                to="/admin/recipients"
                className={({ isActive }) => `admin-link ${isActive || location.pathname.includes('/admin/recipients') ? 'active' : ''}`}
              >
                <span className="icon"><UserPlus size={20} /></span>
                <span className="label">Recipients</span>
              </NavLink>

              <NavLink to="/admin/inbox" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
                <span className="icon"><Inbox size={20} /></span>
                <span className="label">Inbox</span>
              </NavLink>

              <NavLink to="/admin/templates" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
                <span className="icon"><Layout size={20} /></span>
                <span className="label">Templates</span>
              </NavLink>

              <NavLink to="/admin/email-analytics" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
                <span className="icon"><BarChart size={20} /></span>
                <span className="label">Email Analytics</span>
              </NavLink>
            </>
          )}

          {/* 🔥 CRM & PROJECTS SECTION 🔥 */}
          {isCrmAdmin && (
            <>
              <div className="nav-divider">
                <span className="nav-divider__label">CRM & Projects</span>
              </div>

              <NavLink to="/admin/pipeline" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
                <span className="icon"><GitMerge size={20} /></span>
                <span className="label">Pipeline</span>
                <span className="badge badge--new">New</span>
              </NavLink>

              <NavLink to="/admin/projects" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
                <span className="icon"><Folder size={20} /></span>
                <span className="label">Projects</span>
                <span className="badge badge--new">New</span>
              </NavLink>

              <NavLink to="/admin/invoices" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
                <span className="icon"><FileText size={20} /></span>
                <span className="label">Invoices</span>
                <span className="badge badge--new">New</span>
              </NavLink>

              <NavLink to="/admin/proposals" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
                <span className="icon"><FileText size={20} /></span>
                <span className="label">Proposals</span>
                <span className="badge badge--new">New</span>
              </NavLink>

              <NavLink to="/admin/meetings" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
                <span className="icon"><Calendar size={20} /></span>
                <span className="label">Meetings</span>
                <span className="badge badge--new">New</span>
              </NavLink>
            </>
          )}

          {/* GENERAL ANALYTICS - Hidden for CRM Role */}
          {isSuperAdmin && (
            <NavLink to="/admin/analytics" className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
              <span className="icon"><PieChart size={20} /></span>
              <span className="label">Analytics</span>
            </NavLink>
          )}

          {/* SETTINGS SECTION */}
          {(isEmailAdmin || isSuperAdmin || isWebsiteManager) && (
            <div className="nav-divider">
              <span className="nav-divider__label">Settings</span>
            </div>
          )}

          {isEmailAdmin && (
            <NavLink
              to="/admin/settings/senders"
              className={({ isActive }) => `admin-link ${isActive || location.pathname.startsWith('/admin/settings/domains') ? 'active' : ''}`}
            >
              <span className="icon"><Users size={20} /></span>
              <span className="label">Senders & Domains</span>
            </NavLink>
          )}

          {(isSuperAdmin || isWebsiteManager) && (
            <NavLink
              to="/admin/settings"
              end
              className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}
            >
              <span className="icon"><Settings size={20} /></span>
              <span className="label">General Settings</span>
            </NavLink>
          )}

          {(isSuperAdmin || isCrmAdmin) && (
            <NavLink
              to="/admin/settings/integrations"
              className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}
            >
              <span className="icon"><GitMerge size={20} /></span>
              <span className="label">Integrations</span>
            </NavLink>
          )}
        </nav>

        <div className="admin-sidebar__footer">
          <button className="sidebar-action" onClick={() => navigate('/admin/profile')}>
            <span className="icon"><User size={20} /></span>
            <span className="label">Manage profile</span>
          </button>
          <button className="sidebar-action danger" onClick={handleLogout}>
            <span className="icon"><LogOut size={20} /></span>
            <span className="label">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}