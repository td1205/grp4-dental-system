import React, { useState, useRef, useEffect } from 'react';
import './MacDropdown.css';

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function MacDropdown({ options, value, onChange, placeholder = "Chọn...", ariaLabel }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Lấy label của item đang chọn
  const selectedOption = options.find(opt => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className="mac-dropdown" ref={dropdownRef} aria-label={ariaLabel}>
      <button 
        type="button" 
        className={`mac-dropdown__trigger ${isOpen ? 'mac-dropdown__trigger--open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="mac-dropdown__label">{displayLabel}</span>
        <span className="mac-dropdown__icon"><ChevronIcon /></span>
      </button>

      {isOpen && (
        <div className="mac-dropdown__menu-container">
          <ul className="mac-dropdown__menu">
            {options?.map(opt => (
              <li 
                key={opt.value || 'all'}
                className={`mac-dropdown__item ${opt.value === value ? 'mac-dropdown__item--selected' : ''}`}
                onClick={() => handleSelect(opt.value)}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
