import React from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';

export default function CampaignSchedule() {
    const scheduledCampaigns = [
        { id: 1, name: 'Re-engagement', date: '2024-07-01', time: '09:00 AM', recipients: 2400 },
        { id: 2, name: 'Product Update', date: '2024-07-05', time: '02:00 PM', recipients: 5000 },
        { id: 3, name: 'Webinar Invite', date: '2024-07-10', time: '10:00 AM', recipients: 1200 },
    ];

    return (
        <div className="admin-layout min-h-screen bg-[#0f172a] text-white">
            <AdminSidebar />
            <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                <AdminTopbar />

                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Scheduled Campaigns</h1>
                    <p className="text-gray-400 text-sm mt-1">View and manage upcoming email sends</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-6">
                            <h3 className="font-semibold mb-4">Upcoming Schedule</h3>
                            <div className="space-y-4">
                                {scheduledCampaigns.map((campaign) => (
                                    <div key={campaign.id} className="flex items-center gap-4 p-4 bg-[#0f172a] rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                                        <div className="w-16 text-center bg-gray-800 rounded p-2">
                                            <div className="text-xs text-red-400 uppercase font-bold">{new Date(campaign.date).toLocaleString('default', { month: 'short' })}</div>
                                            <div className="text-xl font-bold">{new Date(campaign.date).getDate()}</div>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-lg">{campaign.name}</h4>
                                            <div className="text-sm text-gray-400 flex items-center gap-3 mt-1">
                                                <span>🕒 {campaign.time}</span>
                                                <span>👥 {campaign.recipients.toLocaleString()} recipients</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="px-3 py-1.5 text-sm border border-gray-600 rounded hover:bg-gray-800">Reschedule</button>
                                            <button className="px-3 py-1.5 text-sm text-red-400 border border-gray-600 rounded hover:bg-gray-800 hover:border-red-900">Cancel</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-6">
                            <h3 className="font-semibold mb-4">Calendar View</h3>
                            <div className="bg-[#0f172a] rounded-lg p-4 text-center text-gray-500 h-64 flex items-center justify-center border border-gray-700">
                                [Calendar Component Placeholder]
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
