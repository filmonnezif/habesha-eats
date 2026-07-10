'use client';

import { useState, useMemo } from 'react';
import { haversineDistance, getRestaurantCoords, estimateTravelCost } from '@/lib/geo';
import { restaurants as hardcodedRestaurants, DISH_CATEGORIES } from '@/lib/data';

/**
 * PriceCompare — Cross-restaurant dish price comparison.
 * Lets users select a dish category and see a ranked comparison
 * of prices across all restaurants, including delivery/travel costs.
 */
export default function PriceCompare({
  restaurants = [],
  userLocation = null,
  onSelectRestaurant = () => {},
}) {
  const [selectedDish, setSelectedDish] = useState('shiro');
  const [showAll, setShowAll] = useState(false);

  const comparisons = useMemo(() => {
    const results = [];

    restaurants.forEach(r => {
      // Find matching hardcoded restaurant for menu data
      const hc = hardcodedRestaurants.find(hr => hr.slug === r.slug || hr.id === r.slug);
      const coords = getRestaurantCoords(r);
      let distance = null;
      if (coords && userLocation) {
        distance = haversineDistance(userLocation.lat, userLocation.lng, coords.lat, coords.lng);
      }

      const deliveryFee = r.deliveryFee ?? hc?.deliveryFee ?? null;
      const taxiCost = distance ? estimateTravelCost(distance, 'taxi') : null;

      if (hc && hc.menu) {
        // Search through menu for matching dish category
        hc.menu.forEach(cat => {
          cat.items?.forEach(item => {
            if (item.dishCategory === selectedDish) {
              const totalDelivery = deliveryFee !== null ? item.price + deliveryFee : null;
              const totalTaxi = taxiCost !== null ? item.price + taxiCost : null;

              results.push({
                restaurantId: r.id || r.slug,
                restaurantName: r.name,
                restaurantSlug: r.slug || r.id,
                rating: r.rating || 0,
                emirate: r.emirate || '',
                area: r.area || '',
                dishName: item.name,
                dishPrice: item.price,
                deliveryFee,
                taxiCost,
                totalDelivery,
                totalTaxi,
                distance,
                hasRealMenu: true,
                restaurant: r,
              });
            }
          });
        });
      } else {
        // Placeholder pricing for restaurants without menu data
        const placeholderPrices = {
          'shiro': { name: 'Shiro Wot', price: 35 },
          'doro-wot': { name: 'Doro Wot', price: 52 },
          'kitfo': { name: 'Kitfo', price: 65 },
          'tibs': { name: 'Tibs', price: 50 },
          'beyaynetu': { name: 'Beyaynetu', price: 48 },
          'coffee': { name: 'Coffee Ceremony', price: 25 },
          'injera': { name: 'Injera (3 pcs)', price: 10 },
          'dessert': { name: 'Dessert', price: 20 },
        };
        const placeholder = placeholderPrices[selectedDish];
        if (placeholder) {
          const estDelivery = 10;
          const totalDelivery = placeholder.price + estDelivery;
          const totalTaxi = taxiCost !== null ? placeholder.price + taxiCost : null;

          results.push({
            restaurantId: r.id || r.slug,
            restaurantName: r.name,
            restaurantSlug: r.slug || r.id,
            rating: r.rating || 0,
            emirate: r.emirate || '',
            area: r.area || '',
            dishName: `${placeholder.name} (est.)`,
            dishPrice: placeholder.price,
            deliveryFee: estDelivery,
            taxiCost,
            totalDelivery,
            totalTaxi,
            distance,
            hasRealMenu: false,
            restaurant: r,
          });
        }
      }
    });

    // Sort by total delivery cost (best deal first)
    results.sort((a, b) => {
      const aTotal = a.totalDelivery ?? a.dishPrice;
      const bTotal = b.totalDelivery ?? b.dishPrice;
      return aTotal - bTotal;
    });

    return results;
  }, [restaurants, userLocation, selectedDish]);

  const displayedComparisons = showAll ? comparisons : comparisons.slice(0, 5);

  // Current dish label
  const dishInfo = DISH_CATEGORIES.find(d => d.key === selectedDish);

  return (
    <section className="price-compare" id="price-compare">
      <div className="price-compare-header">
        <div>
          <h2 className="price-compare-title">
            <span className="price-compare-icon">💰</span>
            Price Compare
          </h2>
          <p className="price-compare-subtitle">
            Find the best deal — dish price + delivery included
          </p>
        </div>
      </div>

      {/* Dish Category Selector */}
      <div className="price-compare-dishes">
        {DISH_CATEGORIES.filter(d => ['shiro', 'doro-wot', 'kitfo', 'tibs', 'beyaynetu', 'coffee'].includes(d.key)).map(dish => (
          <button
            key={dish.key}
            className={`price-dish-pill ${selectedDish === dish.key ? 'price-dish-pill-active' : ''}`}
            onClick={() => { setSelectedDish(dish.key); setShowAll(false); }}
          >
            <span>{dish.emoji}</span>
            <span>{dish.label}</span>
          </button>
        ))}
      </div>

      {/* Comparison Results */}
      {comparisons.length === 0 ? (
        <div className="price-compare-empty">
          <span>No restaurants serve {dishInfo?.label || 'this dish'} yet</span>
        </div>
      ) : (
        <div className="price-compare-list">
          {displayedComparisons.map((item, idx) => (
            <button
              key={`${item.restaurantId}-${item.dishName}`}
              className={`price-compare-row ${idx === 0 ? 'price-compare-best' : ''}`}
              onClick={() => onSelectRestaurant(item.restaurant)}
            >
              {/* Rank */}
              <div className="price-compare-rank">
                {idx === 0 ? (
                  <span className="price-rank-badge">🏆</span>
                ) : (
                  <span className="price-rank-num">#{idx + 1}</span>
                )}
              </div>

              {/* Restaurant + Dish Info */}
              <div className="price-compare-info">
                <span className="price-compare-name">{item.restaurantName}</span>
                <span className="price-compare-dish">
                  {item.dishName}
                  {!item.hasRealMenu && <span className="price-est-badge">est.</span>}
                </span>
                <span className="price-compare-location">
                  {item.emirate}{item.area ? ` · ${item.area}` : ''}
                  {item.distance ? ` · ${item.distance.toFixed(1)} km` : ''}
                </span>
              </div>

              {/* Pricing Breakdown */}
              <div className="price-compare-costs">
                <div className="price-cost-row">
                  <span className="price-cost-label">Dish</span>
                  <span className="price-cost-value">AED {item.dishPrice}</span>
                </div>
                <div className="price-cost-row">
                  <span className="price-cost-label">+ Delivery</span>
                  <span className="price-cost-value">AED {item.deliveryFee ?? '—'}</span>
                </div>
                <div className="price-cost-row price-cost-total">
                  <span className="price-cost-label">Total</span>
                  <span className="price-cost-value">
                    AED {item.totalDelivery ?? item.dishPrice}
                  </span>
                </div>
              </div>

              {/* Rating */}
              <div className="price-compare-rating">
                <span>⭐ {item.rating}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Show More */}
      {comparisons.length > 5 && !showAll && (
        <button className="price-compare-more" onClick={() => setShowAll(true)}>
          Show all {comparisons.length} options
        </button>
      )}
    </section>
  );
}
