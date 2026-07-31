import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../../components/AdminSidebar';
import AdminTopbar from '../../../components/AdminTopbar';
import { MeetingAPI } from '../../../lib/api';
import LoadingState from '../../components/LoadingState';

export default function MeetingsCalendar() {
    const navigate = useNavigate();
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
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
        } finally {
            setLoading(false);
        }
    };

    // Calendar generation logic
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const generateCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        
        const days = [];
        // Empty slots for days before the 1st
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }
        
        // Days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const getMeetingsForDay = (date) => {
        if (!date) return [];
        return meetings.filter(m => {
            const meetingDateStr = m.scheduledDate || m.date || '';
            const meetingDate = new Date(meetingDateStr);
            if (isNaN(meetingDate)) return false;
            return meetingDate.getDate() === date.getDate() &&
                   meetingDate.getMonth() === date.getMonth() &&
                   meetingDate.getFullYear() === date.getFullYear();
        });
    };

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
        <div className="admin-layout min-h-screen bg-[#0f172a] text-white">
            <AdminSidebar />
            <main className="admin-content w-full px-4 sm:px-6 lg:px-8 py-6">
                <AdminTopbar />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Meeting Calendar</h1>
                        <p className="text-gray-400 text-sm mt-1">View and manage your upcoming meetings</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/admin/meetings')}
                            className="px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors text-sm flex items-center gap-2"
                        >
                            📋 List View
                        </button>
                        <button
                            onClick={() => navigate('/admin/meetings/schedule')}
                            className="btn-primary bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <span>+</span> New Meeting
                        </button>
                        <button
                            onClick={() => navigate('/admin/settings/integrations')}
                            className="px-4 py-2 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/30 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            🔔 Email Reminders Setup
                        </button>
                    </div>
                </div>

                <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-6 overflow-hidden">
                    {/* Calendar Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </h2>
                        <div className="flex gap-2">
                            <button onClick={prevMonth} className="p-2 border border-gray-700 rounded hover:bg-gray-800">
                                &lt;
                            </button>
                            <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 border border-gray-700 rounded hover:bg-gray-800 text-sm">
                                Today
                            </button>
                            <button onClick={nextMonth} className="p-2 border border-gray-700 rounded hover:bg-gray-800">
                                &gt;
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <LoadingState message="Loading calendar..." />
                    ) : (
                        <div className="overflow-x-auto">
                            <div className="min-w-[800px]">
                                {/* Weekday Headers */}
                                <div className="grid grid-cols-7 border-b border-gray-700 pb-2">
                                    {weekDays.map(day => (
                                        <div key={day} className="text-center text-sm font-medium text-gray-400 uppercase tracking-wider">
                                            {day}
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Calendar Grid */}
                                <div className="grid grid-cols-7 gap-px bg-gray-800 mt-2 rounded-lg overflow-hidden border border-gray-800">
                                    {generateCalendar().map((date, i) => {
                                        const dayMeetings = getMeetingsForDay(date);
                                        const isToday = date && date.toDateString() === new Date().toDateString();
                                        
                                        return (
                                            <div 
                                                key={i} 
                                                className={`min-h-[120px] bg-[#1e293b] p-2 transition-colors ${date ? 'hover:bg-gray-800/50 cursor-pointer' : ''}`}
                                                onClick={() => {
                                                    if(date) navigate('/admin/meetings/schedule', { state: { date: date.toISOString() }});
                                                }}
                                            >
                                                {date && (
                                                    <>
                                                        <div className={`text-right text-sm mb-1 ${isToday ? 'font-bold text-blue-400' : 'text-gray-300'}`}>
                                                            {isToday ? (
                                                                <span className="bg-blue-600/20 text-blue-400 w-7 h-7 inline-flex items-center justify-center rounded-full">
                                                                    {date.getDate()}
                                                                </span>
                                                            ) : (
                                                                <span>{date.getDate()}</span>
                                                            )}
                                                        </div>
                                                        <div className="space-y-1 mt-2">
                                                            {dayMeetings.slice(0, 3).map((m, idx) => (
                                                                <div 
                                                                    key={m._id || m.id || idx}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        navigate(`/admin/meetings/${m._id || m.id}`);
                                                                    }}
                                                                    className={`text-xs p-1.5 rounded truncate ${
                                                                        m.type === 'discovery' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 
                                                                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                                    }`}
                                                                    title={m.title}
                                                                >
                                                                    {m.time || (m.scheduledDate && new Date(m.scheduledDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}))} - {m.title}
                                                                </div>
                                                            ))}
                                                            {dayMeetings.length > 3 && (
                                                                <div className="text-xs text-gray-500 text-center mt-1">
                                                                    +{dayMeetings.length - 3} more
                                                                </div>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
