import React from 'react';

export default function Badge({ children, status = 'neutral', className = '' }) {
    // Default mapping based on status strings
    let colorKey = 'gray'; // neutral

    const statusMap = {
        green: ['active', 'published', 'completed', 'success', 'paid', 'sent', 'won'],
        blue: ['info', 'scheduled', 'in-progress', 'in progress', 'open', 'new'],
        orange: ['warning', 'recommended', 'pending', 'featured'],
        red: ['error', 'overdue', 'unpublished', 'critical', 'failed', 'danger', 'lost'],
        gray: ['draft', 'inactive', 'neutral', 'custom', 'subscription', 'one-time', 'closed']
    };

    const s = String(status).toLowerCase();
    
    if (statusMap.green.includes(s)) colorKey = 'green';
    else if (statusMap.blue.includes(s)) colorKey = 'blue';
    else if (statusMap.orange.includes(s)) colorKey = 'orange';
    else if (statusMap.red.includes(s)) colorKey = 'red';

    const colorClasses = {
        green: 'bg-emerald-500/10 border-emerald-500/45 text-emerald-500',
        blue: 'bg-blue-500/10 border-blue-500/45 text-blue-500',
        orange: 'bg-amber-500/10 border-amber-500/45 text-amber-500',
        red: 'bg-red-500/10 border-red-500/45 text-red-500',
        gray: 'bg-slate-500/10 border-slate-500/45 text-slate-400',
    };

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[0.7rem] font-medium border whitespace-nowrap uppercase tracking-wider ${colorClasses[colorKey]} ${className}`}>
            {children || status}
        </span>
    );
}
