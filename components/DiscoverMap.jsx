'use client';

import { useEffect, useRef, useCallback } from 'react';
import { getRestaurantCoords, haversineDistance } from '@/lib/geo';

/**
 * Unique vibrant color palette for restaurant markers.
 * Each restaurant gets its own distinct color for identification.
 */
const MARKER_COLORS = [
  { bg: '#FF453A', glow: 'rgba(255, 69, 58, 0.4)', label: 'Crimson' },       // Vibrant Red
  { bg: '#30D158', glow: 'rgba(48, 209, 88, 0.4)', label: 'Emerald' },        // Bright Green
  { bg: '#FFD60A', glow: 'rgba(255, 214, 10, 0.4)', label: 'Gold' },           // Gold
  { bg: '#BF5AF2', glow: 'rgba(191, 90, 242, 0.4)', label: 'Purple' },         // Vivid Purple
  { bg: '#FF9F0A', glow: 'rgba(255, 159, 10, 0.4)', label: 'Orange' },         // Bright Orange
  { bg: '#64D2FF', glow: 'rgba(100, 210, 255, 0.4)', label: 'Cyan' },          // Sky Cyan
  { bg: '#FF375F', glow: 'rgba(255, 55, 95, 0.4)', label: 'Pink' },            // Hot Pink
  { bg: '#32ADE6', glow: 'rgba(50, 173, 230, 0.4)', label: 'Blue' },           // Ocean Blue
  { bg: '#AC8E68', glow: 'rgba(172, 142, 104, 0.4)', label: 'Bronze' },        // Warm Bronze
  { bg: '#63E6BE', glow: 'rgba(99, 230, 190, 0.4)', label: 'Mint' },           // Mint
];

/**
 * Cuisine-specific emoji icons for markers.
 */
function getMarkerEmoji(restaurant) {
  const cuisines = (restaurant.cuisines || restaurant.cuisine || []).map(c => c.toLowerCase());
  if (cuisines.some(c => c.includes('eritrean'))) return '🇪🇷';
  if (cuisines.some(c => c.includes('ethiopian'))) return '🇪🇹';
  if (cuisines.some(c => c.includes('fusion'))) return '🌍';
  return '🍲';
}

/**
 * DiscoverMap — Interactive MapLibre GL JS map for the Discover page.
 * Features: colorful unique restaurant markers, user location pulsing dot,
 * animated route path to selected restaurant, glassmorphic popup cards.
 */
