'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { gsap } from 'gsap';
import { haversineDistance, getRestaurantCoords, estimateDeliveryFee, estimateTravelCost } from '@/lib/geo';
import { Search, X, Truck, Car, TrendingDown, TrendingUp, Trophy, MapPin, Star, Zap, ChevronDown, Navigation, CheckCircle2, BadgePercent, BarChart3, Clock, DollarSign, Sparkles } from 'lucide-react';

const LOADING_MESSAGES = [
  { icon: '🍲', text: 'Hunting down the freshest Shiro & Kitfo prices...', detail: 'Scanning menus from Dubai, Abu Dhabi, Sharjah & Ajman...' },
  { icon: '🚀', text: 'Calculating exact GPS distance & delivery fees...', detail: 'Checking real-time distance from your current location...' },
  { icon: '💰', text: 'Uncovering secret deals and hidden savings...', detail: 'Comparing menu prices, service charges & travel costs...' },
  { icon: '🛵', text: 'Evaluating delivery times & dine-in travel routes...', detail: 'Finding the fastest and cheapest option for your cravings...' },
  { icon: '🇪🇹', text: 'Bringing authentic Ethiopian & Eritrean flavors to your table...', detail: 'Almost ready — sorting top-rated restaurants!' },
];

/**
 * PriceCompare — Cross-restaurant dish price comparison.
 */
