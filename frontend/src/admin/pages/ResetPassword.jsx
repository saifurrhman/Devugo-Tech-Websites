import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ResetPassword(){
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function onSubmit(e){
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try{
      // TODO: call real API to send reset link
      // await api('/auth/reset-password', { method:'POST', body: JSON.stringify({ email }) });
      setMessage('If an account exists for this email, a reset link has been sent.');
    }catch(err){
      setMessage('Could not send reset link.');
    }finally{
      setLoading(false);
    }
  }

  return (
    <div className="admin-auth center" style={{ minHeight: '70vh' }}>
      <form onSubmit={onSubmit} className="card auth-card">
        <h2 style={{ marginBottom: '.75rem' }}>Reset Password</h2>
        <p style={{ marginBottom: '1rem' }}>Enter your email to receive a password reset link.</p>
        <div className="form-grid">
          <label className="form-field">
            <span className="form-label">Email</span>
            <input type="email" placeholder="you@company.com" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          </label>
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send reset link'}</button>
          {message && <div className="surface" style={{ padding: '.75rem', marginTop: '.25rem' }}>{message}</div>}
        </div>
        <div className="auth-footer">
          <Link to="/admin/login">Back to Login</Link>
        </div>
      </form>
    </div>
  );
}
