'use client';

import { useState, useEffect, useRef } from 'react';
import { EMIRATES } from '@/lib/data';

/**
 * Premium glassmorphic location dropdown for navbars.
 * Redirects to discover page with selected emirate query param.
 */
export default function LocationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState('Dubai');
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Sync with URL parameter if on discover page
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const emirateParam = params.get('emirate');
      if (emirateParam && EMIRATES.includes(emirateParam)) {
        setSelected(emirateParam);
      }
    }
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleSelect = (emirate) => {
    setSelected(emirate);
    setIsOpen(false);
    
    // Redirect to discover page with the emirate selected
    if (emirate === 'All Emirates') {
      window.location.href = '/discover';
    } else {
      window.location.href = `/discover?emirate=${encodeURIComponent(emirate)}`;
    }
  };

  // Filter out 'All Emirates' for the nav dropdown options to keep it premium
  const options = EMIRATES.filter(e => e !== 'All Emirates');

  return (
    <div ref={dropdownRef} className="nav-location-dropdown" style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          color: '#ffffff',
          padding: '0.45rem 0.9rem',
          borderRadius: '100px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.825rem',
          fontWeight: 600,
          transition: 'all 0.2s ease',
          outline: 'none',
          whiteSpace: 'nowrap'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.09)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span style={{ fontSize: '1rem' }}>📍</span>
        <span>{selected}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            opacity: 0.8
          }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <ul
          role="listbox"
          style={{
            position: 'absolute',
            top: '125%',
            left: 0,
            background: 'rgba(15, 17, 19, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            listStyle: 'none',
            padding: '0.4rem 0',
            margin: 0,
            minWidth: '160px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6)',
            zIndex: 9999,
            maxHeight: '260px',
            overflowY: 'auto'
          }}
        >
          <li
            role="option"
            aria-selected={selected === 'All Emirates'}
            onClick={() => handleSelect('All Emirates')}
            style={{
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontSize: '0.8rem',
              color: '#ffffff',
              transition: 'background 0.2s ease',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              fontWeight: 500
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            All Emirates
          </li>
          {options.map((e) => (
            <li
              key={e}
              role="option"
              aria-selected={selected === e}
              onClick={() => handleSelect(e)}
              style={{
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontSize: '0.8rem',
                color: selected === e ? 'var(--color-habesha-gold)' : '#ffffff',
                background: selected === e ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                transition: 'background 0.2s ease',
                fontWeight: selected === e ? 600 : 400
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'}
              onMouseLeave={(e) => e.currentTarget.style.background = selected === e ? 'rgba(255, 255, 255, 0.03)' : 'transparent'}
            >
              {e}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
