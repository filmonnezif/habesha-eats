'use client';

import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import Link from 'next/link';
import { useCart } from '@/lib/CartContext';
import { useLanguage } from '@/lib/LanguageContext';
import { useRouter } from 'next/navigation';
import { restaurants } from '@/lib/data';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';

/**
 * AppNavbar — Always-visible navbar for app pages (Discover, Restaurant, etc.)
 * Features: Logo, Search bar with autocomplete suggestions, Cart icon with badge, Profile avatar.
 */
export default function AppNavbar({ onSearchChange, searchValue = '', hideSearch = false }) {
  const { totalItems, setIsCartOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const badgeRef = useRef(null);
  const prevCount = useRef(totalItems);
  const overlayRef = useRef(null);
  const menuLinksRef = useRef(null);
  const { t } = useLanguage();
  const router = useRouter();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // initialize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Search autocomplete states
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchWrapperRef = useRef(null);

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

  // Close suggestions on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Compute dynamic autocomplete suggestions
  useEffect(() => {
    if (!searchValue.trim()) {
      setSuggestions([]);
      return;
    }

    const query = searchValue.toLowerCase();
    
    // 1. Find matching restaurants (handle both old format and DB format)
    const matchedRestaurants = restaurants.filter(r => {
      const cuisines = r.cuisine || r.cuisines || [];
      const area = r.area || '';
      return (
        r.name.toLowerCase().includes(query) ||
        cuisines.some(c => c.toLowerCase().includes(query)) ||
        area.toLowerCase().includes(query)
      );
    }).map(r => ({
      type: 'restaurant',
      id: r.slug || r.id,
      name: r.name,
      subtitle: `${(r.cuisine || r.cuisines || []).join(', ')}${r.area ? ` · ${r.area}` : ''}`,
      image: r.heroImage || r.hero_image_url || '/images/dish_injera.webp'
    }));

    // 2. Find matching menu items (only from legacy data with menu arrays)
    const matchedDishes = [];
    restaurants.forEach(r => {
      if (!r.menu) return;
      r.menu.forEach(cat => {
        cat.items?.forEach(item => {
          if (item.name.toLowerCase().includes(query) && !matchedDishes.some(d => d.name === item.name)) {
            matchedDishes.push({
              type: 'dish',
              id: item.id,
              name: item.name,
              subtitle: `Signature dish at ${r.name}`,
              restaurantId: r.slug || r.id,
              image: item.image
            });
          }
        });
      });
    });

    setSuggestions([...matchedRestaurants.slice(0, 3), ...matchedDishes.slice(0, 4)]);
  }, [searchValue]);

  const handleSuggestionClick = (sug) => {
    if (sug.type === 'restaurant') {
      router.push(`/restaurant/${sug.id}`);
    } else if (sug.type === 'dish') {
      router.push(`/restaurant/${sug.restaurantId}`);
    }
    setShowSuggestions(false);
    onSearchChange?.('');
  };

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
              {t('hero.habesha')} <span className="navbar-wordmark-accent">{t('hero.eats')}</span>
            </span>
          </Link>

          {/* Search Bar with Autocomplete dropdown wrapper */}
          {!hideSearch && (
            <div ref={searchWrapperRef} className="app-search-bar-wrapper">
              <svg className="app-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                className="app-search-input"
                placeholder={isMobile ? 'Search' : t('navbar.findNearYou')}
                value={searchValue}
                onChange={(e) => {
                  onSearchChange?.(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                id="app-search-input"
                autoComplete="off"
              />
              {searchValue && (
                <button
                  className="app-search-clear"
                  onClick={() => {
                    onSearchChange?.('');
                    setSuggestions([]);
                  }}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}

              {/* Autocomplete Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="app-search-suggestions">
                  {suggestions.map((sug, idx) => (
                    <div
                      key={`${sug.type}-${sug.id || idx}`}
                      className="app-search-suggestion-item"
                      onClick={() => handleSuggestionClick(sug)}
                    >
                      {sug.image ? (
                        <img src={sug.image} alt={sug.name} className="app-search-suggestion-img" />
                      ) : (
                        <div className="app-search-suggestion-icon">
                          {sug.type === 'restaurant' ? '🏪' : '🍛'}
                        </div>
                      )}
                      <div className="app-search-suggestion-text">
                        <span className="app-search-suggestion-title">{sug.name}</span>
                        <span className="app-search-suggestion-subtitle">{sug.subtitle}</span>
                      </div>
                      <span className="app-search-suggestion-badge">
                        {sug.type}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Right actions */}
          <div className="app-navbar-actions">
            <LanguageSwitcher variant="navbar" />
            <ThemeToggle variant="navbar" />
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
          <Link href="/discover" className="mobile-menu-link" onClick={() => setMenuOpen(false)}>{t('navbar.discoverNow')}</Link>
          <Link href="/profile" className="mobile-menu-link" onClick={() => setMenuOpen(false)}>{t('navbar.profile')}</Link>
          <Link href="/" className="mobile-menu-link" onClick={() => setMenuOpen(false)}>{t('navbar.home')}</Link>
          <button
            className="mobile-menu-link"
            onClick={() => { setMenuOpen(false); setIsCartOpen(true); }}
            style={{ background: 'none', border: 'none', color: 'inherit', font: 'inherit' }}
          >
            {t('navbar.cart')} {totalItems > 0 && `(${totalItems})`}
          </button>
        </div>
      </div>
    </>
  );
}