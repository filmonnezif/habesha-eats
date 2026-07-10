'use client';

import { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { gsap } from 'gsap';
import dynamic from 'next/dynamic';
import AppNavbar from '@/components/AppNavbar';
import CartDrawer from '@/components/CartDrawer';
import RestaurantCard from '@/components/RestaurantCard';
import SmartSuggestions from '@/components/SmartSuggestions';
import PriceCompare from '@/components/PriceCompare';
import { useCart } from '@/lib/CartContext';
import { useLanguage } from '@/lib/LanguageContext';
import { getUserLocation, reverseGeocode, haversineDistance, getRestaurantCoords, getTravelModes } from '@/lib/geo';
import { EMIRATES, SORT_OPTIONS, restaurants as hardcodedRestaurants } from '@/lib/data';
import Link from 'next/link';

// Dynamic import for map (heavy WebGL dependency)
const DiscoverMap = dynamic(() => import('@/components/DiscoverMap'), {
  ssr: false,
  loading: () => <div className="discover-map-skeleton"><div className="map-skeleton-pulse" /></div>,
});

/* ───────── Custom Dropdown (reused) ───────── */
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

/* ───────── Travel Mode Chips ───────── */
function TravelModes({ restaurant, userLocation }) {
  const travelInfo = userLocation ? getTravelModes(restaurant, userLocation.lat, userLocation.lng) : null;

  if (!travelInfo || !travelInfo.distance) return null;

  return (
    <div className="travel-modes">
      <div className="travel-distance-badge">
        <span className="travel-distance-icon">📍</span>
        <span>{travelInfo.distance.toFixed(1)} km</span>
      </div>
      <div className="travel-chips">
        {travelInfo.modes.slice(0, 3).map(mode => (
          <div key={mode.key} className="travel-chip">
            <span className="travel-chip-icon">{mode.icon}</span>
            <span className="travel-chip-time">{mode.timeLabel || `${mode.time} min`}</span>
            {mode.cost > 0 && <span className="travel-chip-cost">AED {mode.cost}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────── Main Discover Content ───────── */
function DiscoverContent() {
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmirate, setSelectedEmirate] = useState('All Emirates');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [sortBy, setSortBy] = useState('recommended');
  const [isLoading, setIsLoading] = useState(true);
  const [dbRestaurants, setDbRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showMap, setShowMap] = useState(false); // Mobile map toggle

  // Geolocation state
  const [userLocation, setUserLocation] = useState(null);
  const [locationName, setLocationName] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle'); // idle | loading | granted | denied
  const [distances, setDistances] = useState({});

  const { totalItems, subtotal, restaurantName } = useCart();
  const selectedCardRef = useRef(null);

  // Fetch restaurants from database
  useEffect(() => {
    async function fetchRestaurants() {
      try {
        const res = await fetch('/api/restaurants');
        if (res.ok) {
          const data = await res.json();
          // Merge hardcoded data (coordinates, menu, deliveryFee, etc.)
          const merged = data.map(dbR => {
            const hc = hardcodedRestaurants.find(hr => hr.slug === dbR.slug || hr.id === dbR.slug);
            if (hc) {
              return {
                ...dbR,
                coordinates: hc.coordinates,
                deliveryFee: dbR.deliveryFee ?? hc.deliveryFee,
                deliveryTime: dbR.deliveryTime ?? hc.deliveryTime,
                menu: hc.menu,
              };
            }
            return dbR;
          });
          setDbRestaurants(merged);
        }
      } catch (err) {
        console.error('Failed to fetch restaurants:', err);
        // Fallback to hardcoded data
        setDbRestaurants(hardcodedRestaurants);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRestaurants();
  }, []);

  // Request user location
  useEffect(() => {
    setLocationStatus('loading');
    getUserLocation()
      .then(async (loc) => {
        setUserLocation(loc);
        setLocationStatus('granted');
        // Reverse geocode to get area name
        const name = await reverseGeocode(loc.lat, loc.lng);
        if (name) setLocationName(name);
      })
      .catch(() => {
        setLocationStatus('denied');
        // Default to Dubai center
        setUserLocation({ lat: 25.2048, lng: 55.2708 });
      });
  }, []);

  // Compute distances whenever restaurants or user location change
  useEffect(() => {
    if (!userLocation || dbRestaurants.length === 0) return;
    const dists = {};
    dbRestaurants.forEach(r => {
      const coords = getRestaurantCoords(r);
      if (coords) {
        const d = haversineDistance(userLocation.lat, userLocation.lng, coords.lat, coords.lng);
        dists[r.id] = d;
        dists[r.slug] = d;
      }
    });
    setDistances(dists);
  }, [userLocation, dbRestaurants]);

  // Initialize from URL
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearchTerm(q);
    const emirate = searchParams.get('emirate');
    if (emirate) setSelectedEmirate(emirate);
  }, [searchParams]);

  // Filter restaurants
  const filteredRestaurants = dbRestaurants.filter((restaurant) => {
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      const matchName = restaurant.name.toLowerCase().includes(query);
      const matchTagline = (restaurant.tagline || '').toLowerCase().includes(query);
      const matchDesc = (restaurant.description || '').toLowerCase().includes(query);
      const matchArea = (restaurant.area || '').toLowerCase().includes(query);
      const matchEmirate = (restaurant.emirate || '').toLowerCase().includes(query);
      const matchCuisine = (restaurant.cuisines || []).some(c => c.toLowerCase().includes(query));
      if (!matchName && !matchTagline && !matchDesc && !matchArea && !matchEmirate && !matchCuisine) return false;
    }
    if (selectedEmirate !== 'All Emirates') {
      const hasEmirate = restaurant.branches?.some(b => b.emirate?.toLowerCase() === selectedEmirate.toLowerCase());
      if (!hasEmirate && restaurant.emirate?.toLowerCase() !== selectedEmirate.toLowerCase()) return false;
    }
    if (selectedCuisine !== 'All') {
      const cuisines = restaurant.cuisines || [];
      if (!cuisines.some(c => c.toLowerCase().includes(selectedCuisine.toLowerCase()))) return false;
    }
    return true;
  });

  // Sort restaurants
  const sortedRestaurants = [...filteredRestaurants].sort((a, b) => {
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'price-low') return (a.priceRange || '$$').length - (b.priceRange || '$$').length;
    if (sortBy === 'price-high') return (b.priceRange || '$$').length - (a.priceRange || '$$').length;
    if (sortBy === 'nearest' && userLocation) {
      return (distances[a.id] ?? 999) - (distances[b.id] ?? 999);
    }
    if (sortBy === 'newest') return (b.reviewCount || 0) - (a.reviewCount || 0);
    // Default: distance if available, otherwise alphabetical
    if (userLocation && distances[a.id] !== undefined) {
      return (distances[a.id] ?? 999) - (distances[b.id] ?? 999);
    }
    return a.name.localeCompare(b.name);
  });

  // Determine if user is actively searching/filtering
  const isActivelyFiltering = searchTerm.length > 0 || selectedEmirate !== 'All Emirates' || selectedCuisine !== 'All' || sortBy !== 'recommended';

  // Smart display: show only top 6 by default, all when actively filtering
  const MAX_DEFAULT = 6;
  const [showAllRestaurants, setShowAllRestaurants] = useState(false);

  // Reset "show all" when filters change
  useEffect(() => {
    setShowAllRestaurants(false);
  }, [searchTerm, selectedEmirate, selectedCuisine, sortBy]);

  const displayRestaurants = (isActivelyFiltering || showAllRestaurants)
    ? sortedRestaurants
    : sortedRestaurants.slice(0, MAX_DEFAULT);

  const hiddenCount = sortedRestaurants.length - displayRestaurants.length;

  // GSAP stagger animation
  useEffect(() => {
    if (!isLoading && displayRestaurants.length > 0) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          '.rc-card',
          { opacity: 0, y: 30, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.06, ease: 'power3.out', clearProps: 'transform,opacity' }
        );
      });
      return () => ctx.revert();
    }
  }, [isLoading, displayRestaurants.length, selectedEmirate, selectedCuisine, showAllRestaurants]);

  // Handle restaurant selection (scroll card into view + highlight on map)
  const handleSelectRestaurant = useCallback((restaurant) => {
    setSelectedRestaurant(restaurant);
    // Scroll the card into view on mobile
    const cardEl = document.querySelector(`[data-restaurant-id="${restaurant.slug || restaurant.id}"]`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      cardEl.classList.add('rc-card-highlighted');
      setTimeout(() => cardEl.classList.remove('rc-card-highlighted'), 2000);
    }
  }, []);

  // Extended sort options with 'nearest'
  const extendedSortOptions = [
    ...SORT_OPTIONS,
    ...(userLocation ? [{ value: 'nearest', label: 'Nearest First' }] : []),
  ];

  return (
    <div className="discover-page">
      <AppNavbar onSearchChange={setSearchTerm} searchValue={searchTerm} />
      <CartDrawer />

      {/* Location Status Bar */}
      <div className="location-bar" id="location-bar">
        <div className="location-bar-inner">
          <div className="location-bar-left">
            {locationStatus === 'loading' && (
              <>
                <div className="location-bar-pulse" />
                <span className="location-bar-text">Locating you...</span>
              </>
            )}
            {locationStatus === 'granted' && (
              <>
                <span className="location-bar-icon">📍</span>
                <span className="location-bar-text">
                  Near <strong>{locationName || 'your location'}</strong>
                </span>
              </>
            )}
            {locationStatus === 'denied' && (
              <>
                <span className="location-bar-icon">🌍</span>
                <span className="location-bar-text">
                  Showing all UAE · <button className="location-bar-enable" onClick={() => {
                    setLocationStatus('loading');
                    getUserLocation().then(async (loc) => {
                      setUserLocation(loc);
                      setLocationStatus('granted');
                      const name = await reverseGeocode(loc.lat, loc.lng);
                      if (name) setLocationName(name);
                    }).catch(() => setLocationStatus('denied'));
                  }}>Enable location</button>
                </span>
              </>
            )}
          </div>
          <div className="location-bar-right">
            <span className="location-bar-count">
              {isActivelyFiltering || showAllRestaurants
                ? `${sortedRestaurants.length} restaurant${sortedRestaurants.length !== 1 ? 's' : ''}`
                : `Top ${displayRestaurants.length} of ${sortedRestaurants.length}`
              }
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <section className="discover-controls" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
        <div className="discover-controls-inner" style={{ padding: '0.4rem 2rem' }}>
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
          <CustomDropdown
            value={selectedCuisine}
            onChange={setSelectedCuisine}
            options={[
              { value: 'All', label: t('discover.allCuisines') },
              { value: 'Ethiopian', label: t('discover.cuisineEth') },
              { value: 'Eritrean', label: t('discover.cuisineEri') },
              { value: 'Vegetarian', label: t('discover.vegetarian') },
              { value: 'Vegan', label: t('discover.vegan') }
            ]}
            ariaLabel="Filter by Cuisine"
          />
          <CustomDropdown
            value={sortBy}
            onChange={setSortBy}
            options={extendedSortOptions.map((opt) => {
              let label = opt.label;
              if (opt.value === 'recommended') {
                label = language === 'am' ? 'የተመከሩ' : language === 'ti' ? 'ዝተመርጹ' : language === 'om' ? 'Kan Filatame' : opt.label;
              } else if (opt.value === 'rating') {
                label = language === 'am' ? 'ደረጃ (ከፍተኛ)' : language === 'ti' ? 'ደረጃ (ለዓሊ)' : language === 'om' ? 'Sadarkaa' : opt.label;
              }
              return { value: opt.value, label };
            })}
            ariaLabel="Sort restaurants"
          />
        </div>
      </section>

      {/* Smart Suggestions (AI Cards) */}
      {!isLoading && (
        <SmartSuggestions
          restaurants={dbRestaurants}
          userLocation={userLocation}
          onSelectRestaurant={handleSelectRestaurant}
          onSelectDish={() => {}}
        />
      )}

      {/* Split View: Left Panel + Map */}
      <div className="discover-split-view">
        {/* Left Panel — Price Compare + Restaurant Grid */}
        <div className="discover-left-panel">
          {/* Price Comparison */}
          {!isLoading && (
            <PriceCompare
              restaurants={dbRestaurants}
              userLocation={userLocation}
              onSelectRestaurant={handleSelectRestaurant}
            />
          )}

          {/* Restaurant Grid */}
          <main className="discover-container">
            {isLoading ? (
              <div className="discover-grid">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="skeleton-card" />
                ))}
              </div>
            ) : displayRestaurants.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🍲</div>
                <h2 className="empty-title">{t('discover.emptyTitle')}</h2>
                <p className="empty-desc">{t('discover.emptyDesc')}</p>
                <button
                  onClick={() => { setSearchTerm(''); setSelectedEmirate('All Emirates'); setSelectedCuisine('All'); }}
                  className="shiny-btn-mini"
                >
                  {t('discover.resetFilters')}
                </button>
              </div>
            ) : (
              <>
                {!isActivelyFiltering && !showAllRestaurants && (
                  <div className="discover-section-label">
                    <span className="discover-section-label-icon">🏆</span>
                    <span>Best picks near you</span>
                  </div>
                )}
                <div className="discover-grid" id="discover-grid">
                  {displayRestaurants.map((restaurant, idx) => (
                    <div
                      key={restaurant.id}
                      data-restaurant-id={restaurant.slug || restaurant.id}
                      onClick={() => handleSelectRestaurant(restaurant)}
                      style={{ cursor: 'pointer' }}
                    >
                      <Suspense fallback={<div className="skeleton-card" />}>
                        <RestaurantCard restaurant={restaurant} index={idx} />
                      </Suspense>
                      <TravelModes restaurant={restaurant} userLocation={userLocation} />
                    </div>
                  ))}
                </div>
                {/* Explore More button when showing default limited view */}
                {hiddenCount > 0 && !isActivelyFiltering && !showAllRestaurants && (
                  <button
                    className="discover-explore-more"
                    onClick={() => setShowAllRestaurants(true)}
                  >
                    <span className="discover-explore-more-icon">🔍</span>
                    <span>Explore {hiddenCount} more restaurant{hiddenCount !== 1 ? 's' : ''}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg>
                  </button>
                )}
              </>
            )}
          </main>
        </div>

        {/* Right Panel — Map (desktop) */}
        <div className={`discover-map-container ${showMap ? 'discover-map-mobile-show' : ''}`}>
          <DiscoverMap
            restaurants={displayRestaurants}
            userLocation={userLocation}
            selectedRestaurant={selectedRestaurant}
            onSelectRestaurant={handleSelectRestaurant}
            distances={distances}
          />
        </div>
      </div>

      {/* Mobile Map Toggle FAB */}
      <button
        className="map-toggle-fab"
        onClick={() => setShowMap(!showMap)}
        aria-label={showMap ? 'Show list' : 'Show map'}
        id="map-toggle-fab"
      >
        {showMap ? (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            <span>List</span>
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
              <line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" />
            </svg>
            <span>Map</span>
          </>
        )}
      </button>

      {/* Mobile Map Overlay Backdrop */}
      {showMap && <div className="map-mobile-backdrop" onClick={() => setShowMap(false)} />}

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
            onClick={() => { const btn = document.getElementById('cart-btn'); if (btn) btn.click(); }}
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
