import React, { useState } from 'react';

export default function Signup(){
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  function onChange(e){
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function onSubmit(e){
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      // TODO: call backend signup endpoint when available
      // await api('/auth/signup', { method: 'POST', body: JSON.stringify(form) });
      setMessage('Signup placeholder success. Implement API next.');
    } catch (err) {
      setMessage('Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-auth center" style={{ minHeight: '70vh' }}>
      <form onSubmit={onSubmit} className="card" style={{ width: 360 }}>
        <h2 style={{ marginBottom: '.75rem' }}>Admin Signup</h2>
        <p style={{ marginBottom: '1rem' }}>Create an admin account</p>
        <div style={{ display: 'grid', gap: '.75rem' }}>
          <input name="name" placeholder="Full Name" value={form.name} onChange={onChange} required />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} required />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={onChange} required />
          <button className="btn" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
          {message && <div className="surface" style={{ padding: '.75rem', marginTop: '.25rem' }}>{message}</div>}
        </div>
        <div style={{ marginTop: '.75rem' }}>
          <a href="/admin/login">Already have an account? Login</a>
        </div>
      </form>
    </div>
  );
}
