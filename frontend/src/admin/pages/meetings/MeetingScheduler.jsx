import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { MeetingAPI } from '../../lib/api';

export default function MeetingScheduler() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        time: '',
        duration: '30m',
        attendees: '',
        description: ''
    });

    async function handleSchedule() {
        if (!formData.title || !formData.date || !formData.time) {
            alert('Please fill in all required fields (Title, Date, Time)');
            return;
        }

        setLoading(true);
        try {
            await MeetingAPI.schedule({
                ...formData,
                attendees: formData.attendees.split(',').map(e => e.trim()).filter(e => e)
            });
            alert('Meeting scheduled successfully!');
            navigate('/admin/meetings');
        } catch (error) {
            console.error('Failed to schedule meeting:', error);
            alert('Failed to schedule meeting. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="admin-layout min-h-screen bg-[#0f172a] text-white">
            <AdminSidebar />
            <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                <AdminTopbar />

                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Schedule Meeting</h1>
                    <p className="text-gray-400 text-sm mt-1">Set up a new appointment</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 card bg-[#1e293b] rounded-xl border border-gray-800 p-6">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Meeting Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Product Demo"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Date</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Time</label>
                                    <input
                                        type="time"
                                        value={formData.time}
                                        onChange={e => setFormData({ ...formData, time: e.target.value })}
                                        className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Duration</label>
                                <div className="flex gap-2">
                                    {['15m', '30m', '45m', '1h'].map(d => (
                                        <button
                                            key={d}
                                            onClick={() => setFormData({ ...formData, duration: d })}
                                            className={`px-4 py-2 border rounded-lg text-sm transition-colors ${formData.duration === d
                                                    ? 'bg-blue-600 border-blue-600 text-white'
                                                    : 'border-gray-700 hover:bg-gray-800 hover:border-gray-600'
                                                }`}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Attendees</label>
                                <input
                                    type="text"
                                    placeholder="Add email addresses (comma separated)..."
                                    value={formData.attendees}
                                    onChange={e => setFormData({ ...formData, attendees: e.target.value })}
                                    className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500 h-32 resize-none"
                                    placeholder="Meeting agenda..."
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                                <button
                                    onClick={() => navigate('/admin/meetings')}
                                    className="px-6 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSchedule}
                                    disabled={loading}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Scheduling...' : 'Schedule'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-6">
                            <h3 className="font-semibold mb-4">Availability</h3>
                            <div className="text-sm text-gray-400 mb-4">
                                Checking calendar for conflicts...
                            </div>
                            <div className="flex items-center gap-2 text-green-400 text-sm">
                                <span>✓</span> No conflicts found
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
