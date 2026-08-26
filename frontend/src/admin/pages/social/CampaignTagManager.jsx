import React, { useState, useEffect } from 'react';
import { ShieldCheck, Tag, Folder, History, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import axios from 'axios';

export default function CampaignTagManager() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
  });

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/social/audit-logs', getHeaders());
      if (res.data.success) {
        setLogs(res.data.logs);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Campaign & Tag Overview Header */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>Campaign & Tag Organization</h3>
        <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>
          Group social posts under unified campaign buckets and label posts with searchable tags.
        </p>
      </div>

      {/* Security Audit Log Table */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={20} /> Security & Action Audit Trail
            </h3>
            <p className="muted" style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem' }}>
              Immutable logging for sensitive actions (connect, disconnect, publish, retry, reschedule).
            </p>
          </div>
          <button className="btn-secondary" onClick={fetchAuditLogs} style={{ fontSize: '0.8rem' }}>
            Refresh Logs
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }} className="muted">Loading audit logs...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Platform</th>
                  <th>Details</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }} className="muted">
                      No audit log entries recorded yet.
                    </td>
                  </tr>
                ) : (
                  logs.map(log => (
                    <tr key={log._id}>
                      <td className="muted" style={{ fontSize: '0.8rem' }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td>
                        <strong>{log.action}</strong>
                      </td>
                      <td>
                        {log.platform ? <span className={`platform-badge platform-${log.platform}`}>{log.platform}</span> : '-'}
                      </td>
                      <td style={{ maxWidth: 320, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {log.details}
                      </td>
                      <td>
                        {log.status === 'SUCCESS' && <span className="text-success"><CheckCircle2 size={14} /> SUCCESS</span>}
                        {log.status === 'WARNING' && <span className="text-warning"><AlertTriangle size={14} /> WARNING</span>}
                        {log.status === 'FAILURE' && <span className="text-danger"><XCircle size={14} /> FAILURE</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
