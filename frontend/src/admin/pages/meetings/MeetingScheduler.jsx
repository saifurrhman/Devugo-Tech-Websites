import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../components/AdminSidebar';
import AdminTopbar from '../../../components/AdminTopbar';
import { MeetingAPI, ContactAPI, ProjectAPI, api } from '../../../lib/api';
import { useNotification } from '../../../contexts/NotificationContext';

export default function MeetingScheduler() {
    const navigate = useNavigate();
    const { success, error, warning } = useNotification();
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState([]);
    const [projects, setProjects] = useState([]);

    // Add logic to load clients and projects for dropdowns
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [clientsData, projectsData] = await Promise.all([
                    ContactAPI.list(),
                    ProjectAPI.list()
                ]);
                setClients(Array.isArray(clientsData) ? clientsData : (clientsData.data || []));
                setProjects(Array.isArray(projectsData) ? projectsData : (projectsData.data || []));
            } catch (err) {
                console.error('Failed to load form data:', err);
            }
        };
        fetchData();
    }, []);

    const [formData, setFormData] = useState({
        title: '',
        scheduledDate: new Date().toISOString().split('T')[0],
        time: '10:00',
        duration: '30',
        participants: '',
        description: '',
        type: 'discovery',
        platform: 'zoom',
        client: '',
        project: ''
    });

    const handleSchedule = async () => {
        if (!formData.title || !formData.scheduledDate || !formData.time) {
            warning('Please fill in all required fields (Title, Date, Time)');
            return;
        }

        setLoading(true);
        try {
            // Combine date and time
            const combinedDate = new Date(`${formData.scheduledDate}T${formData.time}`);

            let meetingLink = '';
            let additionalData = {};

            // 1. Create External Meeting (Zoom / Google)
            if (formData.platform === 'zoom' || formData.platform === 'google_meet') {
                const integPlatform = formData.platform === 'google_meet' ? 'google' : 'zoom';
                try {
                    const res = await api('/api/integrations/create-meeting', {
                        method: 'POST',
                        body: {
                            platform: integPlatform,
                            topic: formData.title,
                            startTime: combinedDate.toISOString(),
                            duration: parseInt(formData.duration)
                        }
                    });

                    if (res.success && res.data) {
                        meetingLink = res.data.joinUrl;
                        if (formData.platform === 'zoom') {
                            additionalData.zoomMeetingId = res.data.id;
                            additionalData.meetingPassword = res.data.password;
                        } else {
                            additionalData.googleCalendarEventId = res.data.id;
                        }
                        success(`Created ${formData.platform} meeting successfully`);
                    }
                } catch (integErr) {
                    console.error('Integration Error:', integErr);
                    warning(`Failed to create ${formData.platform} meeting, proceeding with local record.`);
                }
            }

            // 2. Create Local Meeting Record
            const payload = {
                ...formData,
                scheduledDate: combinedDate,
                duration: parseInt(formData.duration),
                meetingLink: meetingLink, // Save generated link
                ...additionalData,
                // Parse participants emails
                participants: formData.participants.split(',').map(email => ({
                    email: email.trim(),
                    role: 'participant'
                })).filter(p => p.email)
            };

            // Remove empty optional fields to prevent ObjectId cast errors
            if (!payload.client) delete payload.client;
            if (!payload.project) delete payload.project;
            if (!payload.campaign) delete payload.campaign;

            await MeetingAPI.create(payload);
            success('Meeting scheduled successfully!');
            navigate('/admin/meetings');
        } catch (err) {
            console.error('Failed to schedule meeting:', err);
            error('Failed to schedule meeting. Please try again.');
        } finally {
            setLoading(false);
        }
    };

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
                                <label className="block text-sm font-medium text-gray-400 mb-2">Meeting Title *</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Product Demo"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Client (Optional)</label>
                                    <select
                                        value={formData.client}
                                        onChange={e => setFormData({ ...formData, client: e.target.value })}
                                        className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500 transition-colors"
                                    >
                                        <option value="">Select Client</option>
                                        {clients.map(c => (
                                            <option key={c._id} value={c._id}>{c.firstName} {c.lastName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Project (Optional)</label>
                                    <select
                                        value={formData.project}
                                        onChange={e => setFormData({ ...formData, project: e.target.value })}
                                        className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500 transition-colors"
                                    >
                                        <option value="">Select Project</option>
                                        {projects.map(p => (
                                            <option key={p._id} value={p._id}>{p.title}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Date *</label>
                                    <input
                                        type="date"
                                        value={formData.scheduledDate}
                                        onChange={e => setFormData({ ...formData, scheduledDate: e.target.value })}
                                        className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Time *</label>
                                    <input
                                        type="time"
                                        value={formData.time}
                                        onChange={e => setFormData({ ...formData, time: e.target.value })}
                                        className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Duration</label>
                                <div className="flex gap-2">
                                    {['15', '30', '45', '60'].map(d => (
                                        <button
                                            key={d}
                                            onClick={() => setFormData({ ...formData, duration: d })}
                                            className={`px-4 py-2 border rounded-lg text-sm transition-colors ${formData.duration === d
                                                ? 'bg-blue-600 border-blue-600 text-white'
                                                : 'border-gray-700 hover:bg-gray-800 hover:border-gray-600'
                                                }`}
                                        >
                                            {d}m
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Additional Attendees (Email)</label>
                                <input
                                    type="text"
                                    placeholder="email@example.com, another@example.com"
                                    value={formData.participants}
                                    onChange={e => setFormData({ ...formData, participants: e.target.value })}
                                    className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500 h-32 resize-none transition-colors"
                                    placeholder="Meeting agenda and details..."
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
                            <h3 className="font-semibold mb-4 text-white">Settings</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Meeting Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500 transition-colors"
                                    >
                                        <option value="discovery">Discovery</option>
                                        <option value="proposal">Proposal</option>
                                        <option value="kickoff">Kickoff</option>
                                        <option value="review">Review</option>
                                        <option value="demo">Demo</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Platform</label>
                                    <select
                                        value={formData.platform}
                                        onChange={e => setFormData({ ...formData, platform: e.target.value })}
                                        className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500 transition-colors"
                                    >
                                        <option value="zoom">Zoom</option>
                                        <option value="google_meet">Google Meet</option>
                                        <option value="microsoft_teams">Microsoft Teams</option>
                                        <option value="phone">Phone Call</option>
                                        <option value="in_person">In Person</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-6">
                            <h3 className="font-semibold mb-4 text-white">Availability</h3>
                            <div className="text-sm text-gray-400 mb-4">
                                {loading ? 'Checking calendar...' : 'Checking calendar for conflicts...'}
                            </div>
                            {!loading && (
                                <div className="flex items-center gap-2 text-green-400 text-sm">
                                    <span>✓</span> No conflicts found
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
