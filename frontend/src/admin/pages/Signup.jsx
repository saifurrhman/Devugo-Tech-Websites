import React, { useState } from 'react';
import { AuthAPI } from '../../lib/api';
import { Check, X, Eye, EyeOff } from 'lucide-react';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Password Validation Logic
  const validations = {
    length: form.password.length >= 8,
    upper: /[A-Z]/.test(form.password),
    lower: /[a-z]/.test(form.password),
    number: /[0-9]/.test(form.password),
    special: /[@$!%*?&]/.test(form.password)
  };

  const isPasswordValid = Object.values(validations).every(Boolean);

  function getStrengthColor() {
    const passed = Object.values(validations).filter(Boolean).length;
    if (passed <= 2) return 'bg-red-500';
    if (passed <= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  }

  function getStrengthWidth() {
    const passed = Object.values(validations).filter(Boolean).length;
    return `${(passed / 5) * 100}%`;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const data = await AuthAPI.signup(form);

      // Check if we got the real token and user from the server
      if (!data.accessToken || !data.user) {
        throw new Error(data.message || 'Signup response missing token or user.');
      }

      // Store real token and user data
      localStorage.setItem('adminToken', data.accessToken);
      localStorage.setItem('adminUser', JSON.stringify(data.user));

      if (!localStorage.getItem('adminTheme')) localStorage.setItem('adminTheme', 'admin-dark');

      // Redirect to admin dashboard
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
      <div className="absolute bottom-32 right-32 w-96 h-96 bg-blue-400 rounded-full opacity-15 animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-20 left-1/4 w-48 h-48 bg-blue-600 rounded-full opacity-25 animate-pulse" style={{ animationDelay: '0.5s' }}></div>

      <div className="flex w-full max-w-6xl mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-fadeIn">
        {/* Left welcome */}
        <div
          className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0E2F4A 0%, #0B3B63 60%, #07253F 100%)' }}
        >
          <div className="absolute top-16 left-16 w-40 h-40 bg-blue-500 rounded-3xl opacity-20 transform rotate-12 animate-float"></div>
          <div className="absolute bottom-32 left-20 w-72 h-72 bg-blue-400 rounded-full opacity-15 animate-float" style={{ animationDelay: '1s' }}></div>
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
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-blue-600">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {form.password && (
                  <div className="mt-3 space-y-2">
                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                        style={{ width: getStrengthWidth() }}
                      ></div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div className={`flex items-center gap-1.5 ${validations.length ? 'text-green-600' : 'text-gray-500'}`}>
                        {validations.length ? <Check size={14} /> : <div className="w-3.5 h-3.5 rounded-full border border-gray-400"></div>}
                        Min 8 chars
                      </div>
                      <div className={`flex items-center gap-1.5 ${validations.upper ? 'text-green-600' : 'text-gray-500'}`}>
                        {validations.upper ? <Check size={14} /> : <div className="w-3.5 h-3.5 rounded-full border border-gray-400"></div>}
                        Uppercase
                      </div>
                      <div className={`flex items-center gap-1.5 ${validations.lower ? 'text-green-600' : 'text-gray-500'}`}>
                        {validations.lower ? <Check size={14} /> : <div className="w-3.5 h-3.5 rounded-full border border-gray-400"></div>}
                        Lowercase
                      </div>
                      <div className={`flex items-center gap-1.5 ${validations.number ? 'text-green-600' : 'text-gray-500'}`}>
                        {validations.number ? <Check size={14} /> : <div className="w-3.5 h-3.5 rounded-full border border-gray-400"></div>}
                        Number
                      </div>
                      <div className={`flex items-center gap-1.5 ${validations.special ? 'text-green-600' : 'text-gray-500'}`}>
                        {validations.special ? <Check size={14} /> : <div className="w-3.5 h-3.5 rounded-full border border-gray-400"></div>}
                        Special (@$!%*?&)
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <button
                style={{ background: 'linear-gradient(90deg, #0A65CC 0%, #083B8A 100%)' }}
                type="submit"
                disabled={loading || !isPasswordValid}
                className={`w-full text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:brightness-110 ${(!isPasswordValid || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >{loading ? 'Creating...' : 'Create Account'}</button>
              {message && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg">{message}</div>}
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