'use client';

import { useMemo } from 'react';
import { haversineDistance, getRestaurantCoords } from '@/lib/geo';
import { restaurants as hardcodedRestaurants, DISH_CATEGORIES } from '@/lib/data';

/**
 * SmartSuggestions — AI-like proactive food & restaurant recommendations.
 * Horizontal scrollable cards that analyze distance, price, and rating
 * to surface the best options for the user.
 */
export default function SmartSuggestions({
  restaurants = [],
  userLocation = null,
  onSelectRestaurant = () => {},
  onSelectDish = () => {},
}) {
  const suggestions = useMemo(() => {
    if (!restaurants.length) return [];

    const cards = [];

    // Compute distances for all restaurants
    const withDistance = restaurants.map(r => {
      const coords = getRestaurantCoords(r);
      let distance = null;
      if (coords && userLocation) {
        distance = haversineDistance(userLocation.lat, userLocation.lng, coords.lat, coords.lng);
      }
      return { ...r, _distance: distance };
    }).filter(r => getRestaurantCoords(r));

    const sorted = [...withDistance].sort((a, b) => (a._distance ?? 999) - (b._distance ?? 999));

    // 1. Closest Open Restaurant
    const closest = sorted[0];
    if (closest) {
      cards.push({
        id: 'closest',
        icon: '📍',
        title: 'Closest to You',
        subtitle: closest.name,
        detail: closest._distance ? `${closest._distance.toFixed(1)} km away` : 'Nearby',
        accent: 'green',
        restaurant: closest,
      });
    }

    // 2. Best Shiro Deal (cheapest shiro including delivery)
    const shiroOptions = [];
    withDistance.forEach(r => {
      const hc = hardcodedRestaurants.find(hr => hr.slug === r.slug || hr.id === r.slug);
      if (!hc) return;
      hc.menu?.forEach(cat => {
        cat.items?.forEach(item => {
          if (item.dishCategory === 'shiro') {
            const deliveryFee = r.deliveryFee ?? hc.deliveryFee ?? 10;
            const totalCost = item.price + deliveryFee;
            shiroOptions.push({
              item, restaurant: r, hc, totalCost, deliveryFee,
              distance: r._distance,
            });
          }
        });
      });
    });
    shiroOptions.sort((a, b) => a.totalCost - b.totalCost);
    if (shiroOptions.length > 0) {
      const best = shiroOptions[0];
      cards.push({
        id: 'best-shiro',
        icon: '🫘',
        title: 'Best Shiro Deal',
        subtitle: `${best.item.name} · ${best.restaurant.name}`,
        detail: `AED ${best.item.price} + ${best.deliveryFee} delivery = AED ${best.totalCost}`,
        accent: 'gold',
        restaurant: best.restaurant,
        dish: 'shiro',
      });
    }

    // 3. Top Rated Nearby (highest rated within 5km, or overall)
    const nearbyTop = sorted
      .filter(r => !r._distance || r._distance <= 10)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
    if (nearbyTop && nearbyTop.id !== closest?.id) {
      cards.push({
        id: 'top-rated',
        icon: '⭐',
        title: 'Top Rated Nearby',
        subtitle: nearbyTop.name,
        detail: `${nearbyTop.rating}★ · ${nearbyTop._distance ? nearbyTop._distance.toFixed(1) + ' km' : ''}`,
        accent: 'gold',
        restaurant: nearbyTop,
      });
    }

    // 4. Budget Friendly — lowest price range restaurant
    const budget = withDistance
      .filter(r => r.priceRange === '$' || r.price_range === '$')
      .sort((a, b) => (a._distance ?? 999) - (b._distance ?? 999))[0];
    if (budget) {
      cards.push({
        id: 'budget',
        icon: '💰',
        title: 'Budget Friendly',
        subtitle: budget.name,
        detail: `${budget.priceRange || budget.price_range} · ${budget._distance ? budget._distance.toFixed(1) + ' km' : ''}`,
        accent: 'green',
        restaurant: budget,
      });
    }

    // 5. Best Kitfo
    const kitfoOptions = [];
    withDistance.forEach(r => {
      const hc = hardcodedRestaurants.find(hr => hr.slug === r.slug || hr.id === r.slug);
      if (!hc) return;
      hc.menu?.forEach(cat => {
        cat.items?.forEach(item => {
          if (item.dishCategory === 'kitfo') {
            kitfoOptions.push({ item, restaurant: r, price: item.price, distance: r._distance });
          }
        });
      });
    });
    kitfoOptions.sort((a, b) => (b.restaurant.rating || 0) - (a.restaurant.rating || 0));
    if (kitfoOptions.length > 0) {
      const best = kitfoOptions[0];
      cards.push({
        id: 'best-kitfo',
        icon: '🥩',
        title: 'Best Rated Kitfo',
        subtitle: `${best.item.name} · ${best.restaurant.name}`,
        detail: `AED ${best.price} · ${best.restaurant.rating}★`,
        accent: 'red',
        restaurant: best.restaurant,
        dish: 'kitfo',
      });
    }

    // 6. Try Something New — furthest restaurant (explore)
    const furthest = sorted[sorted.length - 1];
    if (furthest && furthest.id !== closest?.id && sorted.length > 2) {
      cards.push({
        id: 'explore',
        icon: '🧭',
        title: 'Try Something New',
        subtitle: furthest.name,
        detail: `${furthest.emirate || ''} · ${furthest._distance ? furthest._distance.toFixed(1) + ' km' : 'Explore'}`,
        accent: 'blue',
        restaurant: furthest,
      });
    }

    return cards;
  }, [restaurants, userLocation]);

  if (suggestions.length === 0) return null;

  return (
    <section className="smart-suggestions" id="smart-suggestions">
      <div className="smart-suggestions-header">
        <h2 className="smart-suggestions-title">
          <span className="smart-suggestions-ai-badge">✨ AI</span>
          Picked for You
        </h2>
        <p className="smart-suggestions-subtitle">Smart picks based on your location, prices & ratings</p>
      </div>
      <div className="smart-suggestions-scroll">
        {suggestions.map((card) => (
          <button
            key={card.id}
            className={`smart-card smart-card-${card.accent}`}
            onClick={() => {
              onSelectRestaurant(card.restaurant);
              if (card.dish) onSelectDish(card.dish);
            }}
          >
            <div className="smart-card-icon">{card.icon}</div>
            <div className="smart-card-content">
              <span className="smart-card-title">{card.title}</span>
              <span className="smart-card-subtitle">{card.subtitle}</span>
              <span className="smart-card-detail">{card.detail}</span>
            </div>
            <div className="smart-card-arrow">→</div>
          </button>
        ))}
      </div>
    </section>
  );
}
