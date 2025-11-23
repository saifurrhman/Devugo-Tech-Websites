import React from 'react';

export default function TaskBoard() {
    const columns = [
        {
            id: 'todo', title: 'To Do', tasks: [
                { id: 1, title: 'Design Homepage Mockup', assignee: 'JD', priority: 'High', due: 'Tomorrow' },
                { id: 2, title: 'Setup Dev Environment', assignee: 'MR', priority: 'Medium', due: 'Jul 5' },
            ]
        },
        {
            id: 'in_progress', title: 'In Progress', tasks: [
                { id: 3, title: 'Implement Navigation', assignee: 'SS', priority: 'High', due: 'Today' },
            ]
        },
        {
            id: 'review', title: 'Review', tasks: [
                { id: 4, title: 'Content Audit', assignee: 'AC', priority: 'Low', due: 'Yesterday' },
            ]
        },
        {
            id: 'done', title: 'Done', tasks: [
                { id: 5, title: 'Project Kickoff', assignee: 'JD', priority: 'Medium', due: 'Jun 20' },
            ]
        },
    ];

    return (
        <div className="flex gap-6 overflow-x-auto pb-6 h-[calc(100vh-280px)]">
            {columns.map((col) => (
                <div key={col.id} className="min-w-[280px] w-[280px] flex flex-col bg-[#1e293b]/30 rounded-xl border border-gray-800/50">
                    <div className="p-4 flex justify-between items-center">
                        <h3 className="font-semibold text-sm">{col.title}</h3>
                        <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full text-gray-400">{col.tasks.length}</span>
                    </div>

                    <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                        {col.tasks.map((task) => (
                            <div key={task.id} className="bg-[#1e293b] p-3 rounded-lg border border-gray-700 hover:border-blue-500 cursor-pointer shadow-sm group">
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${task.priority === 'High' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                            task.priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                        }`}>{task.priority}</span>
                                    <button className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100">•••</button>
                                </div>
                                <h4 className="text-sm font-medium mb-3 text-gray-200">{task.title}</h4>
                                <div className="flex justify-between items-center">
                                    <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300">
                                        {task.assignee}
                                    </div>
                                    <div className="text-xs text-gray-500">{task.due}</div>
                                </div>
                            </div>
                        ))}
                        <button className="w-full py-2 text-sm text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                            + Add Task
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
