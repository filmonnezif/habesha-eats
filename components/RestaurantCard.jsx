'use client';

import Link from 'next/link';

/**
 * Premium glassmorphic restaurant card for the Discover grid.
 * Supports both hardcoded (legacy) and database-backed restaurant objects.
 * Features: hover transition, stagger-in animation, hover CTA reveal,
 * 2-tier tag system, and social/location badges.
 */
export default function RestaurantCard({ restaurant, index = 0 }) {
  // Normalize data shape — support both DB format and legacy format
  const r = restaurant;
  const name = r.name || '';
  const slug = r.slug || r.id;
  const heroImage = r.heroImage || r.hero_image_url || '/images/dish_injera.webp';
  const rating = r.rating || 0;
  const tagline = r.tagline || '';
  const description = r.description || '';
  const priceRange = r.priceRange || r.price_range || '$$';
  const cuisines = r.cuisines || r.cuisine || [];
  const emirate = r.emirate || '';
  const area = r.area || '';
  const phone = r.phone || '';
  const typeName = r.type?.name || '';
  const branches = r.branches || [];
  const socialLinks = r.socialLinks || [];
  const googleMapsUrl = r.googleMapsUrl || '';

  // Get social icons
  const getSocialIcon = (code) => {
    const icons = {
      INSTAGRAM: '📸',
      FACEBOOK: '📘',
      TIKTOK: '🎵',
      YOUTUBE: '▶️',
      WEBSITE: '🌐',
    };
    return icons[code] || '🔗';
  };

  // Show number of branches if multiple
  const branchCount = branches.length;
  const branchEmirateNames = [...new Set(branches.map(b => b.emirate))].filter(Boolean);

  return (
    <article
      className="rc-card"
      style={{ '--card-index': index }}
    >
      <Link href={`/restaurant/${slug}`} className="rc-link">
        {/* Image Section */}
        <div className="rc-image-wrapper">
          <img
            src={heroImage}
            alt={name}
            className="rc-image"
            loading="lazy"
            onError={(e) => { e.target.src = '/images/dish_injera.webp'; }}
          />
          {/* Gradient overlay for text readability */}
          <div className="rc-image-gradient" />

          {/* Location badge — top left */}
          <span className="rc-badge rc-badge-location">
            {emirate}{area ? ` · ${area}` : ''}
          </span>

          {/* Type badge — top right */}
          {typeName && typeName !== 'Restaurant' && (
            <span className="rc-badge rc-badge-fee">
              {typeName}
            </span>
          )}

          {/* Branch count — bottom left */}
          {branchCount > 1 && (
            <span className="rc-badge rc-badge-time">
              <span className="rc-badge-dot" />
              {branchCount} locations
            </span>
          )}

          {/* Hover CTA Reveal */}
          <div className="rc-hover-cta">
            <span>View Details</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Body Section */}
        <div className="rc-body">
          {/* Header: Name + Rating */}
          <div className="rc-header">
            <h3 className="rc-name">{name}</h3>
            {rating > 0 && (
              <div className="rc-rating">
                <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                <span>{rating}</span>
              </div>
            )}
          </div>

          {/* Tagline */}
          {tagline && <p className="rc-tagline">&ldquo;{tagline}&rdquo;</p>}

          {/* Description — clamped to 2 lines */}
          {description && <p className="rc-description">{description}</p>}

          {/* 2-Tier Tags */}
          <div className="rc-tags">
            {/* Tier 1: Cuisine (muted) */}
            {cuisines.map((c) => (
              <span key={c} className="rc-tag rc-tag-cuisine">{c}</span>
            ))}
            {/* Tier 2: Branch emirates */}
            {branchEmirateNames.length > 1 && branchEmirateNames.slice(0, 2).map(e => (
              <span key={e} className="rc-tag rc-tag-premium">{e}</span>
            ))}
          </div>

          {/* Footer: Social links + Price */}
          <div className="rc-footer">
            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
              {socialLinks.slice(0, 3).map((s, i) => (
                <span key={i} title={s.platform} style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                  {getSocialIcon(s.code)}
                </span>
              ))}
              {phone && phone !== 'missing' && (
                <span style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)' }}>📞</span>
              )}
            </div>
            <span className="rc-price">{priceRange}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
