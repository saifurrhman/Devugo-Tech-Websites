import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MoreVertical, Edit, Copy, Trash2, Send, XCircle } from 'lucide-react';
import axios from 'axios';

export default function CalendarView({ posts = [], onPostUpdated }) {
  const [viewMode, setViewMode] = useState('month'); // month | week | day | list
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedPostId, setDraggedPostId] = useState(null);
  const [dragOverDate, setDragOverDate] = useState(null);

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
  });

  const scheduledPosts = posts.filter(p => p.status === 'scheduled' || p.status === 'published');

  // Month navigation
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(new Date(year, month, d));
  }

  // Handle Drag & Drop Reschedule
  const handleDragStart = (e, postId) => {
    e.dataTransfer.setData('text/plain', postId);
    setDraggedPostId(postId);
  };

  const handleDragOver = (e, dateStr) => {
    e.preventDefault();
    setDragOverDate(dateStr);
  };

  const handleDrop = async (e, targetDate) => {
    e.preventDefault();
    const postId = e.dataTransfer.getData('text/plain') || draggedPostId;
    setDraggedPostId(null);
    setDragOverDate(null);

    if (!postId || !targetDate) return;

    try {
      const post = posts.find(p => p._id === postId);
      if (!post) return;

      const currentSched = post.scheduledAt ? new Date(post.scheduledAt) : new Date();
      const newSched = new Date(targetDate);
      newSched.setHours(currentSched.getHours(), currentSched.getMinutes());

      await axios.put(`/api/social/posts/${postId}`, {
        scheduledAt: newSched.toISOString(),
        status: 'scheduled'
      }, getHeaders());

      if (onPostUpdated) onPostUpdated();
    } catch (err) {
      alert('Failed to reschedule post');
    }
  };

  const handlePostAction = async (action, post) => {
    try {
      if (action === 'delete') {
        if (!window.confirm('Delete this scheduled post?')) return;
        await axios.delete(`/api/social/posts/${post._id}`, getHeaders());
      } else if (action === 'cancel') {
        await axios.put(`/api/social/posts/${post._id}`, { status: 'cancelled' }, getHeaders());
      } else if (action === 'publish_now') {
        await axios.post(`/api/social/posts`, {
          globalText: post.globalText,
          platformOverrides: post.platformOverrides,
          mediaAssets: post.mediaAssets,
          selectedAccounts: post.selectedAccounts?.map(a => a._id || a),
          action: 'publish_now'
        }, getHeaders());
      }
      if (onPostUpdated) onPostUpdated();
    } catch (err) {
      alert(`Action ${action} failed`);
    }
  };

  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      {/* Calendar Top Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h3>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button className="btn-secondary" style={{ padding: '0.3rem 0.6rem' }} onClick={prevMonth}><ChevronLeft size={16} /></button>
            <button className="btn-secondary" style={{ padding: '0.3rem 0.6rem' }} onClick={nextMonth}><ChevronRight size={16} /></button>
            <button className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => setCurrentDate(new Date())}>Today</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {['month', 'week', 'day', 'list'].map(m => (
            <button
              key={m}
              className={`btn-secondary ${viewMode === m ? 'active' : ''}`}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.8rem',
                textTransform: 'capitalize',
                background: viewMode === m ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                borderColor: viewMode === m ? '#6366f1' : 'rgba(255,255,255,0.1)'
              }}
              onClick={() => setViewMode(m)}
            >
              {m} View
            </button>
          ))}
        </div>
      </div>

      {/* Month View Grid */}
      {viewMode === 'month' && (
        <div>
          {/* Day Headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontWeight: 600, paddingBottom: '0.5rem', color: 'var(--text-muted, #94a3b8)', fontSize: '0.85rem' }}>
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>

          <div className="calendar-grid-month">
            {daysArray.map((day, idx) => {
              if (!day) {
                return <div key={`empty-${idx}`} className="calendar-day-cell" style={{ opacity: 0.2 }} />;
              }

              const dateStr = day.toISOString().split('T')[0];
              const isToday = new Date().toDateString() === day.toDateString();
              const dayPosts = scheduledPosts.filter(p => {
                if (!p.scheduledAt) return false;
                return new Date(p.scheduledAt).toISOString().split('T')[0] === dateStr;
              });

              return (
                <div
                  key={dateStr}
                  className={`calendar-day-cell ${dragOverDate === dateStr ? 'drag-over' : ''}`}
                  style={{ background: isToday ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255,255,255,0.03)' }}
                  onDragOver={e => handleDragOver(e, dateStr)}
                  onDrop={e => handleDrop(e, day)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: isToday ? 700 : 500, color: isToday ? '#6366f1' : 'inherit' }}>
                    <span>{day.getDate()}</span>
                    {dayPosts.length > 0 && <span className="muted" style={{ fontSize: '0.7rem' }}>{dayPosts.length} posts</span>}
                  </div>

                  {dayPosts.map(post => (
                    <div
                      key={post._id}
                      className="calendar-post-chip"
                      draggable
                      onDragStart={e => handleDragStart(e, post._id)}
                      title={post.globalText}
                      style={{
                        background: post.status === 'published' ? 'rgba(34, 197, 94, 0.25)' : 'rgba(99, 102, 241, 0.25)',
                        borderColor: post.status === 'published' ? '#22c55e' : '#6366f1'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '85%' }}>
                          {post.globalText}
                        </span>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          <button
                            type="button"
                            onClick={() => handlePostAction('publish_now', post)}
                            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}
                            title="Publish Now"
                          >
                            <Send size={10} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {scheduledPosts.length === 0 ? (
            <p className="muted" style={{ textAlign: 'center', padding: '2rem' }}>No scheduled posts found for this period.</p>
          ) : (
            scheduledPosts.map(post => (
              <div key={post._id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{post.globalText}</div>
                  <div className="muted" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    Scheduled for: {post.scheduledAt ? new Date(post.scheduledAt).toLocaleString() : 'N/A'} • {post.selectedAccounts?.length || 0} accounts
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handlePostAction('publish_now', post)}>Publish Now</button>
                  <button className="btn-secondary danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => handlePostAction('cancel', post)}>Cancel</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
