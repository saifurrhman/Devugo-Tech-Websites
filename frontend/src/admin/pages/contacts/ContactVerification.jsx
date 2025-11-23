import React, { useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';

export default function ContactVerification() {
    const [verifying, setVerifying] = useState(false);
    const [progress, setProgress] = useState(0);

    const startVerification = () => {
        setVerifying(true);
        setProgress(0);
        // Simulate progress
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setVerifying(false);
                    return 100;
                }
                return prev + 5;
            });
        }, 200);
    };

    return (
        <div className="admin-layout min-h-screen bg-[#0f172a] text-white">
            <AdminSidebar />
            <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                <AdminTopbar />

                <div className="mb-6">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <span className="text-green-400">✓</span> Email Verification
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Clean your lists and improve deliverability</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-6">
                        <h3 className="text-lg font-semibold mb-4">Bulk Verification</h3>
                        <p className="text-gray-400 text-sm mb-6">
                            Verify your entire contact list to remove invalid emails, spam traps, and catch-all addresses.
                        </p>

                        <div className="bg-[#0f172a] rounded-lg p-4 border border-gray-700 mb-6">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-400">Unverified Contacts</span>
                                <span className="font-bold">1,240</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Estimated Time</span>
                                <span className="font-bold">~5 mins</span>
                            </div>
                        </div>

                        {!verifying && progress !== 100 && (
                            <button
                                onClick={startVerification}
                                className="w-full btn-primary bg-green-600 hover:bg-green-500 py-3 rounded-lg font-medium transition-colors"
                            >
                                Start Verification
                            </button>
                        )}

                        {(verifying || progress === 100) && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm mb-1">
                                    <span>{progress === 100 ? 'Completed' : 'Verifying...'}</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                                    <div className="bg-green-500 h-full transition-all duration-200" style={{ width: `${progress}%` }}></div>
                                </div>
                                {progress === 100 && (
                                    <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm text-center">
                                        Verification complete! 1,150 valid, 90 invalid.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-6">
                        <h3 className="text-lg font-semibold mb-4">Single Email Check</h3>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Enter email address..."
                                className="flex-1 bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-green-500"
                            />
                            <button className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors">Check</button>
                        </div>

                        <div className="mt-8">
                            <h4 className="text-sm font-semibold text-gray-400 mb-3">Verification Checks</h4>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-xs">✓</span>
                                    <span>Syntax Check</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-xs">✓</span>
                                    <span>Domain Validity</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-xs">✓</span>
                                    <span>MX Record Check</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-xs">✓</span>
                                    <span>SMTP Handshake</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
