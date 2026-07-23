'use client';

import { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
import {
  Search, MapPin, Flame, Star, Sparkles, ChevronDown, ChevronUp,
  UtensilsCrossed, Leaf, Sprout, Coffee, Brain, DollarSign,
  Trophy, ShoppingCart, Globe, Navigation, X, SlidersHorizontal
} from 'lucide-react';

// Dynamic import for map (heavy WebGL dependency)
const DiscoverMap = dynamic(() => import('@/components/DiscoverMap'), {
  ssr: false,
  loading: () => <div className="discover-map-skeleton"><div className="map-skeleton-pulse" /></div>,
});

/* ───────── Animated placeholder for hero search ───────── */
const SEARCH_PLACEHOLDERS = [
  'Search Ethiopian cuisine...',
  'Find injera near you...',
  'Try tibs, shiro, kitfo...',
  'Discover authentic flavors...',
  'Craving something delicious?',
];

/* ───────── Travel Modes Component ───────── */
function TravelModes({ restaurant, userLocation }) {
  const travelInfo = userLocation ? getTravelModes(restaurant, userLocation.lat, userLocation.lng) : null;
  if (!travelInfo || !travelInfo.distance) return null;

  return (
    <div className="travel-modes">
      <div className="travel-distance-badge">
        <Navigation size={12} />
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

/* ───────── Custom Dropdown Component ───────── */
function CustomDropdown({ options, value, onChange, icon: Icon, label }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className="custom-dropdown" ref={dropdownRef}>
      <button
        className="custom-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {Icon && <Icon size={14} />}
        <span>{value}</span>
        {isOpen ? <ChevronUp size={14} className="custom-dropdown-chevron" /> : <ChevronDown size={14} className="custom-dropdown-chevron" />}
      </button>
      {isOpen && (
        <ul className="custom-dropdown-menu" role="listbox">
          {options.map((option) => (
            <li
              key={option}
              className={`custom-dropdown-option ${value === option ? 'selected' : ''}`}
              role="option"
              aria-selected={value === option}
              onClick={() => handleSelect(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
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
  const [showMap, setShowMap] = useState(false);
  const [activeTab, setActiveTab] = useState('suggestions');
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [placeholderText, setPlaceholderText] = useState(SEARCH_PLACEHOLDERS[0]);

  // Geolocation state
  const [userLocation, setUserLocation] = useState(null);
  const [locationName, setLocationName] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle');
  const [distances, setDistances] = useState({});

  const { totalItems, subtotal, restaurantName } = useCart();
  const heroSearchRef = useRef(null);

  // Animated placeholder cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx(prev => {
        const next = (prev + 1) % SEARCH_PLACEHOLDERS.length;
        const input = heroSearchRef.current?.querySelector('.hero-search-input');
        if (input) {
          gsap.to(input, { opacity: 0, duration: 0.15, onComplete: () => {
            setPlaceholderText(SEARCH_PLACEHOLDERS[next]);
            gsap.to(input, { opacity: 1, duration: 0.15 });
          }});
        }
        return next;
      });
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Fetch restaurants from database (fallback to hardcoded on error)
  useEffect(() => {
    async function fetchRestaurants() {
      try {
        const res = await fetch('/api/restaurants');
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        const data = await res.json();
        const merged = data.map(dbR => {
          const hc = hardcodedRestaurants.find(hr => hr.slug === dbR.slug || hr.id === dbR.slug);
          const coords = getRestaurantCoords(dbR);
          return {
            ...dbR,
            coordinates: coords,
            emirate: dbR.emirate || hc?.emirate || 'Dubai',
            menu: dbR.menu || hc?.menu || [],
          };
        });
        setDbRestaurants(merged);
      } catch (err) {
        console.error('Failed to fetch restaurants, using hardcoded data:', err.message);
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
        const name = await reverseGeocode(loc.lat, loc.lng);
        if (name) setLocationName(name);
      })
      .catch(() => {
        setLocationStatus('denied');
        setUserLocation({ lat: 25.2048, lng: 55.2708 });
      });
  }, []);

  // Compute distances
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

  // Determine greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

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
    
    // Default 'recommended' sort: Heavily prioritize local & nearby places (<35km) over 90km cross-emirate restaurants
    const distA = distances[a.id] ?? 999;
    const distB = distances[b.id] ?? 999;
    const penaltyA = distA > 35 ? 1000 : 0;
    const penaltyB = distB > 35 ? 1000 : 0;

    const scoreA = (a.rating || 4.0) * 20 - distA - penaltyA;
    const scoreB = (b.rating || 4.0) * 20 - distB - penaltyB;

    return scoreB - scoreA;
  });

  const isActivelyFiltering = searchTerm.length > 0 || selectedEmirate !== 'All Emirates' || selectedCuisine !== 'All' || sortBy !== 'recommended';

  const MAX_DEFAULT = 6;
  const [showAllRestaurants, setShowAllRestaurants] = useState(false);

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

  const router = useRouter();

  // Handle restaurant selection — navigates directly to restaurant detail page with optional dish highlight parameter
  const handleSelectRestaurant = useCallback((restaurant, dishName = '') => {
    if (!restaurant) return;
    setSelectedRestaurant(restaurant);
    const slug = restaurant.slug || restaurant.id;
    const url = dishName 
      ? `/restaurant/${slug}?dish=${encodeURIComponent(dishName)}`
      : `/restaurant/${slug}`;
    router.push(url);
  }, [router]);

  const extendedSortOptions = [
    ...SORT_OPTIONS,
    ...(userLocation ? [{ value: 'nearest', label: 'Nearest First' }] : []),
  ];

  return (
    <div className="discover-page">
      <AppNavbar onSearchChange={setSearchTerm} searchValue={searchTerm} hideSearch={true} />
      <CartDrawer />

      {/* ─── Hero Search Section ─── */}
      <section className="discover-hero-section">
        <div className="discover-hero-glow" />
        <div className="discover-hero-content">
          <h1 className="discover-hero-heading">
            <span className="discover-hero-greeting">{getGreeting()},</span>
            <span className="discover-hero-question">what are you craving?</span>
          </h1>
          <div ref={heroSearchRef} className="hero-search-wrapper">
            <Search size={22} className="hero-search-icon" />
            <input
              type="text"
              className="hero-search-input"
              placeholder={placeholderText}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="off"
            />
            {searchTerm && (
              <button className="hero-search-clear" onClick={() => setSearchTerm('')}>
                <X size={18} />
              </button>
            )}
            <div className="hero-search-shortcut">⌘K</div>
          </div>
        </div>
      </section>

      {/* ─── Consolidated Filter Bar ─── */}
      <section className="discover-filter-bar">
        <div className="discover-filter-bar-inner">
          {/* Location pill */}
          <div className="filter-location-pill">
            {locationStatus === 'loading' && (
              <>
                <span className="filter-loc-pulse" />
                <span className="filter-loc-text">Locating...</span>
              </>
            )}
            {locationStatus === 'granted' && (
              <>
                <MapPin size={14} className="filter-loc-icon-svg" />
                <span className="filter-loc-text">
                  <strong>{locationName || 'Near you'}</strong>
                </span>
              </>
            )}
            {locationStatus === 'denied' && (
              <>
                <Globe size={14} className="filter-loc-icon-svg" />
                <span className="filter-loc-text">All UAE</span>
                <button className="filter-loc-enable" onClick={() => {
                  setLocationStatus('loading');
                  getUserLocation().then(async (loc) => {
                    setUserLocation(loc);
                    setLocationStatus('granted');
                    const name = await reverseGeocode(loc.lat, loc.lng);
                    if (name) setLocationName(name);
                  }).catch(() => setLocationStatus('denied'));
                }}>Enable</button>
              </>
            )}
          </div>

          {/* Emirate dropdown */}
          <CustomDropdown
            options={EMIRATES}
            value={selectedEmirate}
            onChange={setSelectedEmirate}
            icon={MapPin}
          />

          {/* Cuisine dropdown */}
          <CustomDropdown
            options={['All', 'Ethiopian', 'Eritrean', 'Vegetarian', 'Vegan']}
            value={selectedCuisine}
            onChange={setSelectedCuisine}
            icon={UtensilsCrossed}
          />

          {/* Sort + Count */}
          <div className="filter-right-group">
            <div className="filter-sort-wrap">
              <SlidersHorizontal size={14} className="filter-sort-icon" />
              <select
                className="filter-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {extendedSortOptions.map((opt) => {
                  let label = opt.label;
                  if (opt.value === 'recommended') {
                    label = language === 'am' ? 'የተመከሩ' : language === 'ti' ? 'ዝተመርጹ' : language === 'om' ? 'Kan Filatame' : opt.label;
                  } else if (opt.value === 'rating') {
                    label = language === 'am' ? 'ደረጃ (ከፍተኛ)' : language === 'ti' ? 'ደረጃ (ለዓሊ)' : language === 'om' ? 'Sadarkaa' : opt.label;
                  }
                  return <option key={opt.value} value={opt.value}>{label}</option>;
                })}
              </select>
            </div>
            <span className="filter-count-badge">
              {sortedRestaurants.length} place{sortedRestaurants.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </section>

      {/* ─── Split View: Left Panel + Map ─── */}
      <div className="discover-split-view">
        {/* Left Panel */}
        <div className="discover-left-panel">
          {/* Tabbed Section: Smart Picks / Price Compare */}
          {!isLoading && (
            <div className="discover-tabs-section">
              <div className="discover-tabs-header">
                <button
                  className={`discover-tab ${activeTab === 'suggestions' ? 'discover-tab-active' : ''}`}
                  onClick={() => setActiveTab('suggestions')}
                >
                  <Brain size={16} className="discover-tab-icon-svg" />
                  <span>Smart Picks</span>
                  <span className="discover-tab-badge">AI</span>
                </button>
                <button
                  className={`discover-tab ${activeTab === 'price' ? 'discover-tab-active' : ''}`}
                  onClick={() => setActiveTab('price')}
                >
                  <DollarSign size={16} className="discover-tab-icon-svg" />
                  <span>Compare Prices</span>
                </button>
              </div>
              <div className="discover-tabs-content">
                <div className={`discover-tab-panel ${activeTab === 'suggestions' ? 'discover-tab-panel-visible' : ''}`}>
                  <SmartSuggestions
                    restaurants={dbRestaurants}
                    userLocation={userLocation}
                    onSelectRestaurant={handleSelectRestaurant}
                    onSelectDish={() => {}}
                  />
                </div>
                <div className={`discover-tab-panel ${activeTab === 'price' ? 'discover-tab-panel-visible' : ''}`}>
                  <PriceCompare
                    restaurants={dbRestaurants}
                    userLocation={userLocation}
                    onSelectRestaurant={handleSelectRestaurant}
                  />
                </div>
              </div>
            </div>
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
                <div className="empty-icon">
                  <UtensilsCrossed size={48} />
                </div>
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
                    <Trophy size={18} className="discover-section-label-icon-svg" />
                    <span>Best picks near you</span>
                    {userLocation && (
                      <span className="discover-section-badge">
                        <MapPin size={10} /> Based on your location
                      </span>
                    )}
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
                {hiddenCount > 0 && !isActivelyFiltering && !showAllRestaurants && (
                  <button
                    className="discover-explore-more"
                    onClick={() => setShowAllRestaurants(true)}
                  >
                    <Search size={16} className="discover-explore-more-icon-svg" />
                    <span>Explore {hiddenCount} more restaurant{hiddenCount !== 1 ? 's' : ''}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg>
                  </button>
                )}
              </>
            )}
          </main>
        </div>

        {/* Right Panel — Map */}
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            <span>List</span>
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            <ShoppingCart size={16} />
            <span>{totalItems} {totalItems === 1 ? t('discover.stickyItem') : t('discover.stickyItems')}</span>
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