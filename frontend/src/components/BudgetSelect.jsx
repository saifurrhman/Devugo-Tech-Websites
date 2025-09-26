import React, { useState, useRef, useEffect } from 'react';

export default function BudgetSelect({ value, onChange, placeholder = 'Select a range', name = 'budget' }){
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const options = [
    { value: '<2k', label: 'Less than $2,000' },
    { value: '2k-5k', label: '$2,000 – $5,000' },
    { value: '5k-10k', label: '$5,000 – $10,000' },
    { value: '>10k', label: 'More than $10,000' },
  ];

  function selectOption(val){
    onChange({ target: { name, value: val } });
    setOpen(false);
  }

  useEffect(() => {
    function onDocClick(e){
      if (!menuRef.current || !triggerRef.current) return;
      if (!menuRef.current.contains(e.target) && !triggerRef.current.contains(e.target)){
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div className={`select-wrap ${open ? 'open' : ''}`}>
      <button
        type="button"
        className="select-trigger"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        ref={triggerRef}
      >
        <span className={`select-text ${!selected ? 'placeholder' : ''}`}>{selected ? selected.label : placeholder}</span>
        <span className="select-chevron" aria-hidden>
          <svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </span>
      </button>

      {open && (
        <ul className="select-menu" role="listbox" ref={menuRef}>
          <li className="select-menu-header" aria-disabled>{placeholder}</li>
          {options.map(opt => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={`select-option ${opt.value === value ? 'selected' : ''}`}
              onClick={() => selectOption(opt.value)}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
      <input type="hidden" name={name} value={value || ''} />
    </div>
  );
}
