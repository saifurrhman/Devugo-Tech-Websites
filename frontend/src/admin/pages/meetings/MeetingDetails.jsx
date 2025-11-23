import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopbar from '../../components/AdminTopbar';
import { MeetingAPI } from '../../lib/api';

export default function MeetingDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [meeting, setMeeting] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadMeeting();
    }, [id]);

    async function loadMeeting() {
        try {
            setLoading(true);
            const data = await MeetingAPI.get(id);
            setMeeting(data);
            setError(null);
        } catch (err) {
            console.error('Failed to load meeting:', err);
            setError('Failed to load meeting details');
            // Fallback mock data
            setMeeting({
                _id: id,
                title: 'Demo with Acme Corp',
                date: '2024-06-15',
                time: '14:00',
                duration: '30m',
                type: 'Video Call',
                link: 'https://meet.google.com/abc-defg-hij',
                description: '1. Introduction and team overview\n2. Product demonstration covering key features\n3. Q&A session\n4. Next steps and pricing discussion',
                attendees: [
                    { name: 'You', role: 'Organizer', status: 'accepted' },
                    { name: 'John Doe', role: 'Guest', status: 'accepted' },
                    { name: 'Sarah Smith', role: 'Guest', status: 'pending' }
                ]
            });
        } finally {
            setLoading(false);
        }
    }

    async function handleCancel() {
        if (!window.confirm('Are you sure you want to cancel this meeting?')) return;

        try {
            await MeetingAPI.cancel(id);
            alert('Meeting cancelled successfully');
            navigate('/admin/meetings');
        } catch (err) {
            console.error('Failed to cancel meeting:', err);
            alert('Failed to cancel meeting');
        }
    }

    if (loading) return <div className="p-8 text-center text-white">Loading meeting details...</div>;
    if (!meeting) return <div className="p-8 text-center text-white">Meeting not found</div>;

    return (
        <div className="admin-layout min-h-screen bg-[#0f172a] text-white">
            <AdminSidebar />
            <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                <AdminTopbar />

                <div className="mb-6">
                    <button onClick={() => navigate('/admin/meetings')} className="text-sm text-gray-400 hover:text-white mb-2">← Back to Meetings</button>
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold">{meeting.title}</h1>
                            <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
                                <span className="flex items-center gap-1">📅 {meeting.date}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">🕒 {meeting.time} ({meeting.duration})</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">📹 {meeting.type || 'Video Call'}</span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors text-sm text-red-400 hover:border-red-900"
                            >
                                Cancel Meeting
                            </button>
                            <button className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors text-sm font-medium">Join Meeting</button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-6">
                            <h3 className="font-semibold mb-4">Agenda</h3>
                            <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                                {meeting.description || 'No agenda provided.'}
                            </p>
                        </div>

                        <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-6">
                            <h3 className="font-semibold mb-4">Meeting Link</h3>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={meeting.link || 'Link not generated yet'}
                                    readOnly
                                    className="flex-1 bg-[#0f172a] border border-gray-700 rounded px-3 py-2 text-gray-300 outline-none"
                                />
                                <button
                                    onClick={() => navigator.clipboard.writeText(meeting.link)}
                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-6">
                            <h3 className="font-semibold mb-4">Attendees ({meeting.attendees?.length || 0})</h3>
                            <div className="space-y-4">
                                {meeting.attendees?.map((attendee, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full ${attendee.name === 'You' ? 'bg-blue-600' : 'bg-gray-700'} flex items-center justify-center text-xs font-bold`}>
                                            {attendee.name === 'You' ? 'You' : attendee.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium">{attendee.name}</div>
                                            <div className={`text-xs ${attendee.status === 'accepted' ? 'text-green-400' :
                                                    attendee.status === 'pending' ? 'text-yellow-400' : 'text-gray-500'
                                                } capitalize`}>{attendee.status || attendee.role}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
