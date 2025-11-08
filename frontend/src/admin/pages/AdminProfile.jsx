import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { AuthAPI, UploadAPI } from '../../lib/api';

export default function AdminProfile(){
  const [user, setUser] = useState(()=>{
    try{ return JSON.parse(localStorage.getItem('adminUser')) || {}; }catch{ return {}; }
  });
  const [account, setAccount] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', avatar: user?.avatar || '' });
  const [security, setSecurity] = useState({ currentPassword: '', newPassword: '' });
  const [saving, setSaving] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [tab, setTab] =useState('account');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [showPwd, setShowPwd] = useState({ current:false, next:false });

  useEffect(()=>{ 
    setAccount({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', avatar: user?.avatar || '' }); 
    setAvatarPreview(user?.avatar || ''); 
  }, [user]);

  async function saveAccount(e){
    e.preventDefault(); 
    setSaving(true); 
    setMsg('');
    try{
      const { user: updated } = await AuthAPI.updateMe(account);
      setUser(updated);
      localStorage.setItem('adminUser', JSON.stringify(updated));
      setMsg('Profile updated');
    }catch(err){ 
      setMsg(err.message || 'Update failed'); 
    }
    finally{ 
      setSaving(false); 
    }
  }

  async function changePassword(e){
    e.preventDefault(); 
    setPwdSaving(true); 
    setPwdMsg('');
    try{
      await AuthAPI.changePassword(security);
      setPwdMsg('Password updated');
      setSecurity({ currentPassword: '', newPassword: '' });
    }catch(err){ 
      setPwdMsg(err.message || 'Unable to update password'); 
    }
    finally{ 
      setPwdSaving(false); 
    }
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <AdminTopbar />
        <h1 style={{marginTop:'.5rem'}}>Account Settings</h1>
        <div className="card settings-card" style={{marginTop:'1rem'}}>
          <div className="tabs" role="tablist">
            <button className={`tab ${tab==='account'?'active':''}`} onClick={()=>setTab('account')}>Account</button>
            <button className={`tab ${tab==='security'?'active':''}`} onClick={()=>setTab('security')}>Security</button>
          </div>
          
          {tab==='account' && (
            <form onSubmit={saveAccount} className="form-grid" style={{marginTop:'.75rem',maxWidth:820}}>
              <div className="grid two">
                <div>
                  <label className="form-field">
                    <span className="form-label" style={{color:'#fff'}}>Full Name</span>
                    <input value={account.name} onChange={e=>setAccount(a=>({...a, name:e.target.value}))} placeholder="Your name" />
                  </label>
                  <label className="form-field">
                    <span className="form-label" style={{color:'#fff'}}>Email</span>
                    <input type="email" value={account.email} onChange={e=>setAccount(a=>({...a, email:e.target.value}))} placeholder="you@company.com" />
                  </label>
                  <label className="form-field">
                    <span className="form-label" style={{color:'#fff'}}>Phone Number</span>
                    <input value={account.phone} onChange={e=>setAccount(a=>({...a, phone:e.target.value}))} placeholder="e.g. +1 555 000 1111" />
                  </label>
                  <label className="form-field">
                    <span className="form-label" style={{color:'#fff'}}>Avatar URL (optional)</span>
                    <input value={account.avatar} onChange={e=>{ setAccount(a=>({...a, avatar:e.target.value})); setAvatarPreview(e.target.value); }} placeholder="https://..." />
                  </label>
                </div>
                
                <div>
                  <div className="form-label" style={{marginBottom:'.35rem',color:'#fff'}}>Profile Picture</div>
                  <div className="card" style={{width:160,height:160,overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="avatar" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                    ) : (
                      <div className="center" style={{width:'100%',height:'100%',color:'#94a3b8'}}>No image</div>
                    )}
                  </div>
                  <label className="btn btn-primary" style={{marginTop:'.5rem',display:'block',width:'100%',textAlign:'center',cursor:'pointer'}}>
                    Upload image
                    <input 
                      type="file" 
                      accept="image/*" 
                      style={{display:'none'}} 
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
                <button className="btn btn-primary" type="submit" disabled={saving} style={{width:'100%'}}>
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
                {msg && <div className="surface" style={{padding:'.6rem .8rem'}}>{msg}</div>}
              </div>
            </form>
          )}
          
          {tab==='security' && (
            <form onSubmit={changePassword} className="form-grid" style={{marginTop:'.75rem',maxWidth:680}}>
              <label className="form-field">
                <span className="form-label" style={{color:'#fff'}}>Current Password</span>
                <div className="password-field">
                  <input 
                    type={showPwd.current ? 'text' : 'password'} 
                    value={security.currentPassword} 
                    onChange={e=>setSecurity(s=>({...s,currentPassword:e.target.value}))} 
                    placeholder="••••••••" 
                  />
                  <button 
                    type="button" 
                    className="password-toggle" 
                    onClick={()=>setShowPwd(p=>({...p,current:!p.current}))} 
                    aria-label={showPwd.current?'Hide password':'Show password'}
                  >
                    {showPwd.current ? (
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
              
              <label className="form-field">
                <span className="form-label" style={{color:'#fff'}}>New Password</span>
                <div className="password-field">
                  <input 
                    type={showPwd.next ? 'text' : 'password'} 
                    value={security.newPassword} 
                    onChange={e=>setSecurity(s=>({...s,newPassword:e.target.value}))} 
                    placeholder="••••••••" 
                  />
                  <button 
                    type="button" 
                    className="password-toggle" 
                    onClick={()=>setShowPwd(p=>({...p,next:!p.next}))} 
                    aria-label={showPwd.next?'Hide password':'Show password'}
                  >
                    {showPwd.next ? (
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
              
              <div className="settings-actions">
                <button className="btn btn-primary" type="submit" disabled={pwdSaving} style={{width:'100%'}}>
                  {pwdSaving ? 'Updating...' : 'Update password'}
                </button>
                {pwdMsg && <div className="surface" style={{padding:'.6rem .8rem'}}>{pwdMsg}</div>}
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}