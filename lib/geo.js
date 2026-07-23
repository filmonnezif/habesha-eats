/**
 * Habesha Eats — Geolocation & Travel Utilities
 * Haversine distance, travel time/cost estimates, reverse geocoding.
 * All calculations are client-side — no paid APIs required.
 */

/**
 * Calculate the great-circle distance between two points using the Haversine formula.
 * @returns Distance in kilometers
 */
export function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Estimate travel time in minutes based on distance and mode.
 * Uses UAE urban averages.
 */
export function estimateTravelTime(distanceKm, mode) {
  const speeds = {
    drive: 2.5,   // min per km (urban Dubai avg ~24 km/h with traffic)
    taxi: 2.5,    // same as drive
    bus: 4.5,     // min per km (slower with stops)
    walk: 12,     // min per km
  };
  const base = Math.ceil(distanceKm * (speeds[mode] || speeds.drive));
  // Add fixed overhead for waiting/boarding
  const overhead = { drive: 0, taxi: 3, bus: 8, walk: 0 };
  return base + (overhead[mode] || 0);
}

/**
 * Estimate travel cost in AED based on distance and mode.
 */
export function estimateTravelCost(distanceKm, mode) {
  switch (mode) {
    case 'taxi':
      return Math.round(5 + distanceKm * 2.2); // AED 5 base + 2.2/km
    case 'bus':
      return distanceKm > 15 ? 10 : 4; // Inter-emirate vs local
    case 'drive':
      // Fuel + tolls estimate
      return Math.round(2 + distanceKm * 0.8);
    default:
      return 0;
  }
}

/**
 * Distance-based delivery fee in AED.
 * Dynamic tiered pricing with cross-emirate penalty — mirrors UAE food delivery platforms.
 * @param {number} distanceKm - Distance from restaurant to delivery location
 * @param {boolean} crossEmirate - Optional explicit cross-emirate indicator
 * @returns {number} Delivery fee in AED
 */
export function estimateDeliveryFee(distanceKm, crossEmirate = false) {
  if (!distanceKm || distanceKm < 0) return 10; // default fallback
  if (distanceKm <= 3) return 5;
  if (distanceKm <= 8) return Math.round(5 + (distanceKm - 3) * 1.5);
  if (distanceKm <= 20) return Math.round(13 + (distanceKm - 8) * 2);
  if (distanceKm <= 40) return Math.round(37 + (distanceKm - 20) * 2.5);
  // Heavy cross-emirate penalty (e.g. Dubai → Abu Dhabi at 45+ km)
  const baseFee = Math.round(87 + (distanceKm - 40) * 3);
  return crossEmirate ? baseFee + 20 : baseFee;
}

/**
 * Reverse geocode a lat/lng to an area name using OpenStreetMap Nominatim.
 * Free, no API key required. Rate-limited to 1 req/sec.
 */
export async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const addr = data.address || {};
    // Try to get the most useful area name
    return addr.suburb || addr.neighbourhood || addr.city_district || addr.city || addr.town || addr.county || 'Unknown Area';
  } catch {
    return null;
  }
}

/**
 * Get all travel modes with time/cost for a restaurant relative to user location.
 */
export function getTravelModes(restaurant, userLat, userLng) {
  // Get restaurant coordinates from branches or direct coords
  let lat, lng;
  if (restaurant.branches && restaurant.branches.length > 0) {
    const branch = restaurant.branches.find(b => b.latitude && b.longitude) || restaurant.branches[0];
    lat = branch.latitude;
    lng = branch.longitude;
  }
  if (!lat || !lng) {
    // Fallback to hardcoded coordinates
    lat = restaurant.coordinates?.lat;
    lng = restaurant.coordinates?.lng;
  }

  if (!lat || !lng || !userLat || !userLng) {
    return { distance: null, modes: [] };
  }

  const distance = haversineDistance(userLat, userLng, lat, lng);
  const computedDeliveryFee = estimateDeliveryFee(distance);

  const modes = [
    {
      key: 'drive',
      icon: '🚗',
      label: 'Drive',
      time: estimateTravelTime(distance, 'drive'),
      cost: estimateTravelCost(distance, 'drive'),
    },
    {
      key: 'taxi',
      icon: '🚕',
      label: 'Taxi',
      time: estimateTravelTime(distance, 'taxi'),
      cost: estimateTravelCost(distance, 'taxi'),
    },
    {
      key: 'bus',
      icon: '🚌',
      label: 'Bus',
      time: estimateTravelTime(distance, 'bus'),
      cost: estimateTravelCost(distance, 'bus'),
    },
    {
      key: 'delivery',
      icon: '🛵',
      label: 'Delivery',
      time: estimateTravelTime(distance, 'drive') + 15,
      cost: computedDeliveryFee,
      timeLabel: `${estimateTravelTime(distance, 'drive') + 15} min`,
    },
  ];

  return { distance, lat, lng, modes };
}

/**
 * Get user location via the browser Geolocation API.
 * Returns a Promise that resolves with { lat, lng } or rejects with an error.
 */
export function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  });
}

/**
 * Get restaurant coordinates (from branches or direct fields).
 * Falls back to placeholder coords based on emirate if nothing else available.
 */
export function getRestaurantCoords(restaurant) {
  // 1. Try branch coordinates from DB
  if (restaurant.branches && restaurant.branches.length > 0) {
    const branch = restaurant.branches.find(b => b.latitude && b.longitude);
    if (branch) return { lat: parseFloat(branch.latitude), lng: parseFloat(branch.longitude) };
  }
  // 2. Try direct coordinates (from hardcoded merge)
  if (restaurant.coordinates) {
    return { lat: restaurant.coordinates.lat, lng: restaurant.coordinates.lng };
  }
  // 3. Fallback: generate placeholder coordinates based on emirate
  return generatePlaceholderCoords(restaurant);
}

/**
 * Generate placeholder coordinates for restaurants that don't have real coords.
 * Uses emirate center points with a small deterministic offset based on restaurant name
 * so each restaurant gets a unique position and markers don't stack.
 */
export function generatePlaceholderCoords(restaurant) {
  // Emirate center coordinates (real city centers in UAE)
  const emirateCenters = {
    'dubai':           { lat: 25.2048, lng: 55.2708 },
    'abu dhabi':       { lat: 24.4539, lng: 54.3773 },
    'sharjah':         { lat: 25.3463, lng: 55.4209 },
    'ajman':           { lat: 25.4052, lng: 55.5136 },
    'ras al khaimah':  { lat: 25.7895, lng: 55.9432 },
    'fujairah':        { lat: 25.1288, lng: 56.3265 },
    'umm al quwain':   { lat: 25.5647, lng: 55.5552 },
  };

  // Find the emirate — check branches, direct field, or area name
  let emirateName = '';
  if (restaurant.branches && restaurant.branches.length > 0) {
    emirateName = restaurant.branches[0].emirate || '';
  }
  if (!emirateName) {
    emirateName = restaurant.emirate || '';
  }

  const key = emirateName.toLowerCase().trim();
  const center = emirateCenters[key] || emirateCenters['dubai']; // Default to Dubai

  // Create a deterministic offset from the restaurant name so each one is unique
  const nameHash = hashString(restaurant.name || restaurant.id || 'default');
  const offsetLat = ((nameHash % 200) - 100) * 0.0003; // ~±30m spread
  const offsetLng = (((nameHash >> 8) % 200) - 100) * 0.0003;

  return {
    lat: center.lat + offsetLat,
    lng: center.lng + offsetLng,
  };
}

/**
 * Simple deterministic hash from a string (for stable placeholder offsets).
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

