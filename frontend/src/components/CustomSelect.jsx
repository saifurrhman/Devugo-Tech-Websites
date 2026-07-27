import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomSelect({
    options = [],
    value,
    onChange,
    placeholder = "Select...",
    className = "",
    disabled = false,
    groups = false // If true, expects options as [{label: "Group Name", options: [...]}]
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [openUpwards, setOpenUpwards] = useState(false);
    
    const containerRef = useRef(null);
    const listboxRef = useRef(null);
    const buttonRef = useRef(null);

    // Flatten options for easy index calculation
    const flatOptions = useMemo(() => {
        if (!groups) return options;
        return options.reduce((acc, group) => {
            return [...acc, ...group.options];
        }, []);
    }, [options, groups]);

    const selectedLabel = (() => {
        if (value === undefined || value === null || value === '') return placeholder;
        const found = flatOptions.find(opt => opt.value === value || opt.value === Number(value) || String(opt.value) === String(value));
        return found ? found.label : value; 
    })();

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle smart positioning
    useEffect(() => {
        if (isOpen && buttonRef.current && listboxRef.current) {
            const buttonRect = buttonRef.current.getBoundingClientRect();
            const listboxRect = listboxRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            // If it goes off the bottom of the screen, open upwards
            if (buttonRect.bottom + listboxRect.height > windowHeight - 20) {
                setOpenUpwards(true);
            } else {
                setOpenUpwards(false);
            }
        }
    }, [isOpen]);

    // Focus highlighted element
    useEffect(() => {
        if (isOpen && highlightedIndex >= 0 && listboxRef.current) {
            const el = listboxRef.current.querySelector(`[data-index="${highlightedIndex}"]`);
            if (el) {
                el.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [highlightedIndex, isOpen]);

    const handleSelect = useCallback((val) => {
        onChange(val);
        setIsOpen(false);
        buttonRef.current?.focus();
    }, [onChange]);

    const toggleOpen = () => {
        if (disabled) return;
        setIsOpen(!isOpen);
        if (!isOpen) {
            // Find current value index to highlight
            const idx = flatOptions.findIndex(opt => String(opt.value) === String(value));
            setHighlightedIndex(idx >= 0 ? idx : 0);
        }
    };

    const handleKeyDown = (e) => {
        if (disabled) return;

        switch (e.key) {
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (isOpen) {
                    if (highlightedIndex >= 0 && highlightedIndex < flatOptions.length) {
                        handleSelect(flatOptions[highlightedIndex].value);
                    }
                } else {
                    toggleOpen();
                }
                break;
            case 'Escape':
                if (isOpen) {
                    setIsOpen(false);
                    buttonRef.current?.focus();
                }
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (!isOpen) {
                    toggleOpen();
                } else {
                    setHighlightedIndex(prev => Math.min(prev + 1, flatOptions.length - 1));
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (!isOpen) {
                    toggleOpen();
                } else {
                    setHighlightedIndex(prev => Math.max(prev - 1, 0));
                }
                break;
            case 'Tab':
                if (isOpen) {
                    setIsOpen(false);
                }
                break;
            default:
                break;
        }
    };

    let optionIndexCounter = 0;

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                ref={buttonRef}
                type="button"
                disabled={disabled}
                onClick={toggleOpen}
                onKeyDown={handleKeyDown}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                className={`w-full bg-[#002747] border ${isOpen ? 'border-blue-500 ring-1 ring-blue-500' : 'border-white/10'} rounded-md px-3.5 py-2 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-left flex justify-between items-center transition-all min-h-[38px] ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-[rgba(255,255,255,0.06)]'}`}
            >
                <span className="truncate text-[0.85rem] font-medium pr-2">{selectedLabel}</span>
                <ChevronDown size={14} strokeWidth={2} className={`text-gray-300 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div 
                    ref={listboxRef}
                    role="listbox"
                    className={`absolute left-0 right-0 ${openUpwards ? 'bottom-full mb-1' : 'top-full mt-1'} bg-[#002747] border border-blue-500/30 rounded-md shadow-[0_8px_30px_rgb(0,0,0,0.5)] z-[100] max-h-60 overflow-y-auto custom-scrollbar p-1 min-w-[140px]`}
                >
                    {groups ? (
                        options.map((group, groupIndex) => (
                            <div key={groupIndex} className="mb-1 last:mb-0">
                                {group.label && (
                                    <div className="px-3 py-1.5 text-[0.7rem] font-bold text-[rgba(255,255,255,0.45)] uppercase tracking-wider sticky top-0 bg-[#002747] z-10">
                                        {group.label}
                                    </div>
                                )}
                                {group.options.map((opt) => {
                                    const index = optionIndexCounter++;
                                    const isSelected = String(value) === String(opt.value);
                                    const isHighlighted = highlightedIndex === index;
                                    
                                    return (
                                        <div
                                            key={opt.value}
                                            role="option"
                                            aria-selected={isSelected}
                                            data-index={index}
                                            onClick={() => handleSelect(opt.value)}
                                            onMouseEnter={() => setHighlightedIndex(index)}
                                            className={`w-full text-left px-3 py-2 text-[0.85rem] rounded-md transition-colors cursor-pointer flex items-center justify-between ${
                                                isSelected 
                                                    ? 'bg-[rgba(67,133,205,0.2)] text-white font-medium' 
                                                    : isHighlighted 
                                                        ? 'bg-[rgba(255,255,255,0.06)] text-white' 
                                                        : 'text-[rgba(255,255,255,0.7)]'
                                            }`}
                                        >
                                            <span className="truncate pr-4">{opt.label}</span>
                                            {isSelected && <Check size={14} className="text-blue-400 flex-shrink-0" />}
                                        </div>
                                    );
                                })}
                            </div>
                        ))
                    ) : (
                        options.map((opt) => {
                            const index = optionIndexCounter++;
                            const isSelected = String(value) === String(opt.value);
                            const isHighlighted = highlightedIndex === index;
                            
                            return (
                                <div
                                    key={opt.value}
                                    role="option"
                                    aria-selected={isSelected}
                                    data-index={index}
                                    onClick={() => handleSelect(opt.value)}
                                    onMouseEnter={() => setHighlightedIndex(index)}
                                    className={`w-full text-left px-3 py-2 text-[0.85rem] rounded-md transition-colors cursor-pointer flex items-center justify-between ${
                                        isSelected 
                                            ? 'bg-[rgba(67,133,205,0.2)] text-white font-medium' 
                                            : isHighlighted 
                                                ? 'bg-[rgba(255,255,255,0.06)] text-white' 
                                                : 'text-[rgba(255,255,255,0.7)]'
                                    }`}
                                >
                                    <span className="truncate pr-4">{opt.label}</span>
                                    {isSelected && <Check size={14} className="text-blue-400 flex-shrink-0" />}
                                </div>
                            );
                        })
                    )}

                    {(!options || flatOptions.length === 0) && (
                        <div className="px-4 py-3 text-center text-[rgba(255,255,255,0.4)] text-sm">
                            No options available
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
