import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import CustomSelect from '../../components/CustomSelect';
import { ContactAPI } from '../../lib/api';

export default function Leads(){
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Read filters from URL or default
  const [industry, setIndustry] = useState(searchParams.get('group') === 'industry' ? '' : 'all');
  const [source, setSource] = useState(searchParams.get('group') === 'source' ? '' : 'all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState(searchParams.get('sort') || '');

  // Keep local state for actual value to query API when group=industry is in URL, etc.
  // Actually, if 'group=industry', we might just want to group by industry. 
  // For simplicity, we just pass these as filters.
  
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If URL has group=industry, it just pre-fills or prepares UI, but here we just fetch all and let user filter.
    fetchLeads();
  }, [industry, source, status, sort, searchParams]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = {};
      if (status !== 'all') params.status = status;
      if (source !== 'all' && source !== '') params.source_platform = source;
      if (industry !== 'all' && industry !== '') params.industry_tag = industry;
      if (sort) params.sort = sort === 'score' ? 'lead_score' : sort;

      const data = await ContactAPI.list(params);
      let list = Array.isArray(data) ? data : (data?.items || data?.data || data?.contacts || []);
      
      // Filter out manual / CSV imports (only keep actual leads from AI/Scrapers)
      list = list.filter(c => {
        const src = (c.source_platform || c.source || '').toLowerCase();
        return src && src !== 'manual' && !src.includes('import') && !src.includes('csv') && !src.includes('upload');
      });
      
      setLeads(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <h1>Lead Generation (AI Hunter)</h1>

        <div className="card" style={{marginTop:'1rem'}}>
          <div style={{display:'flex',justifyContent:'space-between',gap:'1rem',flexWrap:'wrap'}}>
            <div>
              <strong>All Leads</strong>
              <div className="muted">Track leads from n8n workflows and AI scrapers</div>
            </div>
            <div style={{display:'flex',gap:'.5rem'}}>
              <a className="btn-secondary" href="/admin/leads/search">+ Find New Leads</a>
              <a className="btn" href="/admin/contacts/upload">Import CSV</a>
            </div>
          </div>
          <div className="divider"></div>

          <div style={{display:'flex',gap:'1rem',alignItems:'center',marginBottom:'.5rem', flexWrap: 'wrap'}}>
            <span className="muted">Filters:</span>
            <div className="w-48">
              <CustomSelect 
                value={status} 
                onChange={setStatus}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'new', label: 'New' },
                  { value: 'contacted', label: 'Contacted' },
                  { value: 'interested', label: 'Interested' },
                  { value: 'not_interested', label: 'Not Interested' },
                  { value: 'closed', label: 'Closed' }
                ]}
              />
            </div>
            <div className="w-48">
              <CustomSelect 
                value={source || 'all'} 
                onChange={setSource}
                options={[
                  { value: 'all', label: 'All Sources' },
                  { value: 'google_maps', label: 'Google Maps' },
                  { value: 'linkedin', label: 'LinkedIn' },
                  { value: 'instagram', label: 'Instagram' },
                  { value: 'facebook', label: 'Facebook' },
                  { value: 'manual', label: 'Manual' }
                ]}
              />
            </div>
            <div className="w-48">
              <CustomSelect 
                value={industry || 'all'} 
                onChange={setIndustry}
                options={[
                  { value: 'all', label: 'All Industries' },
                  { value: 'restaurants', label: 'Restaurants' },
                  { value: 'dentists', label: 'Dentists' },
                  { value: 'real_estate', label: 'Real Estate' },
                  { value: 'ecommerce', label: 'E-Commerce' }
                ]}
              />
            </div>
          </div>

          <div className="card bg-[#1e293b] rounded-xl border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-400 uppercase bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Industry</th>
                    <th className="px-6 py-3">Source</th>
                    <th className="px-6 py-3">Score</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Imported</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-400">Loading...</td>
                    </tr>
                  ) : leads.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-400">No AI leads found.</td>
                    </tr>
                  ) : leads.map(l => (
                    <tr key={l._id || l.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{l.name}</div>
                        <div className="text-xs text-gray-400">{l.email}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{l.industry_tag || '-'}</td>
                      <td className="px-6 py-4 text-gray-300 capitalize">{(l.source_platform || l.source || '-').replace('_', ' ')}</td>
                      <td className="px-6 py-4">
                        {l.lead_score > 0 ? (
                          <span className={`px-2 py-1 rounded text-xs ${l.lead_score >= 80 ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'}`}>
                            {l.lead_score}/100
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs bg-gray-800 text-gray-300 capitalize`}>
                          {l.status || 'New'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs">
                        {l.imported_at ? new Date(l.imported_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <a className="text-blue-400 hover:text-blue-300 text-xs" href={`/admin/leads/${l._id || l.id}`}>Edit Lead</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}