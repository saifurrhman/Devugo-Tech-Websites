import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthAPI } from '../../lib/api';
import { useNotification } from '../../contexts/NotificationContext';

export default function AcceptInvitation() {
    const { token } = useParams();
    const navigate = useNavigate();
    const { error: showError, success: showSuccess } = useNotification();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            showError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const response = await AuthAPI.acceptInvitation({ token, password });
            showSuccess('Account activated! logging you in...');

            if (response.user && response.accessToken) {
                localStorage.setItem('adminToken', response.accessToken);
                localStorage.setItem('adminUser', JSON.stringify(response.user));
            }

            setTimeout(() => navigate('/admin'), 1500);
        } catch (err) {
            showError(err.message || 'Failed to activate account');
        } finally {
            setLoading(false);
        }
    };

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
                            <h2 className="text-xl font-medium text-white/90 mb-4">Accept Invitation</h2>
                        </div>

                        <p className="text-blue-100 leading-relaxed">
                            You have been invited to join the team. Please set your password to activate your account and access the admin portal.
                        </p>

                        <div className="mt-10 space-y-3">
                            <div className="flex items-center text-white">
                                <svg className="w-5 h-5 mr-3 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-blue-50">Secure Account Activation</span>
                            </div>
                            <div className="flex items-center text-white">
                                <svg className="w-5 h-5 mr-3 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-blue-50">Instant Access</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Form */}
                    <div className="w-full lg:w-1/2 p-8 flex flex-col justify-center relative" style={{ background: 'linear-gradient(135deg, #F8FAFF 0%, #FFFFFF 100%)' }}>
                        <div className="absolute -right-32 bottom-0 w-80 h-80 bg-blue-400 rounded-full opacity-5"></div>

                        <div className="relative z-10 max-w-md mx-auto w-full">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Set Password</h2>
                            <p className="text-gray-500 mb-6 text-sm">Create a secure password to continue</p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* New Password Input */}
                                <div className="group">
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">New Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            minLength={6}
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

                                {/* Confirm Password Input */}
                                <div className="group">
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Confirm Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            minLength={6}
                                            className="w-full pl-10 pr-16 py-2.5 bg-blue-50/50 border border-blue-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 placeholder-gray-400"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(v => !v)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-600 hover:text-blue-700 text-xs font-medium transition-colors"
                                        >
                                            {showConfirmPassword ? 'HIDE' : 'SHOW'}
                                        </button>
                                    </div>
                                </div>

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
                                            Activating Account...
                                        </span>
                                    ) : (
                                        'Set Password & Login'
                                    )}
                                </button>
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
