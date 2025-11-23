import React from 'react';

export default function TimeTracking() {
    const entries = [
        { id: 1, task: 'Design Homepage Mockup', user: 'John Doe', duration: '2h 30m', date: 'Today' },
        { id: 2, task: 'Implement Navigation', user: 'Sarah Smith', duration: '4h 15m', date: 'Yesterday' },
        { id: 3, task: 'Project Kickoff', user: 'Mike Ross', duration: '1h 00m', date: 'Jun 20' },
    ];

    return (
        <div className="card bg-[#1e293b] rounded-xl border border-gray-800 p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold">Time Log</h3>
                <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-xs font-medium transition-colors">
                    Log Time
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-800/50">
                        <tr>
                            <th className="px-4 py-2">Task</th>
                            <th className="px-4 py-2">User</th>
                            <th className="px-4 py-2">Duration</th>
                            <th className="px-4 py-2 text-right">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {entries.map((entry) => (
                            <tr key={entry.id} className="hover:bg-gray-800/30">
                                <td className="px-4 py-3 font-medium text-gray-200">{entry.task}</td>
                                <td className="px-4 py-3 text-gray-400">{entry.user}</td>
                                <td className="px-4 py-3 font-mono text-gray-300">{entry.duration}</td>
                                <td className="px-4 py-3 text-right text-gray-500">{entry.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between items-center">
                <div className="text-sm text-gray-400">Total Time: <span className="text-white font-bold">7h 45m</span></div>
                <button className="text-xs text-blue-400 hover:text-blue-300">View All Entries</button>
            </div>
        </div>
    );
}
