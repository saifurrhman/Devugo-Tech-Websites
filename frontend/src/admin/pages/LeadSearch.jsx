import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { ContactAPI } from '../../lib/api';
import { Sparkles, Briefcase, MapPin, Map, Linkedin, Instagram, Facebook, Twitter, Search } from 'lucide-react';

export default function LeadSearch() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    industry: '',
    location: '',
    sources: [],
    max_results: 20
  });

  const sourceOptions = [
    { value: 'google_maps', label: 'Google Maps', Icon: Map },
    { value: 'linkedin', label: 'LinkedIn', Icon: Linkedin },
    { value: 'instagram', label: 'Instagram', Icon: Instagram },
    { value: 'facebook', label: 'Facebook', Icon: Facebook },
    { value: 'twitter', label: 'Twitter', Icon: Twitter }
  ];

  const handleSourceToggle = (val) => {
    setFormData(prev => {
      const current = prev.sources;
      if (current.includes(val)) {
        return { ...prev, sources: current.filter(s => s !== val) };
      } else {
        return { ...prev, sources: [...current, val] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.industry || !formData.location) {
      alert('Industry and Location are required!');
      return;
    }
    if (formData.sources.length === 0) {
      alert('Select at least one source!');
      return;
    }

    setLoading(true);
    try {
      await ContactAPI.search(formData);
      navigate('/admin/leads/import-logs');
    } catch (err) {
      alert('Error triggering search: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
          <div>
            <h1 style={{display:'flex', alignItems:'center', gap:'0.5rem', margin:0}}>
              <Sparkles size={24} className="text-blue-400" />
              Find New Leads
            </h1>
            <p className="muted mt-1" style={{fontSize: '0.9rem'}}>AI hunts across platforms and imports matches straight into your CRM.</p>
          </div>
          <button onClick={() => navigate('/admin/leads')} className="btn-secondary">Back to Leads</button>
        </div>

        <div className="card max-w-3xl" style={{padding: '20px', borderRadius: '12px', border: '1px solid #1e293b'}}>
          <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'20px'}}>
            
            {/* Industry Field */}
            <div>
              <label className="form-label" style={{marginBottom: '6px', display: 'block'}}>Industry or niche *</label>
              <div style={{position: 'relative'}}>
                <Briefcase size={18} className="text-gray-400" style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)'}} />
                <input 
                  className="w-full bg-[#0f172a] border border-gray-700 rounded-lg py-2 text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors" 
                  style={{paddingLeft: '38px', paddingRight: '12px'}}
                  placeholder="e.g. restaurants, dentists, real estate" 
                  value={formData.industry} 
                  onChange={(e) => setFormData({...formData, industry: e.target.value})} 
                  required 
                />
              </div>
            </div>

            {/* Location Field */}
            <div>
              <label className="form-label" style={{marginBottom: '6px', display: 'block'}}>Location / City *</label>
              <div style={{position: 'relative'}}>
                <MapPin size={18} className="text-gray-400" style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)'}} />
                <input 
                  className="w-full bg-[#0f172a] border border-gray-700 rounded-lg py-2 text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors" 
                  style={{paddingLeft: '38px', paddingRight: '12px'}}
                  placeholder="e.g. Karachi, Pakistan" 
                  value={formData.location} 
                  onChange={(e) => setFormData({...formData, location: e.target.value})} 
                  required 
                />
              </div>
            </div>

            {/* Target Platforms */}
            <div>
              <label className="form-label block" style={{marginBottom: '10px'}}>Target Platforms *</label>
              <div style={{display:'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '12px'}}>
                {sourceOptions.map(src => {
                  const isSelected = formData.sources.includes(src.value);
                  const Icon = src.Icon;
                  return (
                    <div 
                      key={src.value} 
                      onClick={() => handleSourceToggle(src.value)}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        padding: '16px 8px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s',
                        border: isSelected ? '2px solid #3b82f6' : '1px solid #334155',
                        backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                        color: isSelected ? '#3b82f6' : '#94a3b8'
                      }}
                    >
                      <Icon size={24} style={{marginBottom: '8px', color: isSelected ? '#3b82f6' : '#64748b'}} />
                      <span style={{fontSize: '0.85rem', fontWeight: 500, textAlign: 'center'}}>{src.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Max Results */}
            <div style={{display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '8px'}}>
              <label className="form-label" style={{margin: 0}}>Max Results to Fetch:</label>
              <input 
                className="bg-[#0f172a] border border-gray-700 rounded-lg py-2 px-3 text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors" 
                style={{width: '80px', textAlign: 'center'}}
                type="number"
                min="1"
                max="500"
                value={formData.max_results} 
                onChange={(e) => setFormData({...formData, max_results: parseInt(e.target.value) || 20})} 
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-gray-800 mt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="btn bg-blue-600 hover:bg-blue-500 text-white w-full"
                style={{padding:'12px', fontSize:'1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: '8px'}}
              >
                <Search size={20} />
                {loading ? 'Triggering AI Search...' : 'Start search workflow'}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}
