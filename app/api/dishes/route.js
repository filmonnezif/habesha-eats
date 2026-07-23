/**
 * GET /api/dishes?q=shiro&sort=total&lat=25.2&lng=55.3
 * Cross-restaurant dish lookup with pricing, distance-based delivery fees, and pickup costs.
 * Powers PriceCompare with real database data. Includes DB cold-start fallbacks.
 */
import sql from '@/lib/db';
import { NextResponse } from 'next/server';
import { restaurants as hardcodedRestaurants } from '@/lib/data';
import { getRestaurantCoords } from '@/lib/geo';

// Dish category name pattern matching — maps dish_category keys to search patterns
const CATEGORY_PATTERNS = {
  'shiro': ['shiro', 'shuro', 'shro', 'shero', 'bozena', 'tegabino', 'besiga', 'chickpea stew', 'chickpea flour', 'ሽሮ', 'ቦዘና'],
  'doro-wot': ['doro', 'doro wot', 'doro wat', 'chicken stew', 'ዶሮ'],
  'kitfo': ['kitfo', 'ketfo', 'steak tartare', 'minced beef', 'ክትፎ'],
  'tibs': ['tibs', 'tebs', 'sautéed beef', 'sauteed beef', 'lamb tibs', 'beef tibs', 'ጥብስ'],
  'beyaynetu': ['beyaynetu', 'beyaynet', 'vegetarian platter', 'vegan platter', 'combination platter', 'በያይነቱ'],
  'coffee': ['coffee', 'coffee ceremony', 'cappuccino', 'macchiato', 'buna', 'ቡና'],
  'injera': ['injera', 'kategna', 'flatbread', 'kitcha', 'ambasha', 'እንጀራ'],
  'dessert': ['dessert', 'baklava', 'sweet', 'cake'],
};

// Known restaurant location fallbacks (Dubai, Abu Dhabi, Sharjah, Ajman)
const RESTAURANT_COORDS_FALLBACK = {
  'al-habasha': { lat: 25.2467, lng: 55.3047 },
  'zagol': { lat: 25.2481, lng: 55.3009 },
  'kazoza': { lat: 24.4870, lng: 54.3570 },
  'milano': { lat: 25.3063, lng: 55.3712 },
  'abyssinia': { lat: 25.2697, lng: 55.3095 },
  'queen-sheba': { lat: 25.4052, lng: 55.4445 },
  'abu-aymen': { lat: 25.2650, lng: 55.3000 },
  'addis-ababa': { lat: 25.2520, lng: 55.3020 },
  'aflatoon': { lat: 25.3100, lng: 55.3800 },
};

function matchDishCategory(itemName, categoryQuery) {
  const q = categoryQuery.toLowerCase().trim();
  for (const [key, patterns] of Object.entries(CATEGORY_PATTERNS)) {
    if (key === q || patterns.some(p => p.includes(q) || q.includes(p))) {
      const name = itemName.toLowerCase();
      if (patterns.some(p => name.includes(p))) return true;
    }
  }
  return false;
}

function detectDishCategory(name) {
  const n = name.toLowerCase();
  if (n.includes('shiro') || n.includes('shuro') || n.includes('shro') || n.includes('shero') || n.includes('bozena') || n.includes('tegabino') || n.includes('ሽሮ')) return 'shiro';
  if (n.includes('kitfo') || n.includes('ketfo') || n.includes('ክትፎ')) return 'kitfo';
  if (n.includes('tibs') || n.includes('tebs') || n.includes('ጥብስ') || (n.includes('sauté') && n.includes('beef'))) return 'tibs';
  if (n.includes('doro') || n.includes('ዶሮ') || (n.includes('chicken') && (n.includes('stew') || n.includes('wot')))) return 'doro-wot';
  if (n.includes('beyaynetu') || n.includes('beyaynet') || n.includes('በያይነቱ') || (n.includes('vegetarian') && n.includes('platter'))) return 'beyaynetu';
  if (n.includes('coffee') || n.includes('cappuccino') || n.includes('macchiato') || n.includes('ቡና')) return 'coffee';
  if (n.includes('injera') || n.includes('kategna') || n.includes('kitcha') || n.includes('ambasha') || n.includes('እንጀራ')) return 'injera';
  if (n.includes('dessert') || n.includes('baklava') || n.includes('cake') || n.includes('sweet')) return 'dessert';
  return null;
}

// Haversine distance in km
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Distance-based dynamic delivery fee
function estimateDeliveryFee(distanceKm) {
  if (!distanceKm || distanceKm < 0) return 10;
  if (distanceKm <= 3) return 5;
  if (distanceKm <= 8) return Math.round(5 + (distanceKm - 3) * 1.5);
  if (distanceKm <= 20) return Math.round(13 + (distanceKm - 8) * 2);
  if (distanceKm <= 40) return Math.round(37 + (distanceKm - 20) * 2.5);
  return Math.round(87 + (distanceKm - 40) * 3.5);
}

