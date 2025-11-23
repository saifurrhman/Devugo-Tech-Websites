import React from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { AnalyticsAPI } from '../../lib/api';

export default function PerformanceReport() {
    return (
        <div className="admin-layout min-h-screen bg-[#0f172a] text-white">
            <AdminSidebar />
            <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                <AdminTopbar />

                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Performance Reports</h1>
                        <p className="text-gray-400 text-sm mt-1">Download and manage detailed analytics reports</p>
                    </div>
                    <button className="btn-primary px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium transition-colors">
                        Generate New Report
                    </button>
                </div>

                <div className="card bg-[#1e293b] rounded-xl border border-gray-800 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-800/50">
                            <tr>
                                <th className="px-6 py-3">Report Name</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Date Range</th>
                                <th className="px-6 py-3">Generated On</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {[
                                { name: 'Monthly Campaign Summary', type: 'PDF', range: 'May 1 - May 31, 2024', date: 'Jun 1, 2024' },
                                { name: 'Q2 Performance Review', type: 'Excel', range: 'Apr 1 - Jun 30, 2024', date: 'Jul 1, 2024' },
                                { name: 'Subscriber Growth Analysis', type: 'CSV', range: 'Jan 1 - Jun 30, 2024', date: 'Jul 2, 2024' },
                                { name: 'Weekly Deliverability Stats', type: 'PDF', range: 'Jun 24 - Jun 30, 2024', date: 'Jul 1, 2024' },
                            ].map((report, idx) => (
                                <tr key={idx} className="hover:bg-gray-800/30 transition-colors">
                                    <td className="px-6 py-4 font-medium text-white">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${report.type === 'PDF' ? 'bg-red-500/20 text-red-400' :
                                                report.type === 'Excel' ? 'bg-green-500/20 text-green-400' :
                                                    'bg-blue-500/20 text-blue-400'
                                                }`}>
                                                {report.type}
                                            </div>
                                            {report.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">{report.type}</td>
                                    <td className="px-6 py-4 text-gray-400">{report.range}</td>
                                    <td className="px-6 py-4 text-gray-400">{report.date}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-blue-400 hover:text-blue-300 mr-3">Download</button>
                                        <button className="text-gray-500 hover:text-red-400">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