export default function DiscoverMap({
  restaurants = [],
  userLocation = null,
  selectedRestaurant = null,
  selectedDishInfo = null,
  onSelectRestaurant = () => {},
  distances = {},
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const maplibreRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const popupRef = useRef(null);
  const mapReady = useRef(false);

  // Initialize map
  useEffect(() => {
    async function initMap() {
      const maplibregl = (await import('maplibre-gl')).default;
      await import('maplibre-gl/dist/maplibre-gl.css');
      maplibreRef.current = maplibregl;

      if (!mapContainerRef.current || mapRef.current) return;

      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: 'https://tiles.openfreemap.org/styles/dark',
        center: [55.27, 25.20],
        zoom: 11,
        attributionControl: false,
        antialias: true,
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');

      map.on('load', () => {
        // Route line — glowing animated path
        map.addSource('route-line', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        });

        // Outer glow layer
        map.addLayer({
          id: 'route-line-glow',
          type: 'line',
          source: 'route-line',
          paint: {
            'line-color': '#34c759',
            'line-width': 8,
            'line-opacity': 0.15,
            'line-blur': 6,
          },
        });

        // Main route line
        map.addLayer({
          id: 'route-line-main',
          type: 'line',
          source: 'route-line',
          paint: {
            'line-color': '#34c759',
            'line-width': 3,
            'line-opacity': 0.9,
          },
        });

        // Animated dashed overlay
        map.addLayer({
          id: 'route-line-dash',
          type: 'line',
          source: 'route-line',
          paint: {
            'line-color': '#ffffff',
            'line-width': 1.5,
            'line-dasharray': [2, 4],
            'line-opacity': 0.6,
          },
        });

        // Distance label source + layer
        map.addSource('route-label', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        });

        map.addLayer({
          id: 'route-label-layer',
          type: 'symbol',
          source: 'route-label',
          layout: {
            'text-field': ['get', 'label'],
            'text-size': 13,
            'text-font': ['Open Sans Bold'],
            'text-offset': [0, -1.5],
            'text-allow-overlap': true,
          },
          paint: {
            'text-color': '#ffffff',
            'text-halo-color': 'rgba(0,0,0,0.7)',
            'text-halo-width': 2,
          },
        });

        mapReady.current = true;
      });

      mapRef.current = map;
    }

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        mapReady.current = false;
      }
    };
  }, []);

  // Create popup HTML (supports custom dish price chip)
  const createPopupHTML = useCallback((restaurant, dist, colorIdx, dishInfo = null) => {
    const rating = restaurant.rating || 0;
    const priceRange = restaurant.priceRange || restaurant.price_range || '$$';
    const emirate = restaurant.emirate || '';
    const area = restaurant.area || '';
    const distText = dist ? `${dist.toFixed(1)} km away` : '';
    const color = MARKER_COLORS[colorIdx % MARKER_COLORS.length];
    const emoji = getMarkerEmoji(restaurant);

    const dishName = dishInfo?.dishName || restaurant.dishName || '';
    const dishPrice = dishInfo?.price || restaurant.dishPrice || null;

    return `
      <div class="map-popup-card ${dishName ? 'map-popup-chip-card' : ''}">
        <div class="map-popup-color-bar" style="background:${dishName ? 'var(--color-habesha-gold, #fcd900)' : color.bg}"></div>
        <div class="map-popup-body">
          <div class="map-popup-header">
            <div class="map-popup-name-row">
              <span class="map-popup-emoji">${emoji}</span>
              <h4 class="map-popup-name">${restaurant.name}</h4>
            </div>
            ${rating > 0 ? `<span class="map-popup-rating">⭐ ${rating}</span>` : ''}
          </div>
          ${dishName ? `
            <div class="map-popup-dish-chip">
              <span class="map-popup-dish-name">🍲 ${dishName}</span>
              ${dishPrice ? `<span class="map-popup-dish-price">AED ${dishPrice}</span>` : ''}
            </div>
          ` : ''}
          <p class="map-popup-location">${emirate}${area ? ' · ' + area : ''}</p>
          ${distText ? `<p class="map-popup-distance">📍 ${distText}</p>` : ''}
          <div class="map-popup-footer">
            <span class="map-popup-price">${priceRange}</span>
            <button class="map-popup-btn" data-slug="${restaurant.slug || restaurant.id}" data-dish="${dishName}">View Menu →</button>
          </div>
        </div>
      </div>
    `;
  }, []);

  // Add/update restaurant markers
  useEffect(() => {
    if (!mapRef.current || !maplibreRef.current) return;

    const addMarkers = () => {
      const maplibregl = maplibreRef.current;

      // Clear existing markers
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }

      const bounds = new maplibregl.LngLatBounds();
      let hasPoints = false;

      restaurants.forEach((r, idx) => {
        const coords = getRestaurantCoords(r);
        if (!coords) return;

        const isSelected = selectedRestaurant?.id === r.id || selectedRestaurant?.slug === r.slug;
        const color = MARKER_COLORS[idx % MARKER_COLORS.length];
        const rating = r.rating || 0;
        const emoji = getMarkerEmoji(r);
        const initial = r.name.charAt(0).toUpperCase();

        // Create vibrant custom marker
        const el = document.createElement('div');
        el.className = `map-marker ${isSelected ? 'map-marker-selected' : ''}`;
        el.style.cssText = `--marker-color: ${color.bg}; --marker-glow: ${color.glow};`;
        el.innerHTML = `
          <div class="map-marker-pin">
            <div class="map-marker-pin-head" style="background:${color.bg}; box-shadow: 0 0 12px ${color.glow}, 0 4px 8px rgba(0,0,0,0.4);">
              <span class="map-marker-emoji">${emoji}</span>
            </div>
            <div class="map-marker-pin-tail" style="border-top-color:${color.bg};"></div>
          </div>
          <div class="map-marker-label-tag" style="background:${color.bg};">
            ${r.name.length > 12 ? r.name.substring(0, 12) + '…' : r.name}
          </div>
          ${rating >= 4.8 ? '<div class="map-marker-star">⭐</div>' : ''}
          ${isSelected ? '<div class="map-marker-ring"></div>' : ''}
        `;

        const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([coords.lng, coords.lat])
          .addTo(mapRef.current);

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          onSelectRestaurant(r);

          // Show popup
          if (popupRef.current) popupRef.current.remove();
          const dist = distances[r.id] || distances[r.slug];
          const popup = new maplibregl.Popup({
            offset: [0, -55],
            closeButton: true,
            closeOnClick: true,
            className: 'map-popup-wrapper',
            maxWidth: '320px',
          })
            .setLngLat([coords.lng, coords.lat])
            .setHTML(createPopupHTML(r, dist, idx))
            .addTo(mapRef.current);

          popupRef.current = popup;

          // Handle view menu button
          setTimeout(() => {
            const btn = popup.getElement()?.querySelector('.map-popup-btn');
            if (btn) {
              btn.addEventListener('click', () => {
                window.location.href = `/restaurant/${r.slug || r.id}`;
              });
            }
          }, 50);
        });

        markersRef.current.push(marker);
        bounds.extend([coords.lng, coords.lat]);
        hasPoints = true;
      });

      // Add user location to bounds
      if (userLocation) {
        bounds.extend([userLocation.lng, userLocation.lat]);
        hasPoints = true;
      }

      // Fit bounds to show all markers
      if (hasPoints && restaurants.length > 0) {
        try {
          mapRef.current.fitBounds(bounds, {
            padding: { top: 70, bottom: 70, left: 70, right: 70 },
            maxZoom: 14,
            duration: 1000,
          });
        } catch { /* bounds might be zero-area */ }
      }
    };

    // Wait for map to be ready
    const timer = setTimeout(addMarkers, 500);
    return () => clearTimeout(timer);
  }, [restaurants, selectedRestaurant, distances, userLocation, onSelectRestaurant, createPopupHTML]);

  // Open custom popup chip when selectedRestaurant or selectedDishInfo updates
  useEffect(() => {
    if (!mapRef.current || !maplibreRef.current || !selectedRestaurant) return;

    const coords = getRestaurantCoords(selectedRestaurant);
    if (!coords) return;

    const idx = restaurants.findIndex(r => r.id === selectedRestaurant.id || r.slug === selectedRestaurant.slug);
    const colorIdx = idx >= 0 ? idx : 0;
    const dist = distances[selectedRestaurant.id] || distances[selectedRestaurant.slug] || (userLocation ? haversineDistance(userLocation.lat, userLocation.lng, coords.lat, coords.lng) : null);

    if (popupRef.current) popupRef.current.remove();

    const popup = new maplibreRef.current.Popup({
      offset: [0, -55],
      closeButton: true,
      closeOnClick: false,
      className: 'map-popup-wrapper map-chip-popup',
      maxWidth: '320px',
    })
      .setLngLat([coords.lng, coords.lat])
      .setHTML(createPopupHTML(selectedRestaurant, dist, colorIdx, selectedDishInfo))
      .addTo(mapRef.current);

    popupRef.current = popup;

    setTimeout(() => {
      const btn = popup.getElement()?.querySelector('.map-popup-btn');
      if (btn) {
        btn.addEventListener('click', () => {
          const slug = selectedRestaurant.slug || selectedRestaurant.id;
          const dName = selectedDishInfo?.dishName || '';
          const url = dName ? `/restaurant/${slug}?dish=${encodeURIComponent(dName)}` : `/restaurant/${slug}`;
          window.location.href = url;
        });
      }
    }, 50);

  }, [selectedRestaurant, selectedDishInfo, restaurants, distances, userLocation, createPopupHTML]);

  // Add/update user location marker
  useEffect(() => {
    if (!mapRef.current || !maplibreRef.current || !userLocation) return;

    const addUserMarker = () => {
      const maplibregl = maplibreRef.current;

      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }

      const el = document.createElement('div');
      el.className = 'map-user-marker';
      el.innerHTML = `
        <div class="map-user-pulse"></div>
        <div class="map-user-pulse map-user-pulse-2"></div>
        <div class="map-user-dot"></div>
        <div class="map-user-label">You</div>
      `;

      userMarkerRef.current = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(mapRef.current);
    };

    const timer = setTimeout(addUserMarker, 600);
    return () => clearTimeout(timer);
  }, [userLocation]);

  // Draw animated route path from user to selected restaurant
  useEffect(() => {
    if (!mapRef.current || !mapReady.current || !maplibreRef.current) return;

    const routeSource = mapRef.current.getSource('route-line');
    const labelSource = mapRef.current.getSource('route-label');
    if (!routeSource) return;

    if (!selectedRestaurant || !userLocation) {
      routeSource.setData({ type: 'FeatureCollection', features: [] });
      if (labelSource) labelSource.setData({ type: 'FeatureCollection', features: [] });
      return;
    }

    const coords = getRestaurantCoords(selectedRestaurant);
    if (!coords) {
      routeSource.setData({ type: 'FeatureCollection', features: [] });
      if (labelSource) labelSource.setData({ type: 'FeatureCollection', features: [] });
      return;
    }

    // Generate a curved path (bezier-ish) between user and restaurant
    const startLng = userLocation.lng;
    const startLat = userLocation.lat;
    const endLng = coords.lng;
    const endLat = coords.lat;

    // Create a series of intermediate points for a gentle curve
    const numPoints = 40;
    const pathCoords = [];
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      // Add a slight arc perpendicular to the line
      const midOffset = Math.sin(t * Math.PI) * 0.003; // Curve intensity
      const lat = startLat + (endLat - startLat) * t + midOffset * (endLng - startLng > 0 ? 1 : -1);
      const lng = startLng + (endLng - startLng) * t - midOffset * (endLat - startLat > 0 ? -1 : 1);
      pathCoords.push([lng, lat]);
    }

    routeSource.setData({
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: pathCoords,
        },
      }],
    });

    // Distance label at midpoint
    const dist = haversineDistance(startLat, startLng, endLat, endLng);
    const midIdx = Math.floor(numPoints / 2);
    const midCoord = pathCoords[midIdx];
    if (labelSource) {
      labelSource.setData({
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: { type: 'Point', coordinates: midCoord },
          properties: { label: `${dist.toFixed(1)} km` },
        }],
      });
    }

    // Animate dash offset for flow effect
    let dashOffset = 0;
    const animateDash = () => {
      if (!mapRef.current) return;
      dashOffset = (dashOffset + 0.2) % 6;
      try {
        mapRef.current.setPaintProperty('route-line-dash', 'line-dasharray', [2, 4]);
      } catch { /* ignore */ }
    };
    const dashInterval = setInterval(animateDash, 100);

    // Pan to show both user and restaurant
    try {
      const maplibregl = maplibreRef.current;
      const bounds = new maplibregl.LngLatBounds();
      bounds.extend([startLng, startLat]);
      bounds.extend([endLng, endLat]);
      mapRef.current.fitBounds(bounds, {
        padding: { top: 90, bottom: 90, left: 90, right: 90 },
        maxZoom: 14,
        duration: 800,
      });
    } catch { /* ignore */ }

    return () => clearInterval(dashInterval);
  }, [selectedRestaurant, userLocation]);

  return (
    <div className="discover-map-wrapper" id="discover-map">
      <div ref={mapContainerRef} className="discover-map-canvas" />

      {/* Legend */}
      {restaurants.length > 0 && (
        <div className="map-legend">
          <div className="map-legend-title">Restaurants</div>
          {restaurants.slice(0, 8).map((r, idx) => {
            const color = MARKER_COLORS[idx % MARKER_COLORS.length];
            const coords = getRestaurantCoords(r);
            if (!coords) return null;
            const isSelected = selectedRestaurant?.id === r.id || selectedRestaurant?.slug === r.slug;
            return (
              <button
                key={r.id || r.slug}
                className={`map-legend-item ${isSelected ? 'map-legend-item-active' : ''}`}
                onClick={() => onSelectRestaurant(r)}
              >
                <span className="map-legend-dot" style={{ background: color.bg, boxShadow: `0 0 6px ${color.glow}` }} />
                <span className="map-legend-name">{r.name.length > 18 ? r.name.substring(0, 18) + '…' : r.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {!userLocation && (
        <div className="map-location-prompt">
          <span className="map-location-prompt-icon">📍</span>
          <span>Enable location for distance info</span>
        </div>
      )}
    </div>
  );
}
