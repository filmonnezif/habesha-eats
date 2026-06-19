'use client';

import { useRef } from 'react';
import Link from 'next/link';

/**
 * Beautiful glassmorphic card for restaurant list display.
 * Features rating, emirate badge, delivery info, and price range.
 */
export default function RestaurantCard({ restaurant }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xc = rect.width / 2;
    const yc = rect.height / 2;

    const angleX = -(yc - y) / 20; // gentle tilt
    const angleY = (xc - x) / 24;

    card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) translateY(-4px)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
  };

  return (
    <article
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="restaurant-card"
      style={{
        transition: 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.2s',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
    >
      <Link href={`/restaurant/${restaurant.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        <div className="restaurant-card-image-wrapper" style={{ position: 'relative', overflow: 'hidden', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', height: '200px' }}>
          <img
            src={restaurant.heroImage}
            alt={restaurant.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
            className="restaurant-img"
          />
          <span className="card-emirate-badge" style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)', padding: '0.35rem 0.75rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600, color: '#ffffff', zIndex: 2 }}>
            {restaurant.emirate} · {restaurant.area}
          </span>
          {restaurant.deliveryTime && (
            <span style={{ position: 'absolute', bottom: '1rem', left: '1rem', background: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(8px)', padding: '0.35rem 0.75rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600, color: '#ffffff', zIndex: 2, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              🕐 {restaurant.deliveryTime} min
            </span>
          )}
        </div>

        <div className="restaurant-card-body" style={{ padding: '1.5rem', background: 'var(--color-surface-elevated)', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px', border: '1px solid var(--color-border-subtle)', borderTop: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="restaurant-card-header" style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="restaurant-card-name" style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.01em', margin: 0, color: 'var(--color-text-primary)' }}>
              {restaurant.name}
            </h3>
            <div className="card-rating-badge" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--color-border-subtle)', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-habesha-gold)' }}>
              <svg className="star-icon" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              <span>{restaurant.rating}</span>
            </div>
          </div>

          <p className="restaurant-card-tagline" style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: 0, fontStyle: 'italic' }}>
            &ldquo;{restaurant.tagline}&rdquo;
          </p>

          <p className="restaurant-card-description" style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', margin: 0, display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {restaurant.description}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
            {restaurant.cuisine.map((c) => (
              <span key={c} style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '0.2rem 0.5rem', background: 'var(--color-border-subtle)', borderRadius: '4px', textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
                {c}
              </span>
            ))}
            {restaurant.amenities.includes('mesob') && (
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '0.2rem 0.5rem', background: 'var(--color-gold-badge-bg)', border: '1px solid var(--color-gold-badge-border)', borderRadius: '4px', textTransform: 'uppercase', color: 'var(--color-habesha-gold)' }}>
                Mesob Dining
              </span>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border-subtle)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
              Delivery: {restaurant.deliveryFee === 0 ? 'Free' : `AED ${restaurant.deliveryFee}`}
            </span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-habesha-green)' }}>
              {restaurant.priceRange}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
