import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthAPI } from '../../lib/api';

export default function ResetPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  async function handleSendOTP(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);
    try {
      const res = await AuthAPI.sendOTP(email);
      setStep(2);
      setMessage(res.message || 'OTP sent! Please check your email.');
      setIsError(false);
    } catch (err) {
      setIsError(true);
      setMessage(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);
    try {
      const res = await AuthAPI.resetPasswordWithOTP({ email, otp, newPassword });
      setMessage(res.message || 'Password reset successful!');
      setIsError(false);

      // Redirect after success
      setTimeout(() => {
        window.location.href = '/admin/login';
      }, 2000);
    } catch (err) {
      setIsError(true);
      setMessage(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0A65CC 0%, #083B8A 60%, #052A63 100%)' }}
    >
      {/* Background accents */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute bottom-32 right-32 w-96 h-96 bg-blue-400 rounded-full opacity-15 animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-20 left-1/4 w-48 h-48 bg-blue-600 rounded-full opacity-25 animate-pulse" style={{ animationDelay: '0.5s' }}></div>

      <div className="flex w-full max-w-4xl mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-fadeIn">
        {/* Left banner */}
        <div
          className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0A65CC 0%, #083B8A 60%, #052A63 100%)' }}
        >
          <div className="relative z-10 text-white">
            <div className="inline-flex items-center justify-center w-36 h-36 bg-white rounded-2xl shadow-lg p-3 mb-6 border border-gray-200">
              <div className="w-full h-full rounded-xl flex items-center justify-center p-2">
                <img src="/Devugo Tech.png" alt="Devugo Tech" className="w-28 h-40 object-contain" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4 tracking-tight">Reset Password</h1>
            <p className="text-blue-100 leading-relaxed text-lg">Enter your email to receive a secure password reset OTP.</p>
          </div>
        </div>

        {/* Right form */}
        <div className="w-full lg:w-1/2 p-12 flex flex-col justify-center relative" style={{ background: 'linear-gradient(135deg, #F8FAFF 0%, #FFFFFF 100%)' }}>
          <div className="relative z-10 max-w-md mx-auto w-full">
            {/* Brand Logo (all screens) */}

            <h2 className="text-3xl font-bold text-gray-900 mb-3">{step === 1 ? 'Forgot your password?' : 'Enter OTP'}</h2>
            <p className="text-gray-500 mb-8">{step === 1 ? 'We will send you a code to reset it.' : `Code sent to ${email}`}</p>

            {step === 1 ? (
              <form onSubmit={handleSendOTP} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-gray-900 placeholder-gray-400" />
                </div>
                <button
                  className="w-full text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:brightness-110"
                  style={{ background: 'linear-gradient(90deg, #0A65CC 0%, #083B8A 100%)' }}
                  type="submit"
                  disabled={loading}
                >{loading ? 'Sending...' : 'Send OTP Code'}</button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">6-Digit OTP</label>
                  <input
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength={6}
                    name="otp_code_public"
                    autoComplete="off"
                    data-lpignore="true"
                    inputMode="numeric"
                    className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 text-center tracking-widest text-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" /></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4-8-11-8-11 8-11 8z" /><circle cx="12" cy="12" r="3" /></svg>
                      )}
                    </button>
                  </div>
                </div>
                <button
                  className="w-full text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:brightness-110"
                  style={{ background: 'linear-gradient(90deg, #0A65CC 0%, #083B8A 100%)' }}
                  type="submit"
                  disabled={loading}
                >{loading ? 'Verifying...' : 'Reset Password'}</button>
              </form>
            )}

            {message && (
              <div className={`mt-4 px-4 py-3 rounded-lg border-l-4 ${isError ? 'bg-red-50 border-red-500 text-red-700' : 'bg-blue-50 border-blue-500 text-blue-700'}`}>
                {message}
              </div>
            )}

            <p className="text-center text-sm text-gray-600 mt-6 pt-4 border-t border-gray-200">
              <Link to="/admin/login" className="text-blue-600 hover:text-blue-800 font-bold hover:underline">Back to Login</Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
      `}</style>
    </div>
  );
}
