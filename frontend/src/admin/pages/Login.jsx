import React, { useState, useEffect } from 'react';
import { AuthAPI } from '../../lib/api';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    
    if (token && user) {
      navigate('/admin');
    }
    
    const remembered = localStorage.getItem('rememberAdmin');
    if (remembered) {
      setRememberMe(true);
    }
  }, [navigate]); 

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const data = await AuthAPI.login({ 
        email: form.email, 
        password: form.password 
      });

      console.log('Login response:', data);

      if (!data.accessToken || !data.user) {
        throw new Error(data.message || 'Login response missing token or user.');
      }

      localStorage.setItem('adminToken', data.accessToken);
      localStorage.setItem('adminUser', JSON.stringify(data.user));
      
      if (rememberMe) {
        localStorage.setItem('rememberAdmin', '1');
      } else {
        localStorage.removeItem('rememberAdmin');
      }

      console.log('Stored token:', data.accessToken);
      console.log('Stored user:', JSON.stringify(data.user));

      window.dispatchEvent(new CustomEvent('notify', {
        detail: { type: 'success', message: 'Login successful! Redirecting to dashboard...' }
      }));

      setTimeout(() => {
        window.location.replace('/admin');
      }, 2000);

    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setMessage(errorMessage);
      
      window.dispatchEvent(new CustomEvent('notify', {
        detail: { type: 'error', message: errorMessage }
      }));
      
      setLoading(false);
    }
  }

  /*
  // OAuth login function ki ab zaroorat nahi
  const handleOAuthLogin = (provider) => {
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    window.location.href = `${API_BASE_URL}/auth/${provider}`;
  };
  */

  return (
    <>
      <div
        className="flex items-center justify-center min-h-screen relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0E2F4A 0%, #0B3B63 60%, #07253F 100%)'
        }}
      >
        {/* Background decorations */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-32 right-32 w-96 h-96 bg-blue-400 rounded-full opacity-15 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-48 h-48 bg-blue-600 rounded-full opacity-25 animate-pulse" style={{ animationDelay: '0.5s' }}></div>

        <div className="flex w-full max-w-6xl mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-fadeIn">
          {/* Left Side - Welcome Section */}
          <div
            className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0E2F4A 0%, #0B3B63 60%, #07253F 100%)' }}
          >
            <div className="absolute top-16 left-16 w-40 h-40 bg-blue-500 rounded-full opacity-20 animate-float"></div>
            <div className="absolute bottom-32 left-20 w-72 h-72 bg-blue-400 rounded-full opacity-15 animate-float" style={{ animationDelay: '1s' }}></div>

            {/* Company Logo */}
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-xl p-2 mb-6 bg-white">
                <div className="w-full h-full flex items-center justify-center">
                  <img src="/Devugo Tech.png" alt="Devugo Tech" className="h-20 w-auto object-contain select-none" />
                </div>
              </div>

              <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">WELCOME</h1>
              <h2 className="text-xl font-medium text-white/90 mb-4">Admin Dashboard Portal</h2>
            </div>

            <p className="text-blue-100 leading-relaxed">
              Manage your business operations efficiently with our comprehensive admin panel. Access powerful tools and insights to drive your success.
            </p>

            <div className="mt-10 space-y-3">
              <div className="flex items-center text-white">
                <svg className="w-5 h-5 mr-3 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-blue-50">Secure & Reliable Access</span>
              </div>
              <div className="flex items-center text-white">
                <svg className="w-5 h-5 mr-3 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-blue-50">Real-time Analytics</span>
              </div>
              <div className="flex items-center text-white">
                <svg className="w-5 h-5 mr-3 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-blue-50">24/7 Support Available</span>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full lg:w-1/2 p-8 flex flex-col justify-center relative" style={{ background: 'linear-gradient(135deg, #F8FAFF 0%, #FFFFFF 100%)' }}>
            <div className="absolute -right-32 bottom-0 w-80 h-80 bg-blue-400 rounded-full opacity-5"></div>

            <div className="relative z-10 max-w-md mx-auto w-full">
              {/* Logo */}
              <div className="text-center mb-4">
                <img src="/Devugo Tech.png" alt="Devugo Tech" className="h-8 w-auto mx-auto drop-shadow" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In</h2>
              <p className="text-gray-500 mb-6 text-sm">Welcome back! Please enter your credentials</p>

              <form onSubmit={onSubmit} className="space-y-4">
                {/* Email Input */}
                <div className="group">
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Username or Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      name="email"
                      type="text"
                      placeholder="username@gmail.com"
                      value={form.email}
                      onChange={onChange}
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-blue-50/50 border border-blue-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="group">
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={onChange}
                      required
                      className="w-full pl-10 pr-16 py-2.5 bg-blue-50/50 border border-blue-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 placeholder-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-600 hover:text-blue-700 text-xs font-medium transition-colors"
                    >
                      {showPassword ? 'HIDE' : 'SHOW'}
                    </button>
                  </div>
                </div>

                {/* Remember me & Forgot Password */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center text-gray-700 cursor-pointer hover:text-gray-900 transition-colors">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-1.5 cursor-pointer"
                    />
                    <span className="font-medium">Remember me</span>
                  </label>
                  <a href="/admin/reset-password" className="text-blue-600 hover:text-blue-800 font-medium transition-colors hover:underline">
                    Forgot Password?
                  </a>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white font-medium py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                  style={{ background: 'linear-gradient(90deg, #0A65CC 0%, #083B8A 100%)' }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>

                {/* Error Message */}
                {message && (
                  <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-3 py-2 rounded-md flex items-start text-xs mt-4">
                    <svg className="h-4 w-4 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{message}</span>
                  </div>
                )} 

                {/*
                // ✅ DIVIDER "Or continue with" KO COMMENT KAR DIYA GAYA HAI
                //
                <div className="relative py-3 mt-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>
                */}

                {/*
                // ✅ OAuth BUTTONS (GOOGLE/LINKEDIN) KO COMMENT KAR DIYA GAYA HAI
                //
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleOAuthLogin('google')}
                    className="flex items-center justify-center py-2 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-xs"
                  >
                    ...
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOAuthLogin('linkedin')}
                    className="flex items-center justify-center py-2 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-xs"
                  >
                    ...
                    LinkedIn
                  </button>
                </div>
                */}

                {/* Sign Up Link */}
                <p className="text-center text-xs text-gray-600 mt-4 pt-3 border-t border-gray-200">
                  Don't have an account?{' '}
                  <a href="/admin/signup" className="text-blue-600 hover:text-blue-800 font-medium transition-colors hover:underline">
                    Sign Up Now
                  </a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(12deg); }
          50% { transform: translateY(-20px) rotate(12deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        `}
      </style>
    </>
  );
}