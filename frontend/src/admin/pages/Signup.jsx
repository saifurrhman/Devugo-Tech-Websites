import React, { useState } from 'react';
import { AuthAPI } from '../../lib/api';

export default function Signup(){
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  function onChange(e){
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function onSubmit(e){
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const data = await AuthAPI.signup(form);
      const user = data?.user;
      if (user) localStorage.setItem('adminUser', JSON.stringify(user));
      if (!localStorage.getItem('adminTheme')) localStorage.setItem('adminTheme','admin-dark');
      window.location.assign('/admin');
    } catch (err) {
      setMessage(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0E2F4A 0%, #0B3B63 60%, #07253F 100%)' }}
    >
      {/* Background accents */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute bottom-32 right-32 w-96 h-96 bg-blue-400 rounded-full opacity-15 animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-20 left-1/4 w-48 h-48 bg-blue-600 rounded-full opacity-25 animate-pulse" style={{animationDelay: '0.5s'}}></div>

      <div className="flex w-full max-w-6xl mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-fadeIn">
        {/* Left welcome */}
        <div
          className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0E2F4A 0%, #0B3B63 60%, #07253F 100%)' }}
        >
          <div className="absolute top-16 left-16 w-40 h-40 bg-blue-500 rounded-3xl opacity-20 transform rotate-12 animate-float"></div>
          <div className="absolute bottom-32 left-20 w-72 h-72 bg-blue-400 rounded-full opacity-15 animate-float" style={{animationDelay: '1s'}}></div>
          <div className="relative z-10">

            <div className="mb-8">
               <div className="inline-flex items-center justify-center w-36 h-36 rounded-2xl p-2 mb-6 shadow-xl ring-1 ring-gray-200 bg-white hover:scale-105 transition-transform duration-300">
                 <div className="w-full h-full rounded-xl flex items-center justify-center p-2">
                   <img src="/Devugo Tech.png" alt="Devugo Tech" className="h-24 w-auto object-contain select-none" />
                 </div>
               </div>
               <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">Create Account</h1>
              <div className="w-20 h-1 bg-white opacity-50 mb-6 rounded-full"></div>
            </div>
            <p className="text-blue-100 leading-relaxed text-lg">Join Devugo Tech Admin to manage portfolio, blog, pricing, and more.</p>
          </div>
        </div>

        {/* Right form */}
        <div className="w-full lg:w-1/2 p-12 flex flex-col justify-center relative" style={{ background: 'linear-gradient(135deg, #F8FAFF 0%, #FFFFFF 100%)' }}>
          <div className="absolute -right-32 bottom-0 w-80 h-80 bg-blue-400 rounded-full opacity-5"></div>
          <div className="relative z-10 max-w-md mx-auto w-full">
             <div className="text-center mb-6">
              
              </div>
             <h2 className="text-4xl font-bold text-gray-900 mb-3">Sign Up</h2>
            <p className="text-gray-500 mb-8">Create your administrator account</p>

            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input name="name" placeholder="Devugo Admin" value={form.name} onChange={onChange} required className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-gray-900 placeholder-gray-400" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input name="email" type="email" placeholder="you@company.com" value={form.email} onChange={onChange} required className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-gray-900 placeholder-gray-400" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={onChange} required className="w-full pr-20 px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-gray-900 placeholder-gray-400" />
                  <button type="button" onClick={()=>setShowPassword(v=>!v)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-blue-600 font-semibold text-sm">{showPassword ? 'HIDE' : 'SHOW'}</button>
                </div>
              </div>
              <button
                className="w-full text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:brightness-110"
                style={{ background: 'linear-gradient(90deg, #0A65CC 0%, #083B8A 100%)' }}
                type="submit"
                disabled={loading}
              >{loading ? 'Creating...' : 'Create Account'}</button>
              {message && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg">{message}</div>}
              
              {/* Sign up with other options */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <a
                    href="/api/auth/google"
                    className="flex items-center justify-center bg-white text-gray-700 font-semibold py-3 rounded-xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all transform hover:scale-[1.02]"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </a>
                  <a
                    href="/api/auth/linkedin"
                    className="flex items-center justify-center bg-white text-gray-700 font-semibold py-3 rounded-xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all transform hover:scale-[1.02]"
                  >
                    <svg className="w-5 h-5 mr-2" fill="#0077B5" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                    </svg>
                    LinkedIn
                  </a>
                </div>
              </div>
            </form>
            <p className="text-center text-sm text-gray-600 mt-6 pt-4 border-t border-gray-200">Already have an account? <a href="/admin/login" className="text-blue-600 hover:text-blue-800 font-bold hover:underline">Login</a></p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float { 0%, 100% { transform: translateY(0px) rotate(12deg); } 50% { transform: translateY(-20px) rotate(12deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
      `}</style>
    </div>
  );
}