export default function PriceCompare({
  restaurants = [],
  userLocation = null,
  onSelectRestaurant = () => {},
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [accessMode, setAccessMode] = useState('delivery'); // 'delivery' | 'pickup'
  const [showAll, setShowAll] = useState(false);
  const [sortStrategy, setSortStrategy] = useState('total'); // 'total', 'value', 'rating'
  const [dishesData, setDishesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const debounceRef = useRef(null);
  const loadingBannerRef = useRef(null);
  const loadingTextRef = useRef(null);
  const searchInputRef = useRef(null);

  // Debounced search — 350ms after user stops typing
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery]);

  // Fetch dish data from API when debounced query or access mode changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setDishesData(null);
      setHasSearched(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setHasSearched(true);

    async function fetchDishes() {
      try {
        const params = new URLSearchParams({ q: debouncedQuery, sort: 'total' });
        if (userLocation) {
          params.set('lat', userLocation.lat);
          params.set('lng', userLocation.lng);
        }
        const res = await fetch(`/api/dishes?${params}`);
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        if (!cancelled) setDishesData(data);
      } catch (err) {
        console.warn('PriceCompare: Failed to fetch dishes:', err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchDishes();
    return () => { cancelled = true; };
  }, [debouncedQuery, userLocation]);

  // Cycle loading messages with smooth GSAP fade & slide transitions
  useEffect(() => {
    if (!loading) {
      setLoadingMsgIdx(0);
      return;
    }

    const interval = setInterval(() => {
      if (loadingTextRef.current) {
        gsap.to(loadingTextRef.current, {
          opacity: 0,
          y: -8,
          duration: 0.22,
          onComplete: () => {
            setLoadingMsgIdx(prev => (prev + 1) % LOADING_MESSAGES.length);
            gsap.fromTo(loadingTextRef.current,
              { opacity: 0, y: 8 },
              { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
            );
          }
        });
      }
    }, 1800);

    return () => clearInterval(interval);
  }, [loading]);

  // GSAP Banner Aura & Skeleton Pulse Effect
  useEffect(() => {
    if (!loading || !loadingBannerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to(loadingBannerRef.current, {
        boxShadow: '0 0 25px rgba(252, 217, 0, 0.35), 0 0 45px rgba(52, 199, 89, 0.25)',
        repeat: -1,
        yoyo: true,
        duration: 1.2,
        ease: 'sine.inOut'
      });
      gsap.fromTo('.price-compare-row-skeleton', 
        { opacity: 0.3, scale: 0.98 }, 
        { opacity: 1, scale: 1, duration: 0.6, repeat: -1, yoyo: true, stagger: 0.12, ease: 'power1.inOut' }
      );
    }, loadingBannerRef);
    return () => ctx.revert();
  }, [loading]);

  // Process comparisons from API data
  const comparisons = useMemo(() => {
    if (!dishesData?.dishes?.length) return [];

    const results = dishesData.dishes.map(dish => {
      const restaurant = restaurants.find(r => r.id === dish.restaurant.id || r.id === String(dish.restaurant.id) || r.slug === dish.restaurant.slug);
      const coords = getRestaurantCoords(restaurant || dish.restaurant);
      let distance = userLocation && coords ? haversineDistance(userLocation.lat, userLocation.lng, coords.lat, coords.lng) : (dish.distance || null);

      // Recalculate dynamic fees based on exact synchronized distance
      const deliveryFee = Math.round(distance != null ? estimateDeliveryFee(distance) : (dish.delivery?.fee ?? 10));
      const pickupCost = Math.round(distance != null ? estimateTravelCost(distance, 'drive') : (dish.pickup?.cost ?? 0));
      const dishPrice = Math.round(dish.price);
      const serviceFee = Math.round(dishPrice * 0.05);

      const totalDelivery = Math.round(dishPrice + deliveryFee + serviceFee);
      const totalPickup = Math.round(dishPrice + pickupCost + serviceFee);

      return {
        id: dish.id,
        restaurantId: dish.restaurant.id,
        restaurantName: dish.restaurant.name,
        restaurantSlug: dish.restaurant.slug,
        rating: dish.restaurant.rating,
        reviewCount: dish.restaurant.reviewCount,
        emirate: dish.restaurant.emirate,
        area: dish.restaurant.area,
        dishName: dish.name,
        dishPrice,
        dishImage: dish.imageUrl,
        deliveryFee,
        pickupCost,
        serviceFee,
        totalDelivery,
        totalPickup,
        distance,
        hasRealMenu: true,
        restaurant: restaurant || dish.restaurant,
        categoryName: dish.categoryName,
      };
    });

    // Sort based on strategy and access mode with distance weighting
    const totalKey = accessMode === 'pickup' ? 'totalPickup' : 'totalDelivery';
    switch (sortStrategy) {
      case 'rating':
        results.sort((a, b) => b.rating - a.rating || a[totalKey] - b[totalKey]);
        break;
      case 'value': {
        results.sort((a, b) => {
          const distA = a.distance ?? 0;
          const distB = b.distance ?? 0;
          const distFactorA = Math.max(0.2, 1 - distA / 50);
          const distFactorB = Math.max(0.2, 1 - distB / 50);
          const scoreA = (a.rating * distFactorA) / Math.log2(a[totalKey] + 1);
          const scoreB = (b.rating * distFactorB) / Math.log2(b[totalKey] + 1);
          return scoreB - scoreA;
        });
        break;
      }
      case 'total':
      default: {
        results.sort((a, b) => {
          const distA = a.distance ?? 0;
          const distB = b.distance ?? 0;
          const penaltyA = distA > 35 ? 100 : 0;
          const penaltyB = distB > 35 ? 100 : 0;
          return (a[totalKey] + penaltyA) - (b[totalKey] + penaltyB);
        });
        break;
      }
    }

    return results;
  }, [dishesData, restaurants, userLocation, sortStrategy, accessMode]);

  // Compute stats
  const stats = useMemo(() => {
    if (!comparisons.length) return null;
    const totalKey = accessMode === 'pickup' ? 'totalPickup' : 'totalDelivery';
    const totals = comparisons.map(c => c[totalKey]);
    const avgTotal = totals.reduce((s, t) => s + t, 0) / totals.length;
    const savings = comparisons[0] ? avgTotal - comparisons[0][totalKey] : 0;

    return {
      count: comparisons.length,
      avgTotal: Math.round(avgTotal),
      minTotal: Math.min(...totals),
      maxTotal: Math.max(...totals),
      savings: Math.max(0, Math.round(savings)),
      savingsPercent: avgTotal > 0 ? Math.round((savings / avgTotal) * 100) : 0,
      priceRange: Math.max(...totals) - Math.min(...totals),
    };
  }, [comparisons, accessMode]);

  const displayedComparisons = showAll ? comparisons : comparisons.slice(0, 5);
  const totalKey = accessMode === 'pickup' ? 'totalPickup' : 'totalDelivery';
  const maxTotal = comparisons.length > 0 ? Math.max(...comparisons.map(c => c[totalKey]), 1) : 100;

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setDishesData(null);
    setHasSearched(false);
    searchInputRef.current?.focus();
  };

  // Quick suggestion chips
  const quickSuggestions = ['shiro', 'kitfo', 'tibs', 'doro wot', 'beyaynetu', 'coffee', 'injera', 'rice', 'pasta'];

  return (
    <section className="price-compare" id="price-compare">
      {/* Header */}
      <div className="price-compare-header">
        <div className="price-compare-header-left">
          <h2 className="price-compare-title">
            <span className="price-compare-icon">
              <BarChart3 size={18} />
            </span>
            Price Compare
          </h2>
          <p className="price-compare-subtitle">
            Search any dish — compare total cost across restaurants
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="price-compare-search-wrap">
        <div className="price-compare-search-input-wrap">
          <Search size={16} className="price-compare-search-icon" />
          <input
            ref={searchInputRef}
            type="text"
            className="price-compare-search-input"
            placeholder="Search a dish... (e.g. shiro, kitfo, tibs, rice)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
          />
          {searchQuery && (
            <button className="price-compare-search-clear" onClick={clearSearch}>
              <X size={16} />
            </button>
          )}
          {loading && <div className="price-compare-search-spinner" />}
        </div>
      </div>

      {/* Quick Suggestions (only show when empty) */}
      {!searchQuery && !hasSearched && (
        <div className="price-compare-quick-suggestions">
          <span className="price-compare-quick-label">Try:</span>
          {quickSuggestions.map(s => (
            <button
              key={s}
              className="price-compare-quick-chip"
              onClick={() => setSearchQuery(s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Access Mode Toggle + Sort (only show when results exist) */}
      {comparisons.length > 0 && (
        <div className="price-compare-controls">
          {/* Delivery / Pickup Toggle */}
          <div className="price-compare-mode-toggle">
            <button
              className={`price-mode-btn ${accessMode === 'delivery' ? 'active' : ''}`}
              onClick={() => setAccessMode('delivery')}
            >
              <Truck size={14} />
              <span>Delivery</span>
            </button>
            <button
              className={`price-mode-btn ${accessMode === 'pickup' ? 'active' : ''}`}
              onClick={() => setAccessMode('pickup')}
            >
              <Car size={14} />
              <span>Pickup</span>
            </button>
          </div>

          {/* Sort Toggles */}
          <div className="price-compare-sort-toggles">
            <button
              className={`price-sort-btn ${sortStrategy === 'total' ? 'active' : ''}`}
              onClick={() => setSortStrategy('total')}
            >
              <DollarSign size={12} /> Cheapest
            </button>
            <button
              className={`price-sort-btn ${sortStrategy === 'value' ? 'active' : ''}`}
              onClick={() => setSortStrategy('value')}
            >
              <Zap size={12} /> Best Value
            </button>
            <button
              className={`price-sort-btn ${sortStrategy === 'rating' ? 'active' : ''}`}
              onClick={() => setSortStrategy('rating')}
            >
              <Star size={12} /> Top Rated
            </button>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      {stats && (
        <div className="price-compare-stats-bar">
          <div className="price-stat-item">
            <TrendingDown size={14} className="price-stat-icon green" />
            <span className="price-stat-label">Best Deal</span>
            <span className="price-stat-value">AED {stats.minTotal}</span>
          </div>
          <div className="price-stat-item">
            <DollarSign size={14} className="price-stat-icon" />
            <span className="price-stat-label">Average</span>
            <span className="price-stat-value">AED {stats.avgTotal}</span>
          </div>
          <div className="price-stat-item">
            <TrendingUp size={14} className="price-stat-icon red" />
            <span className="price-stat-label">Highest</span>
            <span className="price-stat-value">AED {stats.maxTotal}</span>
          </div>
          {stats.savings > 0 && (
            <div className="price-stat-item price-stat-savings">
              <BadgePercent size={14} className="price-stat-icon gold" />
              <span className="price-stat-label">Save Up To</span>
              <span className="price-stat-value gold">AED {stats.savings}</span>
            </div>
          )}
        </div>
      )}

      {/* Loading State with GSAP Animated Radar & Rotating Messages */}
      {loading && (
        <div className="price-compare-loading-wrap">
          <div ref={loadingBannerRef} className="price-compare-processing-banner g-pulse-banner">
            <div className="processing-radar-wrapper">
              <div className="processing-radar-ring ring-1" />
              <div className="processing-radar-ring ring-2" />
              <div className="processing-spinner" />
              <Sparkles size={14} className="processing-sparkle-icon" />
            </div>

            <div ref={loadingTextRef} className="processing-text-col">
              <div className="processing-title-row">
                <span className="processing-msg-icon">{LOADING_MESSAGES[loadingMsgIdx].icon}</span>
                <span className="processing-title">{LOADING_MESSAGES[loadingMsgIdx].text}</span>
              </div>
              <span className="processing-subtitle">{LOADING_MESSAGES[loadingMsgIdx].detail}</span>
            </div>
          </div>

          <div className="price-compare-loading">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="price-compare-row-skeleton" />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && hasSearched && comparisons.length === 0 && (
        <div className="price-compare-empty">
          <span className="price-compare-empty-icon">🍽️</span>
          <span>No dishes found for "{debouncedQuery}"</span>
          <span className="price-compare-empty-hint">Try a different search term</span>
        </div>
      )}

      {/* Initial State (no search yet) */}
      {!hasSearched && !loading && (
        <div className="price-compare-empty">
          <span className="price-compare-empty-icon">🔍</span>
          <span>Search for a dish to compare prices</span>
          <span className="price-compare-empty-hint">Type any food name above to see real-time price comparison</span>
        </div>
      )}

      {/* Comparison Results */}
      {!loading && comparisons.length > 0 && (
        <div className="price-compare-list">
          {displayedComparisons.map((item, idx) => {
            const isBest = idx === 0;
            const currentTotal = item[totalKey];
            const savingsVsAvg = stats ? stats.avgTotal - currentTotal : 0;
            const barWidth = (currentTotal / maxTotal) * 100;
            const feeLabel = accessMode === 'delivery' ? 'Delivery Fee' : 'Dine-In Travel Cost';
            const feeValue = accessMode === 'delivery' ? item.deliveryFee : item.pickupCost;
            const timeLabel = accessMode === 'delivery' 
              ? (item.distance ? `${Math.round(item.distance * 2.5 + 10)} min` : '30 min')
              : (item.distance ? `${Math.round(item.distance * 2.5)} min drive` : '15 min');

            return (
              <div
                key={`${item.restaurantId}-${item.dishName}`}
                className={`price-compare-row ${isBest ? 'price-compare-best' : ''} ${expandedRow === item.id ? 'price-compare-expanded' : ''}`}
              >
                <button
                  className="price-compare-row-main"
                  onClick={() => toggleRow(item.id)}
                >
                  {/* Rank */}
                  <div className="price-compare-rank">
                    {isBest ? (
                      <div className="price-rank-badge">
                        <Trophy size={14} />
                      </div>
                    ) : (
                      <span className="price-rank-num">#{idx + 1}</span>
                    )}
                  </div>

                  {/* Dish Image */}
                  <div className="price-compare-image">
                    <img 
                      src={item.dishImage || '/images/dish_injera.webp'} 
                      alt={item.dishName}
                      loading="lazy"
                      onError={(e) => { e.target.src = '/images/dish_injera.webp'; }}
                    />
                    {isBest && <span className="price-compare-best-badge">Best Deal</span>}
                  </div>

                  {/* Info */}
                  <div className="price-compare-info">
                    <span className="price-compare-name">{item.restaurantName}</span>
                    <span className="price-compare-dish">{item.dishName}</span>
                    <span className="price-compare-meta">
                      <Star size={10} /> {item.rating}
                      {item.distance && <><MapPin size={10} /> {item.distance.toFixed(1)} km</>}
                      {item.emirate && <span>· {item.emirate}</span>}
                      <span>· <Clock size={10} /> {timeLabel}</span>
                    </span>
                  </div>

                  {/* Bar Chart */}
                  <div className="price-compare-bar-section">
                    <div className="price-compare-bar-wrapper">
                      <div 
                        className={`price-compare-bar ${isBest ? 'price-bar-best' : ''}`}
                        style={{ width: `${Math.max(barWidth, 8)}%` }}
                      >
                        <span className="price-bar-inner-label">
                          AED {Math.round(currentTotal)}
                        </span>
                      </div>
                    </div>
                    {/* Dual cost preview */}
                    <div className="price-compare-dual-preview">
                      <span className={`price-dual-label ${accessMode === 'delivery' ? 'active' : ''}`}>
                        <Truck size={9} /> AED {Math.round(item.totalDelivery)}
                      </span>
                      <span className={`price-dual-label ${accessMode === 'pickup' ? 'active' : ''}`}>
                        <Car size={9} /> AED {Math.round(item.totalPickup)}
                      </span>
                    </div>
                  </div>

                  {/* Expand Arrow */}
                  <div className="price-compare-expand-icon">
                    <ChevronDown size={16} className={expandedRow === item.id ? 'rotated' : ''} />
                  </div>
                </button>

                {/* Expanded Breakdown */}
                {expandedRow === item.id && (
                  <div className="price-compare-breakdown">
                    <div className="price-breakdown-grid">
                      <div className="price-breakdown-item">
                        <span className="breakdown-label">Dish Price</span>
                        <span className="breakdown-value">AED {item.dishPrice}</span>
                      </div>
                      <div className="price-breakdown-plus">+</div>
                      <div className="price-breakdown-item">
                        <span className="breakdown-label">{feeLabel}</span>
                        <span className="breakdown-value">AED {feeValue}</span>
                      </div>
                      <div className="price-breakdown-plus">+</div>
                      <div className="price-breakdown-item">
                        <span className="breakdown-label">Service Fee (5%)</span>
                        <span className="breakdown-value">AED {item.serviceFee}</span>
                      </div>
                      <div className="price-breakdown-equals">=</div>
                      <div className="price-breakdown-item price-breakdown-total">
                        <span className="breakdown-label">Total ({accessMode === 'delivery' ? 'Delivery' : 'Pickup'})</span>
                        <span className="breakdown-value">AED {currentTotal}</span>
                      </div>
                    </div>

                    {/* Distance info */}
                    {item.distance && (
                      <div className="price-breakdown-distance">
                        <MapPin size={12} />
                        <span>{item.distance.toFixed(1)} km from you</span>
                        {item.distance > 20 && (
                          <span className="price-breakdown-cross-emirate">Cross-emirate</span>
                        )}
                      </div>
                    )}

                    {/* Savings Highlight */}
                    {savingsVsAvg > 0 && isBest && (
                      <div className="price-breakdown-savings">
                        <CheckCircle2 size={14} />
                        <span>Save AED {Math.round(savingsVsAvg)} vs. the average ({stats.savingsPercent}% less)</span>
                      </div>
                    )}
                    {savingsVsAvg <= 0 && isBest && (
                      <div className="price-breakdown-savings muted">
                        <CheckCircle2 size={14} />
                        <span>Already the best deal at AED {currentTotal}</span>
                      </div>
                    )}
                    {!isBest && savingsVsAvg > 0 && (
                      <div className="price-breakdown-savings subtle">
                        <span>AED {Math.round(savingsVsAvg)} below average</span>
                      </div>
                    )}

                    {/* Direct Link */}
                    <button
                      className="price-breakdown-link"
                      onClick={(e) => { e.stopPropagation(); onSelectRestaurant(item.restaurant, item.dishName); }}
                    >
                      <Navigation size={12} /> View {item.restaurantName} menu
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Show More */}
      {comparisons.length > 5 && !showAll && (
        <button className="price-compare-more" onClick={() => setShowAll(true)}>
          <ChevronDown size={14} />
          <span>Show all {comparisons.length} options</span>
        </button>
      )}

      {/* Market Summary */}
      {stats && !showAll && comparisons.length > 0 && (
        <div className="price-compare-summary">
          <div className="price-summary-row">
            <span className="price-summary-label">Market Range ({accessMode})</span>
            <div className="price-summary-range">
              <span className="price-summary-min">AED {stats.minTotal}</span>
              <div className="price-summary-range-bar">
                <div className="price-summary-range-fill" style={{ left: `${((stats.avgTotal - stats.minTotal) / (stats.maxTotal - stats.minTotal || 1)) * 100}%` }} />
              </div>
              <span className="price-summary-max">AED {stats.maxTotal}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}