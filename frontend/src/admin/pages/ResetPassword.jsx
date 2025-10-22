import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthAPI } from '../../lib/api';

export default function ResetPassword(){
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function onSubmit(e){
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try{
      await AuthAPI.requestReset(email);
      setMessage('If an account exists for this email, a reset link has been sent.');
    }catch(err){
      setMessage(err.message || 'Could not send reset link.');
    }finally{
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
      <div className="absolute bottom-32 right-32 w-96 h-96 bg-blue-400 rounded-full opacity-15 animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-20 left-1/4 w-48 h-48 bg-blue-600 rounded-full opacity-25 animate-pulse" style={{animationDelay: '0.5s'}}></div>

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
            <p className="text-blue-100 leading-relaxed text-lg">Enter your email to receive a secure password reset link.</p>
          </div>
        </div>

        {/* Right form */}
        <div className="w-full lg:w-1/2 p-12 flex flex-col justify-center relative" style={{ background: 'linear-gradient(135deg, #F8FAFF 0%, #FFFFFF 100%)' }}>
          <div className="relative z-10 max-w-md mx-auto w-full">
            {/* Brand Logo (all screens) */}
             
             <h2 className="text-3xl font-bold text-gray-900 mb-3">Forgot your password?</h2>
            <p className="text-gray-500 mb-8">We will send you a link to reset it.</p>

            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input type="email" placeholder="you@company.com" value={email} onChange={(e)=>setEmail(e.target.value)} required className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-gray-900 placeholder-gray-400" />
              </div>
              <button
                className="w-full text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:brightness-110"
                style={{ background: 'linear-gradient(90deg, #0A65CC 0%, #083B8A 100%)' }}
                type="submit"
                disabled={loading}
              >{loading ? 'Sending...' : 'Send reset link'}</button>
              {message && <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 px-4 py-3 rounded-lg">{message}</div>}
            </form>
            <p className="text-center text-sm text-gray-600 mt-6 pt-4 border-t border-gray-200"><Link to="/admin/login" className="text-blue-600 hover:text-blue-800 font-bold hover:underline">Back to Login</Link></p>
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
