import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import CustomSelect from '../../components/CustomSelect';

export default function LeadEdit(){
  const { id } = useParams();
  const isNew = id === 'new' || !id;
  const [status, setStatus] = useState('New');
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <h1>{isNew ? 'Add Lead' : `Edit Lead #${id}`}</h1>
        <div className="card" style={{marginTop:'1rem'}}>
          <div className="form-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
            <label className="form-label">Name
              <input className="form-field" placeholder="Full name" />
            </label>
            <label className="form-label">Email
              <input className="form-field" type="email" placeholder="name@example.com" />
            </label>
            <label className="form-label">Phone
              <input className="form-field" placeholder="Optional" />
            </label>
            <label className="form-label">Status
              <div className="mt-1">
                <CustomSelect
                  value={status}
                  onChange={setStatus}
                  options={[
                    { value: 'New', label: 'New' },
                    { value: 'Contacted', label: 'Contacted' },
                    { value: 'Converted', label: 'Converted' }
                  ]}
                />
              </div>
            </label>
            <label className="form-label" style={{gridColumn:'1 / -1'}}>Notes
              <textarea className="form-field" placeholder="Notes about this lead" rows={4} />
            </label>
          </div>
          </div>
        </div>
        <div className="admin-sticky-footer">
          <button type="button" className="px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors text-sm text-gray-300">Cancel</button>
          <button type="button" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors text-sm font-medium">Save</button>
          <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors text-sm font-medium">Save & Close</button>
        </div>
      </main>
    </div>
  );
}