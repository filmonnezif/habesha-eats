'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AppNavbar from '@/components/AppNavbar';
import CartDrawer from '@/components/CartDrawer';
import RestaurantCard from '@/components/RestaurantCard';
import { useCart } from '@/lib/CartContext';
import Link from 'next/link';
import {
  restaurants,
  EMIRATES,
  CUISINES,
  SORT_OPTIONS,
  DISH_CATEGORIES,
  getDishesByCategory,
} from '@/lib/data';

function DiscoverContent() {
  const searchParams = useSearchParams();
  
  // State variables
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmirate, setSelectedEmirate] = useState('All Emirates');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [selectedDietary, setSelectedDietary] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [sortBy, setSortBy] = useState('recommended');
  const [showMap, setShowMap] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const { totalItems, subtotal, restaurantName } = useCart();

  // Initialize search query from URL if present
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearchTerm(q);
    
    // Simulate loading animation for rich premium feel
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [searchParams]);

  // Handle category pill click
  const handleCategoryClick = (categoryKey) => {
    if (activeCategory === categoryKey) {
      setActiveCategory(null);
    } else {
      setActiveCategory(categoryKey);
    }
  };

  // Toggle dietary filters
  const toggleDietary = (diet) => {
    setSelectedDietary((prev) =>
      prev.includes(diet) ? prev.filter((d) => d !== diet) : [...prev, diet]
    );
  };

  // Process data (Filter + Sort)
  const filteredRestaurants = restaurants.filter((restaurant) => {
    // 1. Search Query Match (checks restaurant name, tagline, description, area, tags)
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      const matchName = restaurant.name.toLowerCase().includes(query);
      const matchTagline = restaurant.tagline.toLowerCase().includes(query);
      const matchDesc = restaurant.description.toLowerCase().includes(query);
      const matchArea = restaurant.area.toLowerCase().includes(query);
      const matchTags = restaurant.tags.some((t) => t.toLowerCase().includes(query));
      
      // Also match if restaurant contains a dish matching the search term
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

    // 3. Cuisine Filter Match
    if (selectedCuisine !== 'All') {
      if (!restaurant.cuisine.some((c) => c.toLowerCase() === selectedCuisine.toLowerCase())) {
        return false;
      }
    }

    // 4. Dietary Filter Match
    if (selectedDietary.length > 0) {
      const hasAllDietary = selectedDietary.every((diet) => {
        const dietLower = diet.toLowerCase();
        // Check amenities or tags
        const matchAmenity = restaurant.amenities.includes(dietLower);
        const matchTag = restaurant.tags.some((t) => t.toLowerCase().includes(dietLower));
        // Or check menu items for vegan/vegetarian tags
        const matchMenuItems = restaurant.menu.some((cat) =>
          cat.items.some((item) => item.tags.includes(dietLower))
        );
        return matchAmenity || matchTag || matchMenuItems;
      });
      if (!hasAllDietary) return false;
    }

    // 5. Active Category Match (e.g. clicks Shiro, checks if restaurant sells Shiro)
    if (activeCategory) {
      const hasCategoryItem = restaurant.menu.some((cat) =>
        cat.items.some((item) => item.dishCategory === activeCategory)
      );
      if (!hasCategoryItem) return false;
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
      // Hardcoded sort order as placeholder
      return b.reviewCount - a.reviewCount;
    }
    // Recommended (default)
    return b.rating * b.reviewCount - a.rating * a.reviewCount;
  });

  return (
    <div className="discover-page">
      <AppNavbar onSearchChange={setSearchTerm} searchValue={searchTerm} />
      <CartDrawer />

      {/* Hero Header */}
      <header className="discover-hero">
        {/* Decorative background glow */}
        <div className="bg-glow bg-glow-green" aria-hidden="true" />
        <div className="bg-glow bg-glow-gold" style={{ top: '30%', right: '10%', opacity: 0.1 }} aria-hidden="true" />

        <h1 className="discover-hero-title">
          Discover <span className="highlight-gradient">Authentic Flavors</span>
        </h1>
        <p className="discover-hero-subtitle">
          Compare the finest Ethiopian & Eritrean kitchens, coffee ceremonies, and traditional Mesob dining across the Emirates.
        </p>
      </header>

      {/* Sticky Filters & Controls */}
      <section className="discover-controls">
        <div className="discover-controls-inner">
          <div className="discover-filters">
            {/* Emirate Dropdown Filter */}
            <select
              value={selectedEmirate}
              onChange={(e) => setSelectedEmirate(e.target.value)}
              className="discover-sort-select"
              style={{ background: 'rgba(255, 255, 255, 0.04)', paddingRight: '2rem' }}
            >
              {EMIRATES.map((e) => (
                <option key={e} value={e} style={{ background: '#121212', color: '#fff' }}>
                  {e}
                </option>
              ))}
            </select>

            {/* Cuisine Filter Pills */}
            {CUISINES.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCuisine(c)}
                className={`filter-pill ${selectedCuisine === c ? 'filter-pill-active' : ''}`}
              >
                {c === 'All' ? 'All Cuisines' : `${c} Cuisines`}
              </button>
            ))}

            {/* Vegetarian Filter Pill */}
            <button
              onClick={() => toggleDietary('Vegetarian')}
              className={`filter-pill ${selectedDietary.includes('Vegetarian') ? 'filter-pill-active' : ''}`}
            >
              🥗 Vegetarian
            </button>

            {/* Vegan Filter Pill */}
            <button
              onClick={() => toggleDietary('Vegan')}
              className={`filter-pill ${selectedDietary.includes('Vegan') ? 'filter-pill-active' : ''}`}
            >
              🌱 Vegan
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Map toggle */}
            <button
              onClick={() => setShowMap(!showMap)}
              className="map-toggle-btn"
              aria-label={showMap ? 'Show list grid' : 'Show map view'}
            >
              <span>{showMap ? '📋 List' : '📍 Map'}</span>
            </button>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="discover-sort-select"
              id="sort-select"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} style={{ background: '#121212', color: '#fff' }}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Horizontal Food Categories Bar */}
      <section className="categories-scroll">
        {DISH_CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => handleCategoryClick(cat.key)}
            className={`category-pill ${activeCategory === cat.key ? 'category-pill-active' : ''}`}
          >
            <span className="category-emoji">{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </section>

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
            <h2 className="empty-title">No Restaurants Found</h2>
            <p className="empty-desc">
              We couldn't find any kitchen matching your active filter criteria. Try adjusting your search query or removing filters.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedEmirate('All Emirates');
                setSelectedCuisine('All');
                setSelectedDietary([]);
                setActiveCategory(null);
              }}
              className="shiny-btn-mini"
            >
              Reset All Filters
            </button>
          </div>
        ) : showMap ? (
          <div className="discover-split-view">
            <div className="discover-grid" style={{ gridTemplateColumns: '1fr' }}>
              {sortedRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
            {/* Interactive Dark Map Container (Mocked for smooth performance) */}
            <div className="discover-map-container">
              <div style={{ position: 'absolute', inset: 0, background: '#111', opacity: 0.9 }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🗺️</div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Interactive Map
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', maxWidth: '280px', margin: '0 auto' }}>
                    Showing {sortedRestaurants.length} locations across the UAE. Map pins color-coded by culinary specialty.
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem' }}>
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(52, 199, 89, 0.15)', color: 'var(--color-habesha-green)', border: '1px solid var(--color-habesha-green)' }}>
                      Dubai ({sortedRestaurants.filter(r => r.emirate === 'Dubai').length})
                    </span>
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(252, 217, 0, 0.15)', color: 'var(--color-habesha-gold)', border: '1px solid var(--color-habesha-gold)' }}>
                      Abu Dhabi ({sortedRestaurants.filter(r => r.emirate === 'Abu Dhabi').length})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="discover-grid">
            {sortedRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </main>

      {/* Sticky Bottom Cart Bar */}
      {totalItems > 0 && (
        <div className="sticky-order-bar">
          <div className="sticky-order-info">
            <span>🛒 {totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>|</span>
            <span style={{ color: 'var(--color-habesha-green)', fontWeight: 700 }}>AED {subtotal}</span>
            <span className="sticky-order-restaurant">from {restaurantName}</span>
          </div>
          <button
            onClick={() => {
              const btn = document.getElementById('cart-btn');
              if (btn) btn.click();
            }}
            className="shiny-btn-mini"
            style={{ padding: '0.5rem 1.25rem' }}
          >
            View Cart &rarr;
          </button>
        </div>
      )}
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<div className="discover-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#000', color: '#fff' }}>Loading Discover...</div>}>
      <DiscoverContent />
    </Suspense>
  );
}
