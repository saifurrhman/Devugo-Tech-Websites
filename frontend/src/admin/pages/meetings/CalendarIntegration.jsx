import React from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';

export default function CalendarIntegration() {
    return (
        <div className="admin-layout min-h-screen bg-[#0f172a] text-white">
            <AdminSidebar />
            <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                <AdminTopbar />

                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Calendar Integration</h1>
                    <p className="text-gray-400 text-sm mt-1">Sync your meetings with external calendars</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                    <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-6 flex items-center gap-4">
                        <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center text-3xl shadow-sm">
                            G
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg">Google Calendar</h3>
                            <p className="text-gray-400 text-sm">Sync events and check availability</p>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors">Connect</button>
                    </div>

                    <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-6 flex items-center gap-4">
                        <div className="w-16 h-16 bg-[#0078d4] text-white rounded-lg flex items-center justify-center text-3xl shadow-sm">
                            O
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg">Outlook Calendar</h3>
                            <p className="text-gray-400 text-sm">Sync with Office 365</p>
                        </div>
                        <button className="px-4 py-2 border border-gray-700 hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors">Connect</button>
                    </div>
                </div>
            </main>
        </div>
    );
}
