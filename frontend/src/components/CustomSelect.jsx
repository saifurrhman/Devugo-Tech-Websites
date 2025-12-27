import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function CustomSelect({
    options = [],
    value,
    onChange,
    placeholder = "Select...",
    className = "",
    groups = false // If true, expects options as [{label: "Group Name", options: [...]}]
}) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedLabel = (() => {
        if (!value) return placeholder;

        if (groups) {
            for (const group of options) {
                const found = group.options.find(opt => opt.value === value);
                if (found) return found.label;
            }
        } else {
            const found = options.find(opt => opt.value === value);
            if (found) return found.label;
        }
        return value; // Fallback
    })();

    const handleSelect = (val) => {
        onChange(val);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-[#002747] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-left flex justify-between items-center transition-colors"
            >
                <span className="truncate">{selectedLabel}</span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#002747] border border-white/10 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto custom-scrollbar backdrop-blur-sm">
                    {groups ? (
                        options.map((group, groupIndex) => (
                            <div key={groupIndex}>
                                {group.label && (
                                    <div className="px-3 py-2 text-xs font-semibold text-gray-400 bg-[#003560]/50 uppercase tracking-wider sticky top-0">
                                        {group.label}
                                    </div>
                                )}
                                {group.options.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => handleSelect(opt.value)}
                                        className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-blue-600/20 hover:text-blue-200 ${value === opt.value ? 'bg-blue-600 text-white' : 'text-gray-200'
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        ))
                    ) : (
                        options.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => handleSelect(opt.value)}
                                className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-blue-600/20 hover:text-blue-200 ${value === opt.value ? 'bg-blue-600 text-white' : 'text-gray-200'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))
                    )}

                    {(!options || options.length === 0) && (
                        <div className="px-4 py-3 text-center text-gray-500 text-sm">
                            No options available
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
