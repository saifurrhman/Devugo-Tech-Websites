import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import AccountManager from './social/AccountManager';
import Composer from './social/Composer';
import CalendarView from './social/CalendarView';
import PostHistory from './social/PostHistory';
import AnalyticsDashboard from './social/AnalyticsDashboard';
import CampaignTagManager from './social/CampaignTagManager';
import { Share2, Edit3, Calendar, History, BarChart2, ShieldCheck, RefreshCw } from 'lucide-react';
import axios from 'axios';
import '../../styles/social-suite.css';

export default function SocialSuite() {
  const [activeTab, setActiveTab] = useState('composer'); // composer | calendar | history | accounts | analytics | campaign
  const [accounts, setAccounts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [accRes, postRes] = await Promise.all([
        axios.get('/api/social/accounts', getHeaders()).catch(() => ({ data: { accounts: [] } })),
        axios.get('/api/social/posts', getHeaders()).catch(() => ({ data: { posts: [] } }))
      ]);

      if (accRes.data?.accounts) setAccounts(accRes.data.accounts);
      if (postRes.data?.posts) setPosts(postRes.data.posts);
    } catch (err) {
      console.error('Failed to load social suite data', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />

        <div className="social-suite-container">
          {/* Module Banner */}
          <div className="social-header-banner">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Share2 size={24} style={{ color: '#8b5cf6' }} />
                <h1 style={{ margin: 0, fontSize: '1.5rem', background: 'linear-gradient(90deg, #fff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  SocialSuite — Social Media Management Module
                </h1>
              </div>
              <p className="muted" style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
                Multi-platform publishing, real-time validation engine, interactive drag-and-drop calendar & unified analytics.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span className="badge" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '0.35rem 0.75rem' }}>
                {accounts.length} Connected Accounts
              </span>
              <button className="btn-secondary" onClick={fetchInitialData} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} title="Refresh All Data">
                <RefreshCw size={14} /> Refresh
              </button>
            </div>
          </div>

          {/* Module Tab Navigation */}
          <div className="social-tabs">
            <button className={`social-tab-btn ${activeTab === 'composer' ? 'active' : ''}`} onClick={() => setActiveTab('composer')}>
              <Edit3 size={18} /> Post Composer & Preview
            </button>
            <button className={`social-tab-btn ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>
              <Calendar size={18} /> Content Calendar
            </button>
            <button className={`social-tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
              <History size={18} /> Post History & Drafts
            </button>
            <button className={`social-tab-btn ${activeTab === 'accounts' ? 'active' : ''}`} onClick={() => setActiveTab('accounts')}>
              <Share2 size={18} /> Account Connection Center
            </button>
            <button className={`social-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
              <BarChart2 size={18} /> Analytics & Attribution
            </button>
            <button className={`social-tab-btn ${activeTab === 'campaign' ? 'active' : ''}`} onClick={() => setActiveTab('campaign')}>
              <ShieldCheck size={18} /> Campaigns & Audit Logs
            </button>
          </div>

          {/* Tab Content Panes */}
          {loading ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
              <div className="muted">Loading SocialSuite workspace...</div>
            </div>
          ) : (
            <>
              {activeTab === 'composer' && <Composer accounts={accounts} onPostCreated={fetchInitialData} />}
              {activeTab === 'calendar' && <CalendarView posts={posts} onPostUpdated={fetchInitialData} />}
              {activeTab === 'history' && <PostHistory posts={posts} onPostUpdated={fetchInitialData} />}
              {activeTab === 'accounts' && <AccountManager accounts={accounts} onRefreshAccounts={fetchInitialData} />}
              {activeTab === 'analytics' && <AnalyticsDashboard />}
              {activeTab === 'campaign' && <CampaignTagManager />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
