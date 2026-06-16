'use client';

import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import Link from 'next/link';
import { useCart } from '@/lib/CartContext';

/**
 * AppNavbar — Always-visible navbar for app pages (Discover, Restaurant, etc.)
 * Features: Logo, Search bar, Cart icon with badge, Profile avatar.
 */
export default function AppNavbar({ onSearchChange, searchValue = '' }) {
  const { totalItems, setIsCartOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const badgeRef = useRef(null);
  const prevCount = useRef(totalItems);
  const overlayRef = useRef(null);
  const menuLinksRef = useRef(null);

  // Animate badge on count change
  useEffect(() => {
    if (totalItems > prevCount.current && badgeRef.current) {
      gsap.fromTo(
        badgeRef.current,
        { scale: 1.5 },
        { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.4)' }
      );
    }
    prevCount.current = totalItems;
  }, [totalItems]);

  // Mobile menu animation
  useEffect(() => {
    if (!overlayRef.current || !menuLinksRef.current) return;
    const links = menuLinksRef.current.querySelectorAll('.mobile-menu-link');
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      gsap.to(overlayRef.current, { clipPath: 'circle(150% at calc(100% - 3rem) 2.5rem)', duration: 0.7, ease: 'power3.inOut' });
      gsap.fromTo(links, { opacity: 0, y: 30, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', stagger: 0.08, duration: 0.6, delay: 0.3, ease: 'expo.out' });
    } else {
      document.body.style.overflow = '';
      gsap.to(overlayRef.current, { clipPath: 'circle(0% at calc(100% - 3rem) 2.5rem)', duration: 0.5, ease: 'power3.inOut' });
    }
  }, [menuOpen]);

  return (
    <>
      <nav className="app-navbar" id="app-navbar">
        <div className="navbar-inner">
          {/* Logo */}
          <Link href="/" className="navbar-brand">
            <span className="navbar-logo-icon">
              <img src="/logo.png" alt="Habesha Eats" width="38" height="38" style={{ objectFit: 'contain', padding: '2px' }} />
            </span>
            <span className="navbar-wordmark">
              HABESHA <span className="navbar-wordmark-accent">EATS</span>
            </span>
          </Link>

          {/* Search Bar — desktop */}
          <div className="app-search-bar-wrapper">
            <svg className="app-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              className="app-search-input"
              placeholder="Search restaurants, dishes, or cuisines..."
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              id="app-search-input"
            />
            {searchValue && (
              <button
                className="app-search-clear"
                onClick={() => onSearchChange?.('')}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {/* Right actions */}
          <div className="app-navbar-actions">
            {/* Cart */}
            <button
              className="app-nav-icon-btn"
              onClick={() => setIsCartOpen(true)}
              aria-label={`Cart with ${totalItems} items`}
              id="cart-btn"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="app-nav-icon">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {totalItems > 0 && (
                <span ref={badgeRef} className="cart-badge">{totalItems}</span>
              )}
            </button>

            {/* Profile */}
            <Link href="/profile" className="app-nav-icon-btn" aria-label="Profile" id="profile-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="app-nav-icon">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>

            {/* Hamburger (mobile) */}
            <button
              className={`hamburger-btn ${menuOpen ? 'hamburger-open' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <span className="hamburger-line hamburger-line-1" />
              <span className="hamburger-line hamburger-line-2" />
              <span className="hamburger-line hamburger-line-3" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div ref={overlayRef} className="mobile-menu-overlay" style={{ clipPath: 'circle(0% at calc(100% - 3rem) 2.5rem)' }}>
        <div ref={menuLinksRef} className="mobile-menu-content">
          <Link href="/discover" className="mobile-menu-link" onClick={() => setMenuOpen(false)}>Discover</Link>
          <Link href="/profile" className="mobile-menu-link" onClick={() => setMenuOpen(false)}>Profile</Link>
          <Link href="/" className="mobile-menu-link" onClick={() => setMenuOpen(false)}>Home</Link>
          <button
            className="mobile-menu-link"
            onClick={() => { setMenuOpen(false); setIsCartOpen(true); }}
            style={{ background: 'none', border: 'none', color: 'inherit', font: 'inherit' }}
          >
            Cart {totalItems > 0 && `(${totalItems})`}
          </button>
        </div>
      </div>
    </>
  );
}