// Pickup / Dine-in travel cost (fuel & tolls)
function estimatePickupCost(distanceKm) {
  if (!distanceKm || distanceKm <= 0) return 0;
  return Math.round(2 + distanceKm * 0.8);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const category = searchParams.get('category');
  const userLat = parseFloat(searchParams.get('lat'));
  const userLng = parseFloat(searchParams.get('lng'));
  const sort = searchParams.get('sort') || 'total';
  const restaurantId = searchParams.get('restaurantId');

  const hasUserCoords = !isNaN(userLat) && !isNaN(userLng);

  try {
    // Fetch items and branches concurrently
    const [items, branches] = await Promise.all([
      sql`
        SELECT 
          mi.id, mi.name, mi.description, mi.price, mi.image_url, mi.tags, mi.is_available,
          mc.name as category_name, mc.id as category_id,
          r.id as restaurant_id, r.name as restaurant_name, r.slug as restaurant_slug,
          r.description as restaurant_description, r.rating, r.review_count,
          r.price_range, r.tagline, r.hero_image_url,
          rt.name as type_name
        FROM menu_items mi
        JOIN menu_categories mc ON mi.category_id = mc.id AND mc.is_active = true
        JOIN restaurants r ON mc.restaurant_id = r.id AND r.deleted_at IS NULL
        LEFT JOIN restaurant_types rt ON r.restaurant_type_id = rt.id
        WHERE mi.is_available = true
        ORDER BY mi.name
      `,
      sql`
        SELECT 
          b.restaurant_id, b.name, b.area, b.latitude, b.longitude,
          e.name as emirate_name
        FROM branches b
        JOIN emirates e ON b.emirate_id = e.id
        WHERE b.deleted_at IS NULL AND b.accepts_delivery = true
      `,
    ]);

    // Assemble results
    let results = items.map(item => {
      const rBranches = branches.filter(b => b.restaurant_id === item.restaurant_id);
      const primaryBranch = rBranches[0] || null;

      let rLat = primaryBranch?.latitude ? parseFloat(primaryBranch.latitude) : null;
      let rLng = primaryBranch?.longitude ? parseFloat(primaryBranch.longitude) : null;

      if (!rLat || !rLng) {
        const hc = hardcodedRestaurants.find(hr => hr.id === item.restaurant_slug || hr.slug === item.restaurant_slug);
        const resolved = getRestaurantCoords({
          name: item.restaurant_name,
          id: item.restaurant_id,
          slug: item.restaurant_slug,
          emirate: primaryBranch?.emirate_name || 'Dubai',
          coordinates: hc?.coordinates,
        });
        rLat = resolved.lat;
        rLng = resolved.lng;
      }

      let distance = null;
      if (hasUserCoords && rLat && rLng) {
        distance = haversineDistance(userLat, userLng, rLat, rLng);
      }

      const itemPrice = Math.round(parseFloat(item.price));
      const deliveryFee = estimateDeliveryFee(distance);
      const pickupCost = estimatePickupCost(distance);
      const serviceFee = Math.round(itemPrice * 0.05);

      const totalDelivery = Math.round(itemPrice + deliveryFee + serviceFee);
      const totalPickup = Math.round(itemPrice + pickupCost + serviceFee);

      return {
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: itemPrice,
        imageUrl: item.image_url || '/images/dish_injera.webp',
        tags: item.tags || [],
        isAvailable: item.is_available,
        categoryName: item.category_name,
        dishCategory: detectDishCategory(item.name),
        restaurant: {
          id: item.restaurant_id,
          name: item.restaurant_name,
          slug: item.restaurant_slug,
          description: item.restaurant_description || item.tagline || '',
          rating: parseFloat(item.rating) || 4.5,
          reviewCount: item.review_count || 0,
          priceRange: item.price_range || '$$',
          type: item.type_name || 'Restaurant',
          heroImage: item.hero_image_url || '/images/dish_injera.webp',
          emirate: primaryBranch?.emirate_name || 'Dubai',
          area: primaryBranch?.area || '',
          coordinates: { lat: rLat, lng: rLng },
        },
        distance,
        delivery: {
          fee: deliveryFee,
          timeMinutes: distance ? Math.round(distance * 2.5 + 15) : 30,
        },
        pickup: {
          cost: pickupCost,
          timeMinutes: distance ? Math.round(distance * 2.5) : 15,
        },
        totals: {
          withDelivery: totalDelivery,
          withPickup: totalPickup,
        },
      };
    });

    // Filter by search query (Tokenized fuzzy match)
    if (q && q.trim()) {
      const query = q.trim().toLowerCase();
      const tokens = query.split(/\s+/).filter(Boolean);

      results = results.filter(item => {
        const name = item.name.toLowerCase();
        const dishCat = item.dishCategory || '';

        const isNameMatch = tokens.some(token => name.includes(token));
        const isCategoryMatch = dishCat && tokens.some(token => dishCat.includes(token) || token.includes(dishCat));
        const isPatternMatch = tokens.some(token => matchDishCategory(item.name, token));

        return isNameMatch || isCategoryMatch || isPatternMatch;
      });
    }

    if (category && !q) {
      results = results.filter(item => 
        item.dishCategory === category || matchDishCategory(item.name, category)
      );
    }

    if (restaurantId) {
      results = results.filter(item => item.restaurant.id === parseInt(restaurantId) || item.restaurant.id === restaurantId);
    }

    // Deduplicate
    const seen = new Set();
    results = results.filter(item => {
      const key = `${item.restaurant.id}-${item.name}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort
    switch (sort) {
      case 'price':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'rating':
        results.sort((a, b) => b.restaurant.rating - a.restaurant.rating);
        break;
      case 'total':
      default:
        results.sort((a, b) => {
          const distA = a.distance ?? 0;
          const distB = b.distance ?? 0;
          const penaltyA = distA > 35 ? 100 : 0;
          const penaltyB = distB > 35 ? 100 : 0;
          return (a.totals.withDelivery + penaltyA) - (b.totals.withDelivery + penaltyB);
        });
        break;
    }

    const stats = results.length > 0 ? buildStats(results) : null;

    return NextResponse.json({
      dishes: results,
      stats,
      query: q || category || 'all',
      count: results.length,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Database connection error in /api/dishes, using hardcoded fallback:', error.message);
    const fallbackData = generateFallbackDishes(q, category, userLat, userLng, restaurantId, sort);
    return NextResponse.json(fallbackData, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  }
}

function buildStats(results) {
  return {
    count: results.length,
    minPrice: Math.round(Math.min(...results.map(r => r.price))),
    maxPrice: Math.round(Math.max(...results.map(r => r.price))),
    avgPrice: Math.round(results.reduce((s, r) => s + r.price, 0) / results.length),
    minTotal: Math.round(Math.min(...results.map(r => r.totals.withDelivery))),
    maxTotal: Math.round(Math.max(...results.map(r => r.totals.withDelivery))),
    avgTotal: Math.round(results.reduce((s, r) => s + r.totals.withDelivery, 0) / results.length),
    minPickup: Math.round(Math.min(...results.map(r => r.totals.withPickup))),
    maxPickup: Math.round(Math.max(...results.map(r => r.totals.withPickup))),
    avgPickup: Math.round(results.reduce((s, r) => s + r.totals.withPickup, 0) / results.length),
  };
}

function generateFallbackDishes(q, category, userLat, userLng, restaurantId, sort) {
  const hasUserCoords = !isNaN(userLat) && !isNaN(userLng);
  let allItems = [];

  hardcodedRestaurants.forEach(r => {
    (r.menu || []).forEach(cat => {
      (cat.items || []).forEach(item => {
        let distance = null;
        if (hasUserCoords && r.coordinates) {
          distance = haversineDistance(userLat, userLng, r.coordinates.lat, r.coordinates.lng);
        }
        const itemPrice = Math.round(item.price);
        const deliveryFee = estimateDeliveryFee(distance);
        const pickupCost = estimatePickupCost(distance);
        const serviceFee = Math.round(itemPrice * 0.05);

        allItems.push({
          id: item.id,
          name: item.name,
          description: item.description || '',
          price: itemPrice,
          imageUrl: item.image || '/images/dish_injera.webp',
          tags: item.tags || [],
          isAvailable: item.available !== false,
          categoryName: cat.name,
          dishCategory: item.dishCategory || detectDishCategory(item.name),
          restaurant: {
            id: r.id,
            name: r.name,
            slug: r.slug,
            description: r.description,
            rating: r.rating,
            reviewCount: r.reviewCount,
            priceRange: r.priceRange,
            type: 'Ethiopian',
            heroImage: r.heroImage,
            emirate: r.emirate,
            area: r.area,
            coordinates: r.coordinates,
          },
          distance,
          delivery: { fee: deliveryFee, timeMinutes: distance ? Math.round(distance * 2.5 + 15) : 30 },
          pickup: { cost: pickupCost, timeMinutes: distance ? Math.round(distance * 2.5) : 15 },
          totals: {
            withDelivery: Math.round(itemPrice + deliveryFee + serviceFee),
            withPickup: Math.round(itemPrice + pickupCost + serviceFee),
          },
        });
      });
    });
  });

  if (q && q.trim()) {
    const query = q.trim().toLowerCase();
    const tokens = query.split(/\s+/).filter(Boolean);
    allItems = allItems.filter(item => {
      const name = item.name.toLowerCase();
      const dishCat = item.dishCategory || '';
      return tokens.some(t => name.includes(t) || dishCat.includes(t) || matchDishCategory(item.name, t));
    });
  }

  if (category && !q) {
    allItems = allItems.filter(item => item.dishCategory === category || matchDishCategory(item.name, category));
  }

  if (restaurantId) {
    allItems = allItems.filter(item => item.restaurant.id === restaurantId);
  }

  allItems.sort((a, b) => a.totals.withDelivery - b.totals.withDelivery);

  return {
    dishes: allItems,
    stats: allItems.length > 0 ? buildStats(allItems) : null,
    query: q || category || 'all',
    count: allItems.length,
  };
}