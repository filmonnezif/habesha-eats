'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { gsap } from 'gsap';
import AppNavbar from '@/components/AppNavbar';
import CartDrawer from '@/components/CartDrawer';
import RestaurantCard from '@/components/RestaurantCard';
import { useCart } from '@/lib/CartContext';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import {
  restaurants,
  EMIRATES,
  CUISINES,
  SORT_OPTIONS,
  DISH_CATEGORIES,
} from '@/lib/data';

function CustomDropdown({ value, onChange, options, ariaLabel, showLocationPin = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const selectedOpt = options.find(opt => opt.value === value);

  return (
    <div ref={dropdownRef} className="custom-dropdown">
      <button
        type="button"
        className="custom-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {showLocationPin && <span style={{ opacity: 0.95, fontSize: '0.95rem' }}>📍</span>}
          <span>{selectedOpt ? selectedOpt.label : value}</span>
        </span>
        <svg
          className="custom-dropdown-chevron"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <ul role="listbox" className="custom-dropdown-menu">
          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`custom-dropdown-option ${opt.value === value ? 'selected' : ''}`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DiscoverContent() {
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();
  
  // State variables
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmirate, setSelectedEmirate] = useState('All Emirates');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [sortBy, setSortBy] = useState('recommended');
  const [isLoading, setIsLoading] = useState(true);
  const [animatedCount, setAnimatedCount] = useState(0);
  
  const { totalItems, subtotal, restaurantName } = useCart();

  // Initialize search query and emirate filter from URL if present
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearchTerm(q);
    const emirate = searchParams.get('emirate');
    if (emirate) setSelectedEmirate(emirate);
    
    // Simulate loading animation for rich premium feel
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [searchParams]);

  // Process data (Filter + Sort)
  const filteredRestaurants = restaurants.filter((restaurant) => {
    // 1. Search Query Match
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      const matchName = restaurant.name.toLowerCase().includes(query);
      const matchTagline = restaurant.tagline.toLowerCase().includes(query);
      const matchDesc = restaurant.description.toLowerCase().includes(query);
      const matchArea = restaurant.area.toLowerCase().includes(query);
      const matchTags = restaurant.tags.some((t) => t.toLowerCase().includes(query));
      
      const matchDishes = restaurant.menu.some((cat) =>
        cat.items.some(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query)
        )
      );

      if (!matchName && !matchTagline && !matchDesc && !matchArea && !matchTags && !matchDishes) {
        return false;
      }
    }

    // 2. Emirate Filter Match
    if (selectedEmirate !== 'All Emirates') {
      if (restaurant.emirate.toLowerCase() !== selectedEmirate.toLowerCase()) {
        return false;
      }
    }

    // 3. Cuisine / Dietary Filter Match
    if (selectedCuisine !== 'All') {
      if (selectedCuisine === 'Vegetarian' || selectedCuisine === 'Vegan') {
        const dietLower = selectedCuisine.toLowerCase();
        const matchAmenity = restaurant.amenities.includes(dietLower);
        const matchTag = restaurant.tags.some((t) => t.toLowerCase().includes(dietLower));
        const matchMenuItems = restaurant.menu.some((cat) =>
          cat.items.some((item) => item.tags.includes(dietLower))
        );
        if (!matchAmenity && !matchTag && !matchMenuItems) return false;
      } else {
        if (!restaurant.cuisine.some((c) => c.toLowerCase() === selectedCuisine.toLowerCase())) {
          return false;
        }
      }
    }

    return true;
  });

  // Sort logic
  const sortedRestaurants = [...filteredRestaurants].sort((a, b) => {
    if (sortBy === 'rating') {
      return b.rating - a.rating;
    }
    if (sortBy === 'price-low') {
      return a.priceRange.length - b.priceRange.length;
    }
    if (sortBy === 'price-high') {
      return b.priceRange.length - a.priceRange.length;
    }
    if (sortBy === 'newest') {
      return b.reviewCount - a.reviewCount;
    }
    return b.rating * b.reviewCount - a.rating * a.reviewCount;
  });

  // Stagger entry effect with GSAP
  useEffect(() => {
    if (!isLoading) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          '.rc-card',
          { opacity: 0, y: 30, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.55,
            stagger: 0.06,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
          }
        );
      });
      return () => ctx.revert();
    }
  }, [isLoading, sortedRestaurants.length, selectedEmirate, selectedCuisine]);

  // Results count-up animation
  useEffect(() => {
    if (!isLoading) {
      const target = { val: animatedCount };
      gsap.to(target, {
        val: sortedRestaurants.length,
        duration: 0.4,
        ease: 'power1.out',
        onUpdate: () => {
          setAnimatedCount(Math.floor(target.val));
        }
      });
    }
  }, [sortedRestaurants.length, isLoading]);

  return (
    <div className="discover-page">
      <AppNavbar onSearchChange={setSearchTerm} searchValue={searchTerm} />
      <CartDrawer />

      {/* Sticky Filters & Controls (Compressed Design) */}
      <section className="discover-controls" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '1rem', paddingBottom: '1rem' }}>
        <div className="discover-controls-inner" style={{ padding: '0.6rem 2rem' }}>
          {/* Emirate Dropdown Filter (Outside overflow-x container) */}
          <CustomDropdown
            value={selectedEmirate}
            onChange={setSelectedEmirate}
            options={EMIRATES.map((e) => ({
              value: e,
              label: e === 'All Emirates' ? t('discover.allEmirates') : e
            }))}
            ariaLabel="Filter by Emirate"
            showLocationPin={true}
          />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {/* Sort Dropdown */}
            <CustomDropdown
              value={sortBy}
              onChange={setSortBy}
              options={SORT_OPTIONS.map((opt) => {
                let label = opt.label;
                if (opt.value === 'recommended') {
                  label = language === 'am' ? 'የተመከሩ' : language === 'ti' ? 'ዝተመርጹ' : language === 'om' ? 'Kan Filatame' : opt.label;
                } else if (opt.value === 'rating') {
                  label = language === 'am' ? 'ደረጃ (ከፍተኛ)' : language === 'ti' ? 'ደረጃ (ለዓሊ)' : language === 'om' ? 'Sadarkaa' : opt.label;
                } else if (opt.value === 'price-low') {
                  label = language === 'am' ? 'ዋጋ (ከአነስተኛ)' : language === 'ti' ? 'ዋጋ (ካብ ትሑት)' : language === 'om' ? 'Gatii (Gadaanaa)' : opt.label;
                } else if (opt.value === 'price-high') {
                  label = language === 'am' ? 'ዋጋ (ከከፍተኛ)' : language === 'ti' ? 'ዋጋ (ካብ ልዑል)' : language === 'om' ? 'Gatii (Olaanaa)' : opt.label;
                }
                return { value: opt.value, label };
              })}
              ariaLabel="Sort restaurants"
            />
          </div>
        </div>
      </section>

      {/* Results Count with Animated count-up */}
      {!isLoading && (
        <div className="discover-results-count">
          Showing <span>{animatedCount}</span> restaurants matching your filters
        </div>
      )}

      {/* Content Area */}
      <main className="discover-container">
        {isLoading ? (
          <div className="discover-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        ) : sortedRestaurants.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🍲</div>
            <h2 className="empty-title">{t('discover.emptyTitle')}</h2>
            <p className="empty-desc">
              {t('discover.emptyDesc')}
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedEmirate('All Emirates');
                setSelectedCuisine('All');
                setSelectedDietary([]);
              }}
              className="shiny-btn-mini"
            >
              {t('discover.resetFilters')}
            </button>
          </div>
        ) : (
          <div className="discover-grid" id="discover-grid">
            {sortedRestaurants.map((restaurant, idx) => (
              <Suspense key={restaurant.id} fallback={<div className="skeleton-card" />}>
                <RestaurantCard restaurant={restaurant} index={idx} />
              </Suspense>
            ))}
          </div>
        )}
      </main>

      {/* Sticky Bottom Cart Bar */}
      {totalItems > 0 && (
        <div className="sticky-order-bar" id="sticky-order-bar">
          <div className="sticky-order-info">
            <span>🛒 {totalItems} {totalItems === 1 ? t('discover.stickyItem') : t('discover.stickyItems')}</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>|</span>
            <span style={{ color: 'var(--color-habesha-green)', fontWeight: 700 }}>AED {subtotal}</span>
            <span className="sticky-order-restaurant">{t('discover.stickyFrom')} {restaurantName}</span>
          </div>
          <button
            onClick={() => {
              const btn = document.getElementById('cart-btn');
              if (btn) btn.click();
            }}
            className="shiny-btn-mini"
            style={{ padding: '0.5rem 1.25rem' }}
          >
            {t('discover.stickyViewCart')}
          </button>
        </div>
      )}
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<div className="discover-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#16191c', color: '#fff' }}>Loading Discover...</div>}>
      <DiscoverContent />
    </Suspense>
  );
}

