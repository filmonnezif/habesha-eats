'use client';

import { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';

/**
 * Navbar with transparent-to-glass transition on scroll.
 * Features the Habesha Eats wordmark, nav links, CTA button,
 * and a hamburger menu for mobile with full-screen overlay.
 */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const overlayRef = useRef(null);
  const menuLinksRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animate mobile menu open/close
  useEffect(() => {
    if (!overlayRef.current || !menuLinksRef.current) return;

    const links = menuLinksRef.current.querySelectorAll('.mobile-menu-link');
    const cta = menuLinksRef.current.querySelector('.mobile-menu-cta');

    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      gsap.to(overlayRef.current, {
        clipPath: 'circle(150% at calc(100% - 3rem) 2.5rem)',
        duration: 0.7,
        ease: 'power3.inOut',
      });
      gsap.fromTo(
        links,
        { opacity: 0, y: 30, filter: 'blur(8px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', stagger: 0.08, duration: 0.6, delay: 0.3, ease: 'expo.out' }
      );
      if (cta) {
        gsap.fromTo(
          cta,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, delay: 0.6, ease: 'expo.out' }
        );
      }
    } else {
      document.body.style.overflow = '';
      gsap.to(overlayRef.current, {
        clipPath: 'circle(0% at calc(100% - 3rem) 2.5rem)',
        duration: 0.5,
        ease: 'power3.inOut',
      });
    }
  }, [menuOpen]);

  const handleLinkClick = () => {
    setMenuOpen(false);
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`} id="navbar">
        <div className="navbar-inner">
          {/* Logo / Wordmark */}
          <a href="/" className="navbar-brand">
            <span className="navbar-logo-icon">
              <img src="/logo.png" alt="Habesha Eats" width="42" height="42" style={{ objectFit: 'contain', padding: '2px' }} />
            </span>
            <span className="navbar-wordmark">
              HABESHA <span className="navbar-wordmark-accent">EATS</span>
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <div className="navbar-links">
            <a href="#restaurants" className="navbar-link">Restaurants</a>
            <a href="#about" className="navbar-link">About</a>
            <a href="#contact" className="navbar-link">Contact</a>
          </div>

          {/* Desktop CTA */}
          <a href="/discover" className="navbar-cta shiny-btn-mini navbar-cta-desktop">
            Discover Now
          </a>

          {/* Hamburger Button (Mobile) */}
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
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        ref={overlayRef}
        className="mobile-menu-overlay"
        style={{ clipPath: 'circle(0% at calc(100% - 3rem) 2.5rem)' }}
      >
        <div ref={menuLinksRef} className="mobile-menu-content">
          <a href="#how-it-works" className="mobile-menu-link" onClick={handleLinkClick}>How It Works</a>
          <a href="#restaurants" className="mobile-menu-link" onClick={handleLinkClick}>Restaurants</a>
          <a href="#about" className="mobile-menu-link" onClick={handleLinkClick}>About</a>
          <a href="#contact" className="mobile-menu-link" onClick={handleLinkClick}>Contact</a>
          <a href="/discover" className="mobile-menu-cta shiny-btn" onClick={handleLinkClick}>
            Discover Now
            <svg className="cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </>
  );
}
