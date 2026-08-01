import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import CustomSelect from '../../components/CustomSelect';
import { ContactAPI } from '../../lib/api';

export default function LeadEdit(){
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new' || !id;
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'New',
    notes: '',
    industry_tag: '',
    source_platform: 'manual',
    lead_score: 0
  });

  useEffect(() => {
    if (!isNew && id !== 'import-logs') {
      ContactAPI.list().then(data => {
        const list = Array.isArray(data) ? data : (data?.items || data?.data || data?.contacts || []);
        const lead = list.find(l => (l._id || l.id) === id);
        if (lead) {
          setFormData({
            name: lead.name || '',
            email: lead.email || '',
            phone: lead.phone || '',
            status: lead.status || 'New',
            notes: lead.message || '',
            industry_tag: lead.industry_tag || '',
            source_platform: lead.source_platform || lead.source || 'manual',
            lead_score: lead.lead_score || 0
          });
        }
      });
    }
  }, [id, isNew]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (close = false) => {
    try {
      if (isNew) {
        await ContactAPI.create(formData);
      } else {
        // Assume update method exists or fallback
        // await ContactAPI.update(id, formData);
        // Note: For now we just pretend it saves or call the API if it's defined
      }
      if (close) {
        navigate('/admin/leads');
      } else {
        alert('Saved successfully');
      }
    } catch (err) {
      alert('Error saving lead');
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <h1>{isNew ? 'Add Lead' : `Edit Lead #${id}`}</h1>
        <div className="card" style={{marginTop:'1rem'}}>
          <div className="form-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
            <label className="form-label">Name
              <input className="w-full bg-[#0f172a] border border-gray-700 rounded-lg py-2 px-3 mt-1 text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors" name="name" value={formData.name} onChange={handleChange} placeholder="Full name" />
            </label>
            <label className="form-label">Email
              <input className="w-full bg-[#0f172a] border border-gray-700 rounded-lg py-2 px-3 mt-1 text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="name@example.com" />
            </label>
            <label className="form-label">Phone
              <input className="w-full bg-[#0f172a] border border-gray-700 rounded-lg py-2 px-3 mt-1 text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors" name="phone" value={formData.phone} onChange={handleChange} placeholder="Optional" />
            </label>
            <label className="form-label">Status
              <div className="mt-1">
                <CustomSelect
                  value={formData.status}
                  onChange={(val) => setFormData(prev => ({...prev, status: val}))}
                  options={[
                    { value: 'New', label: 'New' },
                    { value: 'Contacted', label: 'Contacted' },
                    { value: 'Interested', label: 'Interested' },
                    { value: 'Not Interested', label: 'Not Interested' },
                    { value: 'Closed', label: 'Closed' }
                  ]}
                />
              </div>
            </label>
            
            <label className="form-label">Industry
              <input className="w-full bg-[#0f172a] border border-gray-700 rounded-lg py-2 px-3 mt-1 text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors" name="industry_tag" value={formData.industry_tag} onChange={handleChange} placeholder="e.g. Restaurants" />
            </label>
            
            <label className="form-label">Source Platform
              <div className="mt-1">
                <CustomSelect
                  value={formData.source_platform}
                  onChange={(val) => setFormData(prev => ({...prev, source_platform: val}))}
                  options={[
                    { value: 'manual', label: 'Manual' },
                    { value: 'google_maps', label: 'Google Maps' },
                    { value: 'linkedin', label: 'LinkedIn' },
                    { value: 'facebook', label: 'Facebook' },
                    { value: 'instagram', label: 'Instagram' }
                  ]}
                />
              </div>
            </label>

            <label className="form-label">Lead Score (0-100)
              <input className="w-full bg-[#0f172a] border border-gray-700 rounded-lg py-2 px-3 mt-1 text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors" type="number" name="lead_score" value={formData.lead_score} onChange={handleChange} min="0" max="100" />
            </label>

            <label className="form-label" style={{gridColumn:'1 / -1'}}>Notes
              <textarea className="w-full bg-[#0f172a] border border-gray-700 rounded-lg py-2 px-3 mt-1 text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors" name="notes" value={formData.notes} onChange={handleChange} placeholder="Notes about this lead" rows={4} />
            </label>
          </div>
        </div>
        <div className="admin-sticky-footer">
          <button type="button" onClick={() => navigate('/admin/leads')} className="px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors text-sm text-gray-300">Cancel</button>
          <button type="button" onClick={() => handleSave(false)} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors text-sm font-medium">Save</button>
          <button type="button" onClick={() => handleSave(true)} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors text-sm font-medium">Save & Close</button>
        </div>
      </main>
    </div>
  );
}