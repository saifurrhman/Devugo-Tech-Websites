import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthAPI } from '../../lib/api';

export default function Login(){
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');

  function onChange(e){
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function onSubmit(e){
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const { user, token } = await AuthAPI.login(form);
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(user));
      if (!localStorage.getItem('adminTheme')) localStorage.setItem('adminTheme','admin-dark');
      navigate('/admin');
    } catch (err) {
      setMessage(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-auth center" style={{ minHeight: '70vh' }}>
      <form onSubmit={onSubmit} className="card auth-card">
        <h2 style={{ marginBottom: '.75rem' }}>Admin Login</h2>
        <p style={{ marginBottom: '1rem' }}>Sign in to your admin account</p>
        <div className="form-grid">
          <label className="form-field">
            <span className="form-label">Email</span>
            <input name="email" type="email" placeholder="you@company.com" value={form.email} onChange={onChange} required />
          </label>
          <label className="form-field">
            <span className="form-label">Password</span>
            <div className="password-field">
              <input name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={onChange} required />
              <button type="button" className="password-toggle" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?'Hide password':'Show password'}>
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.8"/>
                    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.8"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.8"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
                  </svg>
                )}
              </button>
            </div>
          </label>
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
          {message && <div className="surface" style={{ padding: '.75rem', marginTop: '.25rem' }}>{message}</div>}
        </div>
        <div className="auth-footer">
          <div style={{display:'flex',justifyContent:'space-between',gap:'.75rem',flexWrap:'wrap'}}>
            <Link to="/admin/signup">Don’t have an account? Create one</Link>
            <Link to="/admin/reset-password">Forgot password?</Link>
          </div>
        </div>
      </form>
    </div>
  );
}
