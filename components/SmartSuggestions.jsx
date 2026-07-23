'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { haversineDistance, getRestaurantCoords } from '@/lib/geo';
import { Brain, Sparkles, TrendingUp, Clock, MapPin, DollarSign, Star, Navigation, Compass, Flame, Trophy, UtensilsCrossed, ChevronRight } from 'lucide-react';

/**
 * SmartSuggestions — Intelligent food & restaurant recommendations.
 * Fetches real menu/pricing data from the API, computes smart picks based on
 * distance, price, rating, time-of-day, and value scoring.
 */
export default function SmartSuggestions({
  restaurants = [],
  userLocation = null,
  onSelectRestaurant = () => {},
  onSelectDish = () => {},
}) {
  const [dishesData, setDishesData] = useState(null);
  const [aiPicks, setAiPicks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real dish data from API & Gemini AI Picks
  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        const params = new URLSearchParams({ sort: 'total' });
        if (userLocation) {
          params.set('lat', userLocation.lat);
          params.set('lng', userLocation.lng);
        }

        // Parallel fetch for dishes and Gemini AI smart picks
        const [dishesRes, aiRes] = await Promise.allSettled([
          fetch(`/api/dishes?${params}`),
          fetch('/api/ai/smart-picks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userLocation,
              restaurants: restaurants.slice(0, 10),
              timeOfDay: getHourContext(),
            }),
          }),
        ]);

        if (dishesRes.status === 'fulfilled' && dishesRes.value.ok) {
          const dData = await dishesRes.value.json();
          if (!cancelled) setDishesData(dData);
        }

        if (aiRes.status === 'fulfilled' && aiRes.value.ok) {
          const aiData = await aiRes.value.json();
          if (!cancelled && aiData.suggestions?.length) {
            setAiPicks(aiData.suggestions);
          }
        }
      } catch (err) {
        console.warn('SmartSuggestions: Failed to fetch data, using local heuristics:', err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, [userLocation, restaurants]);

  function getHourContext() {
    const hour = new Date().getHours();
    if (hour < 11) return 'breakfast';
    if (hour < 15) return 'lunch';
    if (hour < 19) return 'snack';
    return 'dinner';
  }

  // Get time-of-day context
  const timeContext = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return { type: 'breakfast', icon: '🌅', label: 'Breakfast Picks' };
    if (hour >= 11 && hour < 15) return { type: 'lunch', icon: '☀️', label: 'Lunch Favorites' };
    if (hour >= 15 && hour < 19) return { type: 'snack', icon: '🫖', label: 'Coffee & Snacks' };
    return { type: 'dinner', icon: '🌙', label: 'Dinner Specials' };
  }, []);

  // Time-appropriate dish categories
  const timeDishMap = {
    breakfast: ['injera', 'coffee'],
    lunch: ['beyaynetu', 'tibs', 'shiro'],
    snack: ['coffee', 'dessert', 'injera'],
    dinner: ['doro-wot', 'kitfo', 'tibs', 'beyaynetu'],
  };

  const suggestions = useMemo(() => {
    if (!restaurants.length) return [];

    const cards = [];
    const allDishes = dishesData?.dishes || [];

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

    // Calculate value scores for all restaurants (rating ÷ log(price+1) × distance factor)
    const valueScored = withDistance.map(r => {
      const price = r.deliveryFee || 10;
      const rating = r.rating || 4.0;
      const distanceFactor = r._distance ? Math.max(0.3, 1 - r._distance / 50) : 1;
      const valueScore = rating * distanceFactor / Math.log2(price + 1);
      return { ...r, _valueScore: valueScore };
    }).sort((a, b) => (b._valueScore || 0) - (a._valueScore || 0));

    // ─── 1. Closest to You ───
    const closest = sorted[0];
    if (closest) {
      cards.push({
        id: 'closest',
        icon: <MapPin size={20} />,
        title: 'Closest to You',
        subtitle: closest.name,
        detail: closest._distance ? `${closest._distance.toFixed(1)} km away` : 'Nearby',
        accent: 'green',
        restaurant: closest,
        actionLabel: 'View restaurant',
      });
    }

    // ─── 2. Best Value (real data) ───
    if (allDishes.length > 0) {
      // Find cheapest dish within 10km with good rating
      const valueDishes = allDishes
        .filter(d => d.restaurant?.rating >= 4.0)
        .sort((a, b) => a.totals.withDelivery - b.totals.withDelivery);

      if (valueDishes.length > 0) {
        const bestValue = valueDishes[0];
        const restaurant = restaurants.find(r => r.id === bestValue.restaurant.id || r.id === String(bestValue.restaurant.id));
        cards.push({
          id: 'best-value',
          icon: <DollarSign size={20} />,
          title: 'Best Value Deal',
          subtitle: bestValue.name ? `${bestValue.name} · ${bestValue.restaurant.name}` : bestValue.restaurant.name,
          detail: `AED ${bestValue.totals.withDelivery} total (incl. delivery)`,
          accent: 'gold',
          restaurant: restaurant || withDistance.find(r => r.id === bestValue.restaurant.id),
          dish: bestValue.name,
          valueDetail: dishesData?.stats ? `${Math.round((dishesData.stats.avgTotal - bestValue.totals.withDelivery) / dishesData.stats.avgTotal * 100)}% below avg` : null,
        });
      }
    }

    // ─── 3. Time-of-Day Pick ───
    const timeCategories = timeDishMap[timeContext.type] || [];
    const timeDishes = allDishes.filter(d => timeCategories.includes(d.dishCategory));
    const bestTimeDish = timeDishes
      .filter(d => d.restaurant?.rating >= 4.0)
      .sort((a, b) => a.totals.withDelivery - b.totals.withDelivery)[0];

    if (bestTimeDish) {
      const restaurant = restaurants.find(r => r.id === bestTimeDish.restaurant.id || r.id === String(bestTimeDish.restaurant.id));
      cards.push({
        id: 'time-of-day',
        icon: <Clock size={20} />,
        title: timeContext.label,
        subtitle: bestTimeDish.name ? `${bestTimeDish.name} · ${bestTimeDish.restaurant.name}` : bestTimeDish.restaurant.name,
        detail: `AED ${bestTimeDish.totals.withDelivery} · ${bestTimeDish.restaurant.rating}★`,
        accent: 'blue',
        restaurant: restaurant || withDistance.find(r => r.id === bestTimeDish.restaurant.id),
        dish: bestTimeDish.name,
        timeContext: timeContext.type,
      });
    } else {
      // Fallback: use local restaurant scoring
      const timeRestaurant = valueScored[1] || sorted[1];
      if (timeRestaurant && timeRestaurant.id !== closest?.id) {
        cards.push({
          id: 'time-of-day',
          icon: <Clock size={20} />,
          title: timeContext.label,
          subtitle: timeRestaurant.name,
          detail: `${timeRestaurant.rating}★ · ${timeRestaurant._distance?.toFixed(1)} km`,
          accent: 'blue',
          restaurant: timeRestaurant,
        });
      }
    }

    // ─── 4. Top Rated Nearby ───
    const nearbyTop = sorted
      .filter(r => !r._distance || r._distance <= 10)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
    if (nearbyTop && nearbyTop.id !== closest?.id) {
      cards.push({
        id: 'top-rated',
        icon: <Star size={20} />,
        title: 'Top Rated Nearby',
        subtitle: nearbyTop.name,
        detail: `${nearbyTop.rating}★ · ${nearbyTop._distance ? nearbyTop._distance.toFixed(1) + ' km' : ''}`,
        accent: 'gold',
        restaurant: nearbyTop,
      });
    }

    // ─── 5. Budget Friendly ───
    const budget = withDistance
      .filter(r => r.priceRange === '$' || r.price_range === '$')
      .sort((a, b) => (a._distance ?? 999) - (b._distance ?? 999))[0];
    if (budget) {
      cards.push({
        id: 'budget',
        icon: <DollarSign size={20} />,
        title: 'Budget Friendly',
        subtitle: budget.name,
        detail: `${budget.priceRange || budget.price_range} · ${budget._distance ? budget._distance.toFixed(1) + ' km' : ''}`,
        accent: 'green',
        restaurant: budget,
      });
    }

    // ─── 6. Best Value Score (composite) ───
    const bestScored = valueScored[0];
    if (bestScored && bestScored.id !== closest?.id && bestScored.id !== nearbyTop?.id && bestScored.id !== budget?.id) {
      cards.push({
        id: 'value-score',
        icon: <Trophy size={20} />,
        title: 'Best Overall Value',
        subtitle: bestScored.name,
        detail: `${bestScored.rating}★ · ${bestScored._valueScore?.toFixed(1)} value score`,
        accent: 'purple',
        restaurant: bestScored,
      });
    }

    // ─── 7. Trending / New Discovery ───
    const furthest = sorted[sorted.length - 1];
    if (furthest && furthest.id !== closest?.id && sorted.length > 2) {
      cards.push({
        id: 'explore',
        icon: <Compass size={20} />,
        title: 'Discover Something New',
        subtitle: furthest.name,
        detail: `${furthest.emirate || ''} · ${furthest._distance ? furthest._distance.toFixed(1) + ' km' : 'Explore'}`,
        accent: 'orange',
        restaurant: furthest,
      });
    }

    // ─── 8. Best Deal on Popular Dish ───
    const popularDishes = allDishes
      .filter(d => d.dishCategory === 'kitfo' || d.dishCategory === 'doro-wot' || d.dishCategory === 'tibs')
      .sort((a, b) => a.totals.withDelivery - b.totals.withDelivery);

    if (popularDishes.length > 0) {
      const bestPopular = popularDishes[0];
      // Check if this dish is already represented in existing cards
      const isDuplicate = cards.some(c => c.restaurant?.id === bestPopular.restaurant.id && c.restaurant?.name === bestPopular.restaurant.name);
      if (!isDuplicate) {
        const restaurant = restaurants.find(r => r.id === bestPopular.restaurant.id || r.id === String(bestPopular.restaurant.id));
        const dishLabel = bestPopular.dishCategory === 'kitfo' ? 'Kitfo' : bestPopular.dishCategory === 'doro-wot' ? 'Doro Wot' : bestPopular.name;
        cards.push({
          id: 'popular-deal',
          icon: <Flame size={20} />,
          title: `Best ${dishLabel} Deal`,
          subtitle: `${bestPopular.name} · ${bestPopular.restaurant.name}`,
          detail: `AED ${bestPopular.totals.withDelivery} total · ${bestPopular.restaurant.rating}★`,
          accent: 'red',
          restaurant: restaurant || withDistance.find(r => r.id === bestPopular.restaurant.id),
          dish: bestPopular.name,
        });
      }
    }

    // ─── 0. Gemini AI Smart Picks ───
    if (aiPicks.length > 0) {
      aiPicks.forEach((pick, i) => {
        const matchingRest = restaurants.find(r => 
          r.id === pick.restaurantId || r.slug === pick.restaurantId || r.name.toLowerCase().includes(pick.restaurantName?.toLowerCase() || '')
        );
        cards.unshift({
          id: `ai-pick-${i}`,
          icon: <Sparkles size={20} />,
          title: pick.title || pick.badge || 'AI Recommended',
          subtitle: `${pick.dishName ? `${pick.dishName} · ` : ''}${pick.restaurantName}`,
          detail: pick.reason || (pick.estimatedCost ? `AED ${pick.estimatedCost} total` : 'AI Pick'),
          accent: pick.accent || 'gold',
          restaurant: matchingRest || sorted[0],
          dish: pick.dishName,
          actionLabel: pick.badge || 'AI PICK',
        });
      });
    }

    // Limit to 8 cards max, ensure no duplicate restaurants beyond 1
    const deduplicated = [];
    const seenIds = new Set();
    for (const card of cards) {
      const rId = card.restaurant?.id || card.restaurant?.slug || card.id;
      if (!seenIds.has(rId) || card.id.startsWith('ai-pick-') || card.id === 'closest' || card.id === 'best-value') {
        if (seenIds.has(rId) && !card.id.startsWith('ai-pick-') && card.id !== 'closest' && card.id !== 'best-value') continue;
        deduplicated.push(card);
        seenIds.add(rId);
      }
      if (deduplicated.length >= 8) break;
    }

    return deduplicated;
  }, [restaurants, userLocation, dishesData, timeContext, aiPicks]);

  if (loading) {
    return (
      <section className="smart-suggestions" id="smart-suggestions">
        <div className="smart-suggestions-header">
          <h2 className="smart-suggestions-title">
            <span className="smart-suggestions-ai-badge">
              <Sparkles size={10} /> SMART
            </span>
            Picks for You
          </h2>
          <p className="smart-suggestions-subtitle">Analyzing dishes, prices & ratings...</p>
        </div>
        <div className="smart-suggestions-scroll">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="smart-card smart-card-skeleton" />
          ))}
        </div>
      </section>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <section className="smart-suggestions" id="smart-suggestions">
      <div className="smart-suggestions-header">
        <h2 className="smart-suggestions-title">
          <span className="smart-suggestions-ai-badge">
            <Sparkles size={10} /> SMART
          </span>
          Picks for You
        </h2>
        <p className="smart-suggestions-subtitle">
          {dishesData?.dishes?.length 
            ? `Analyzed ${dishesData.dishes.length} dishes across ${restaurants.length} restaurants`
            : `Smart picks based on location, prices & ratings`}
        </p>
      </div>
      <div className="smart-suggestions-scroll">
        {suggestions.map((card) => (
          <button
            key={card.id}
            className={`smart-card smart-card-${card.accent}`}
            onClick={() => {
              if (card.restaurant) {
                onSelectRestaurant(card.restaurant, card.dish);
                if (card.dish) onSelectDish(card.dish);
              }
            }}
          >
            <div className="smart-card-icon-wrapper">
              <div className={`smart-card-icon smart-card-icon-${card.accent}`}>
                {card.icon}
              </div>
            </div>
            <div className="smart-card-content">
              <div className="smart-card-label-row">
                <span className="smart-card-tag">{card.timeContext ? timeContext.icon + ' ' : ''}{card.actionLabel || card.title}</span>
              </div>
              <span className="smart-card-subtitle">{card.subtitle}</span>
              <span className="smart-card-detail">{card.detail}</span>
              {card.valueDetail && (
                <span className="smart-card-value-badge">{card.valueDetail}</span>
              )}
            </div>
            <div className="smart-card-arrow">
              <ChevronRight size={18} />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}