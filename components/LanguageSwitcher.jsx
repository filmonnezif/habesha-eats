'use client';

import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { gsap } from 'gsap';
import { useLanguage, LANGUAGES } from '@/lib/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Animate dropdown open/close using GSAP
  useEffect(() => {
    const dropdown = dropdownRef.current;
    if (!dropdown) return;

    if (isOpen) {
      gsap.fromTo(
        dropdown,
        { opacity: 0, y: -15, scale: 0.95, display: 'none' },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          display: 'block',
          duration: 0.25,
          ease: 'power2.out',
        }
      );
    } else {
      gsap.to(dropdown, {
        opacity: 0,
        y: -10,
        scale: 0.95,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
          dropdown.style.display = 'none';
        },
      });
    }
  }, [isOpen]);

  const activeLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  const handleLanguageSelect = (code) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="lang-switcher-wrapper">
      <button
        ref={triggerRef}
        onClick={toggleDropdown}
        className="lang-toggle-btn"
        aria-label="Select Language"
        aria-expanded={isOpen}
        title="Select Language"
      >
        <Globe size={18} className="lang-globe-icon" />
        <span className="lang-code-label">{activeLang.code.toUpperCase()}</span>
      </button>

      <div ref={dropdownRef} className="lang-dropdown" style={{ display: 'none' }}>
        <div className="lang-dropdown-arrow" />
        <ul className="lang-options-list">
          {LANGUAGES.map((lang) => (
            <li key={lang.code}>
              <button
                onClick={() => handleLanguageSelect(lang.code)}
                className={`lang-option-btn ${language === lang.code ? 'lang-option-active' : ''}`}
              >
                <span className="lang-native">{lang.nativeLabel}</span>
                <span className="lang-english">{lang.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
