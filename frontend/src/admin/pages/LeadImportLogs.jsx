import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { ContactAPI } from '../../lib/api';

export default function LeadImportLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await ContactAPI.getSearchLogs();
      setLogs(Array.isArray(data) ? data : (data?.items || []));
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
          <h1>AI Search & Import Logs</h1>
          <button onClick={fetchLogs} className="btn-secondary">Refresh</button>
        </div>

        <div className="card bg-[#1e293b] rounded-xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-400 uppercase bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Industry</th>
                  <th className="px-6 py-3">Location</th>
                  <th className="px-6 py-3">Sources</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Leads Found</th>
                  <th className="px-6 py-3 text-right">Requested By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-400">Loading...</td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-400">No search logs found.</td>
                  </tr>
                ) : logs.map(log => (
                  <tr key={log._id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 text-gray-300">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-white">{log.industry}</td>
                    <td className="px-6 py-4 text-gray-300">{log.location}</td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {log.sources?.join(', ') || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        log.status === 'Completed' ? 'bg-green-500/10 text-green-400' :
                        log.status === 'Failed' ? 'bg-red-500/10 text-red-400' :
                        'bg-blue-500/10 text-blue-400'
                      }`}>
                        {log.status}
                      </span>
                      {log.error_message && (
                        <div className="text-xs text-red-400 mt-1" style={{maxWidth:'200px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}} title={log.error_message}>
                          {log.error_message}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {log.leads_found_count > 0 ? (
                        <strong className="text-green-400">{log.leads_found_count} leads</strong>
                      ) : (
                        <span>{log.leads_found_count} leads</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-400 text-xs">
                      {log.requested_by ? 'Admin' : 'System'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
