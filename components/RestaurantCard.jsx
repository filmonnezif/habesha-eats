'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';

/**
 * Premium glassmorphic restaurant card for the Discover grid.
 * Features: hover transition, stagger-in animation, hover CTA reveal,
 * 2-tier tag system, and delivery info overlay.
 */
export default function RestaurantCard({ restaurant, index = 0 }) {
  const { translateRestaurant, t } = useLanguage();
  const tr = translateRestaurant(restaurant);

  // Determine smart open/closed status
  const getOpenStatus = () => {
    if (!tr.hours) return { isOpen: true, label: 'Open' };
    const now = new Date();
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const today = days[now.getDay()];
    const hours = tr.hours[today];
    if (!hours) return { isOpen: false, label: 'Closed' };
    
    const [openH, openM] = hours.open.split(':').map(Number);
    const [closeH, closeM] = hours.close.split(':').map(Number);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;
    
    if (currentMinutes >= openMinutes && currentMinutes <= closeMinutes) {
      return { isOpen: true, label: `Open · Closes ${hours.close}` };
    }
    return { isOpen: false, label: `Closed · Opens ${hours.open}` };
  };

  const status = getOpenStatus();

  return (
    <article
      className="rc-card"
      style={{ '--card-index': index }}
    >
      <Link href={`/restaurant/${tr.id}`} className="rc-link">
        {/* Image Section */}
        <div className="rc-image-wrapper">
          <img
            src={tr.heroImage}
            alt={tr.name}
            className="rc-image"
            loading="lazy"
          />
          {/* Gradient overlay for text readability */}
          <div className="rc-image-gradient" />

          {/* Location badge — top left */}
          <span className="rc-badge rc-badge-location">
            {tr.emirate} · {tr.area}
          </span>

          {/* Delivery time — bottom left */}
          {tr.deliveryTime && (
            <span className="rc-badge rc-badge-time">
              <span className="rc-badge-dot" />
              {tr.deliveryTime} min
            </span>
          )}

          {/* Delivery fee — bottom right */}
          <span className="rc-badge rc-badge-fee">
            {tr.deliveryFee === 0 ? 'Free delivery' : `AED ${tr.deliveryFee} delivery`}
          </span>

          {/* Hover CTA Reveal */}
          <div className="rc-hover-cta">
            <span>{t('tasteOfHome.viewMenu')}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Body Section */}
        <div className="rc-body">
          {/* Header: Name + Rating */}
          <div className="rc-header">
            <h3 className="rc-name">{tr.name}</h3>
            <div className="rc-rating">
              <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              <span>{tr.rating}</span>
            </div>
          </div>

          {/* Tagline */}
          <p className="rc-tagline">&ldquo;{tr.tagline}&rdquo;</p>

          {/* Description — clamped to 2 lines */}
          <p className="rc-description">{tr.description}</p>

          {/* 2-Tier Tags */}
          <div className="rc-tags">
            {/* Tier 1: Cuisine (muted) */}
            {tr.cuisine.map((c) => (
              <span key={c} className="rc-tag rc-tag-cuisine">{c}</span>
            ))}
            {/* Tier 2: Premium features (highlighted) */}
            {tr.amenities.includes('mesob') && (
              <span className="rc-tag rc-tag-premium">Mesob Dining</span>
            )}
            {tr.tags.some(tag => tag.toLowerCase().includes('live music')) && (
              <span className="rc-tag rc-tag-premium">Live Music</span>
            )}
          </div>

          {/* Footer: Price + Status */}
          <div className="rc-footer">
            <span className={`rc-status ${status.isOpen ? 'rc-status-open' : 'rc-status-closed'}`}>
              <span className={`rc-status-dot ${status.isOpen ? 'rc-dot-open' : 'rc-dot-closed'}`} />
              {status.isOpen ? 'Open' : 'Closed'}
            </span>
            <span className="rc-price">{tr.priceRange}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
