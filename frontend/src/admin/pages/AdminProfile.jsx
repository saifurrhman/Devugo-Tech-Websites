import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { AuthAPI, UploadAPI } from '../../lib/api';

export default function AdminProfile() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('adminUser')) || {}; } catch { return {}; }
  });
  const [account, setAccount] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', avatar: user?.avatar || '' });
  const [security, setSecurity] = useState({ currentPassword: '', newPassword: '' });
  const [saving, setSaving] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [tab, setTab] = useState('account');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [showPwd, setShowPwd] = useState({ current: false, next: false });

  // Forgot Password / OTP State
  const [forgotMode, setForgotMode] = useState(false);
  const [otpStep, setOtpStep] = useState(1); // 1: Send, 2: Verify
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpMsg, setOtpMsg] = useState('');
  const [otpIsError, setOtpIsError] = useState(false); // Added state
  const [showOtpPwd, setShowOtpPwd] = useState(false);

  useEffect(() => {
    document.title = 'Admin Profile - Devugo Tech';
  }, []);
  useEffect(() => {
    setAccount({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', avatar: user?.avatar || '' });
    setAvatarPreview(user?.avatar || '');
  }, [user]);

  async function saveAccount(e) {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const { user: updated } = await AuthAPI.updateMe(account);
      setUser(updated);
      localStorage.setItem('adminUser', JSON.stringify(updated));
      setMsg('Profile updated');
    } catch (err) {
      setMsg(err.message || 'Update failed');
    }
    finally {
      setSaving(false);
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    setPwdSaving(true);
    setPwdMsg('');
    try {
      await AuthAPI.changePassword(security);
      setPwdMsg('Password updated');
      setSecurity({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setPwdMsg(err.message || 'Unable to update password');
    }
    finally {
      setPwdSaving(false);
    }
  }

  // New OTP functions
  const handleSendOTP = async () => {
    setOtpLoading(true);
    setOtpMsg(''); // Clear previous message
    setOtpIsError(false); // Reset error state
    try {
      const res = await AuthAPI.sendOTP(user.email);
      setOtpStep(2);
      setOtpMsg(res.message || 'OTP sent to your email!');
      setOtpIsError(false); // Explicitly set to false on success
    } catch (err) {
      setOtpIsError(true); // Set to true on error
      setOtpMsg(err.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResetOTP = async () => {
    setOtpLoading(true);
    setOtpMsg(''); // Clear previous message
    setOtpIsError(false); // Reset error state
    try {
      // Assuming AuthAPI.resetPasswordWithOTP takes an object as before
      await AuthAPI.resetPasswordWithOTP({
        email: user.email,
        otp: otpCode,
        newPassword: security.newPassword // Use existing security.newPassword state
      });
      setOtpMsg('Password reset successfully!');
      setOtpIsError(false); // Explicitly set to false on success

      // Delay to let user read message then reset view
      setTimeout(() => {
        setForgotMode(false);
        setOtpStep(1);
        setOtpCode('');
        setSecurity({ currentPassword: '', newPassword: '' }); // Clear password fields
        setOtpMsg(''); // Clear OTP message
        setPwdMsg('Password reset successfully'); // Show success in main security tab
      }, 2000);

    } catch (err) {
      setOtpIsError(true); // Set to true on error
      setOtpMsg(err.message || 'Failed to reset password');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <h1 style={{ marginTop: '.5rem' }}>Account Settings</h1>
        <div className="card settings-card" style={{ marginTop: '1rem' }}>
          <div className="tabs" role="tablist">
            <button className={`tab ${tab === 'account' ? 'active' : ''}`} onClick={() => setTab('account')}>Account</button>
            <button className={`tab ${tab === 'security' ? 'active' : ''}`} onClick={() => setTab('security')}>Security</button>
          </div>

          {tab === 'account' && (
            <form onSubmit={saveAccount} className="form-grid" style={{ marginTop: '.75rem', maxWidth: 820 }}>
              <div className="grid two">
                <div>
                  <label className="form-field">
                    <span className="form-label" style={{ color: '#fff' }}>Full Name</span>
                    <input value={account.name} onChange={e => setAccount(a => ({ ...a, name: e.target.value }))} placeholder="Your name" />
                  </label>
                  <label className="form-field">
                    <span className="form-label" style={{ color: '#fff' }}>Email</span>
                    <input type="email" value={account.email} onChange={e => setAccount(a => ({ ...a, email: e.target.value }))} placeholder="you@company.com" />
                  </label>
                  <label className="form-field">
                    <span className="form-label" style={{ color: '#fff' }}>Phone Number</span>
                    <input value={account.phone} onChange={e => setAccount(a => ({ ...a, phone: e.target.value }))} placeholder="e.g. +1 555 000 1111" />
                  </label>
                  <label className="form-field">
                    <span className="form-label" style={{ color: '#fff' }}>Avatar URL (optional)</span>
                    <input value={account.avatar} onChange={e => { setAccount(a => ({ ...a, avatar: e.target.value })); setAvatarPreview(e.target.value); }} placeholder="https://..." />
                  </label>
                </div>

                <div>
                  <div className="form-label" style={{ marginBottom: '.35rem', color: '#fff' }}>Profile Picture</div>
                  <div className="card" style={{ width: 160, height: 160, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div className="center" style={{ width: '100%', height: '100%', color: '#94a3b8' }}>No image</div>
                    )}
                  </div>
                  <label className="btn btn-primary" style={{ marginTop: '.5rem', display: 'block', width: '100%', textAlign: 'center', cursor: 'pointer' }}>
                    Upload image
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        // Show a temporary local preview
                        const previewUrl = URL.createObjectURL(file);
                        setAvatarPreview(previewUrl);
                        setSaving(true);
                        setMsg('Uploading...');

                        try {
                          // Step 1: Upload image to server
                          const { data } = await UploadAPI.uploadSingle(file);

                          if (data && data.url) {
                            // Step 2: ✅ AUTO-SAVE to database immediately
                            const updatedAccount = {
                              ...account,
                              avatar: data.url
                            };

                            setMsg('Saving avatar...');

                            // Call API to permanently save avatar
                            const { user: updated } = await AuthAPI.updateMe(updatedAccount);

                            // Update all states with saved data
                            setUser(updated);
                            setAccount(updatedAccount);
                            setAvatarPreview(data.url);
                            localStorage.setItem('adminUser', JSON.stringify(updated));

                            // ✅ Success message
                            setMsg('Avatar saved successfully! ✓');

                            // Clear message after 3 seconds
                            setTimeout(() => setMsg(''), 3000);
                          } else {
                            throw new Error('Upload response did not contain a URL.');
                          }
                        } catch (err) {
                          setMsg(err.message || 'Avatar upload failed');
                          setAvatarPreview(account.avatar || ''); // Revert preview on fail
                        } finally {
                          setSaving(false);
                          // Clean up the temporary object URL
                          if (previewUrl) URL.revokeObjectURL(previewUrl);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="settings-actions">
                <button className="btn btn-primary" type="submit" disabled={saving} style={{ width: '100%' }}>
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
                {msg && <div className="surface" style={{ padding: '.6rem .8rem' }}>{msg}</div>}
              </div>
            </form>
          )}

          {tab === 'security' && (
            <div style={{ marginTop: '.75rem', maxWidth: 680 }}>
              {!forgotMode ? (
                <>
                  <form onSubmit={changePassword} className="form-grid">
                    <label className="form-field">
                      <div className="flex justify-between items-center mb-1">
                        <span className="form-label" style={{ color: '#fff', marginBottom: 0 }}>Current Password</span>
                        <button
                          type="button"
                          onClick={() => setForgotMode(true)}
                          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className="password-field">
                        <input
                          type={showPwd.current ? 'text' : 'password'}
                          value={security.currentPassword}
                          onChange={e => setSecurity(s => ({ ...s, currentPassword: e.target.value }))}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowPwd(p => ({ ...p, current: !p.current }))}
                          aria-label={showPwd.current ? 'Hide password' : 'Show password'}
                        >
                          {showPwd.current ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" /></svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4-8-11-8-11 8-11 8z" /><circle cx="12" cy="12" r="3" /></svg>
                          )}
                        </button>
                      </div>
                    </label>

                    <label className="form-field">
                      <span className="form-label" style={{ color: '#fff' }}>New Password</span>
                      <div className="password-field">
                        <input
                          type={showPwd.next ? 'text' : 'password'}
                          value={security.newPassword}
                          onChange={e => setSecurity(s => ({ ...s, newPassword: e.target.value }))}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowPwd(p => ({ ...p, next: !p.next }))}
                          aria-label={showPwd.next ? 'Hide password' : 'Show password'}
                        >
                          {showPwd.next ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" /></svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4-8-11-8-11 8-11 8z" /><circle cx="12" cy="12" r="3" /></svg>
                          )}
                        </button>
                      </div>
                    </label>

                    <div className="settings-actions">
                      <button className="btn btn-primary" type="submit" disabled={pwdSaving} style={{ width: '100%' }}>
                        {pwdSaving ? 'Updating...' : 'Update password'}
                      </button>
                      {pwdMsg && <div className="surface" style={{ padding: '.6rem .8rem' }}>{pwdMsg}</div>}
                    </div>
                  </form>
                </>
              ) : (
                <div className="otp-reset-flow p-4 rounded bg-slate-800/50 border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Reset Password</h3>
                    <button
                      onClick={() => { setForgotMode(false); setOtpStep(1); setOtpCode(''); setOtpMsg(''); }}
                      className="text-sm text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>

                  {otpStep === 1 ? (
                    <div className="step-1 space-y-4">
                      <p className="text-sm text-slate-300">
                        We will send a one-time password (OTP) to your email <strong>{user.email}</strong>.
                      </p>
                      <button
                        className="btn btn-primary w-full"
                        disabled={otpLoading}
                        onClick={handleSendOTP}
                      >
                        {otpLoading ? 'Sending OTP...' : 'Send OTP Code'}
                      </button>
                    </div>
                  ) : (
                    <div className="step-2 space-y-4">
                      <label className="block">
                        <span className="text-sm text-slate-300 mb-1 block">Enter 6-digit OTP</span>
                        <input
                          type="text"
                          name="otp_code_special_field"
                          id="otp_code_ignore"
                          autoComplete="off"
                          data-lpignore="true"
                          inputMode="numeric"
                          className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-center text-xl tracking-widest"
                          placeholder="000000"
                          maxLength={6}
                          value={otpCode}
                          onChange={e => setOtpCode(e.target.value)}
                        />
                      </label>

                      <label className="block">
                        <span className="text-sm text-slate-300 mb-1 block">New Password</span>
                        <div className="relative">
                          <input
                            type={showOtpPwd ? 'text' : 'password'}
                            autoComplete="new-password"
                            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white pr-10"
                            placeholder="New password"
                            value={security.newPassword}
                            onChange={e => setSecurity(s => ({ ...s, newPassword: e.target.value }))}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                            onClick={() => setShowOtpPwd(!showOtpPwd)}
                          >
                            {showOtpPwd ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" /></svg>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4-8-11-8-11 8-11 8z" /><circle cx="12" cy="12" r="3" /></svg>
                            )}
                          </button>
                        </div>
                      </label>

                      <button
                        className="btn btn-primary w-full"
                        disabled={otpLoading}
                        onClick={handleResetOTP}
                      >
                        {otpLoading ? 'Verifying...' : 'Reset Password'}
                      </button>
                    </div>
                  )}

                  {otpMsg && (
                    <div className={`mt-3 p-2 text-sm rounded ${!otpIsError
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                      {otpMsg}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}