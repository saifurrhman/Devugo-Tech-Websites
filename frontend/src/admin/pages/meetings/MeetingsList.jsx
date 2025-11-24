import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../components/AdminSidebar';
import AdminTopbar from '../../../components/AdminTopbar';
import { MeetingAPI } from '../../../lib/api';

export default function MeetingsList() {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('upcoming');
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    React.useEffect(() => {
        loadMeetings();
    }, []);

    const loadMeetings = async () => {
        try {
            setLoading(true);
            const data = await MeetingAPI.list();
            const list = Array.isArray(data) ? data : (data.data || []);
            setMeetings(list);
        } catch (err) {
            console.error('Failed to load meetings:', err);
            setError('Failed to load meetings');
        } finally {
            setLoading(false);
        }
    };

    const filteredMeetings = filter === 'all' ? meetings : meetings.filter(m => (m.status || 'Upcoming').toLowerCase() === filter);

    if (loading) return (
        <div className="admin-layout min-h-screen bg-[#0f172a] text-white flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    return (
        <div className="admin-layout min-h-screen bg-[#0f172a] text-white">
            <AdminSidebar />
            <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                <AdminTopbar />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Meetings</h1>
                        <p className="text-gray-400 text-sm mt-1">Schedule and manage your appointments</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/admin/meetings/calendar')}
                            className="px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors text-sm"
                        >
                            📅 Calendar View
                        </button>
                        <button
                            onClick={() => navigate('/admin/meetings/schedule')}
                            className="btn-primary bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <span>+</span> Schedule Meeting
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {['upcoming', 'completed', 'cancelled', 'all'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-full text-sm border transition-colors capitalize whitespace-nowrap ${filter === f
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Meetings List */}
                <div className="space-y-4">
                    {filteredMeetings.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 bg-[#1e293b]/50 rounded-xl border border-dashed border-gray-800">
                            No meetings found.
                        </div>
                    ) : (
                        filteredMeetings.map((meeting) => (
                            <div
                                key={meeting.id || meeting._id}
                                onClick={() => navigate(`/admin/meetings/${meeting.id || meeting._id}`)}
                                className="card bg-[#1e293b] p-4 rounded-xl border border-gray-800 hover:border-blue-500/50 cursor-pointer transition-all flex flex-col sm:flex-row items-start sm:items-center gap-4"
                            >
                                <div className="w-16 h-16 bg-gray-800 rounded-lg flex flex-col items-center justify-center border border-gray-700 flex-shrink-0">
                                    <span className="text-xs text-red-400 font-bold uppercase">{(meeting.date || 'Today').split(' ')[0]}</span>
                                    <span className="text-xl font-bold">{(meeting.date || 'Today').includes(' ') ? (meeting.date || '').split(' ')[1] : ''}</span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-lg truncate">{meeting.title}</h3>
                                        <span className={`px-2 py-0.5 rounded text-[10px] border ${meeting.type === 'Video Call' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                            meeting.type === 'In-Person' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                            }`}>{meeting.type || 'Video Call'}</span>
                                    </div>
                                    <div className="text-sm text-gray-400 flex items-center gap-4">
                                        <span className="flex items-center gap-1">🕒 {meeting.time || 'TBD'} ({meeting.duration || '30m'})</span>
                                        <span className="flex items-center gap-1">👥 {(meeting.attendees || []).join(', ')}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                    <button className="flex-1 sm:flex-none px-4 py-2 border border-gray-700 rounded-lg text-sm hover:bg-gray-800 transition-colors">Reschedule</button>
                                    <button className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors">Join</button>
                                </div>
                            </div>
                        ))
                    )}

                    {filteredMeetings.length === 0 && (
                        <div className="text-center py-12 text-gray-500 bg-[#1e293b]/50 rounded-xl border border-dashed border-gray-800">
                            No meetings found.
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
