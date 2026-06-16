'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

const linkColumns = [
  {
    title: 'Platform',
    links: [
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'Stats', href: '#stats' },
      { label: 'Popular Dishes', href: '#dishes' },
      { label: 'Featured Restaurants', href: '#taste-of-home' },
    ],
  },
  {
    title: 'Discover',
    links: [
      { label: 'Ethiopian Cuisine', href: '#dishes' },
      { label: 'Eritrean Cuisine', href: '#dishes' },
      { label: 'Vegetarian Options', href: '#dishes' },
      { label: 'Community Reviews', href: '#testimonials' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '#hero' },
      { label: 'Contact', href: '#contact' },
      { label: 'Join as Restaurant', href: '#final-cta' },
      { label: 'Platform FAQs', href: '#how-it-works' },
    ],
  },
];

/**
 * Footer — Renders brand columns, styled social media icons,
 * dynamic legal links, and a back-to-top button.
 */
export default function Footer() {
  const footerRef = useRef(null);
  const brandRef = useRef(null);
  const columnsRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = footerRef.current;
    if (!el || visible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  useEffect(() => {
    if (!visible) return;

    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

    if (brandRef.current) {
      tl.fromTo(
        brandRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1 },
        0
      );
    }

    if (columnsRef.current) {
      const cols = columnsRef.current.querySelectorAll('.footer-column');
      tl.fromTo(
        cols,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.8 },
        0.2
      );
    }

    return () => tl.kill();
  }, [visible]);

  const handleBackToTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer ref={footerRef} className="site-footer" id="contact">
      {/* Flag gradient top border */}
      <div className="footer-flag-border" aria-hidden="true">
        <div className="footer-flag-stripe footer-flag-green" />
        <div className="footer-flag-stripe footer-flag-red" />
        <div className="footer-flag-stripe footer-flag-yellow" />
      </div>

      <div className="footer-inner">
        {/* Row 1: Brand Statement */}
        <div ref={brandRef} className="footer-brand-row" style={{ opacity: 0 }}>
          <div className="footer-wordmark-wrapper">
            <h2 className="footer-wordmark">
              <span className="footer-wordmark-habesha">HABESHA</span>
              <span className="footer-wordmark-eats">EATS</span>
            </h2>
            <p className="footer-tagline">Connecting you to the flavors of home</p>
          </div>
          <a href="/discover" className="footer-cta shiny-btn-mini">
            Explore Restaurants
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* Divider */}
        <div className="footer-divider" />

        {/* Row 2: Link Columns + Connect Column */}
        <div ref={columnsRef} className="footer-columns">
          {linkColumns.map((column) => (
            <div key={column.title} className="footer-column" style={{ opacity: 0 }}>
              <h3 className="footer-column-title">{column.title}</h3>
              <ul className="footer-column-links">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="footer-link">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Connected Social Column */}
          <div className="footer-column" style={{ opacity: 0 }}>
            <h3 className="footer-column-title">Connect</h3>
            <div className="footer-social-grid" style={{ display: 'flex', gap: '0.85rem', marginTop: '0.75rem' }}>
              <a href="https://instagram.com" className="back-to-top" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <svg className="social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01" />
                </svg>
              </a>
              <a href="https://telegram.org" className="back-to-top" aria-label="Telegram" target="_blank" rel="noopener noreferrer">
                <svg className="social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.198 2.002a.5.5 0 00-.547.047L2.405 14.024a.5.5 0 00.174.918l5.249 1.636 1.776 5.305a.5.5 0 00.912.083l3.208-4.636 4.906 3.568a.5.5 0 00.782-.361l3.003-18.02a.5.5 0 00-.817-.513z" />
                </svg>
              </a>
              <a href="https://tiktok.com" className="back-to-top" aria-label="TikTok" target="_blank" rel="noopener noreferrer">
                <svg className="social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12a4 4 0 100 8h4v-8h-3a1 1 0 01-1-1v-1a1 1 0 011-1h4V2h2a3 3 0 013 3v2a3 3 0 01-3 3h-3v4" />
                </svg>
              </a>
              <a href="https://facebook.com" className="back-to-top" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                <svg className="social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider" />

        {/* Row 3: Bottom Bar */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {new Date().getFullYear()} HabeshaEats. All rights reserved.
          </p>

          {/* Decorative Ethiopian Logo / Back to Top */}
          <div className="footer-cross">
            <a href="#hero" onClick={handleBackToTop} className="back-to-top" aria-label="Scroll back to top">
              ↑
            </a>
          </div>

          <div className="footer-legal">
            <a href="#" className="footer-legal-link">Privacy Policy</a>
            <span className="footer-legal-dot">·</span>
            <a href="#" className="footer-legal-link">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
