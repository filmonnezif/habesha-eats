'use client';

import { useState, useEffect, use, useRef } from 'react';
import AppNavbar from '@/components/AppNavbar';
import CartDrawer from '@/components/CartDrawer';
import ItemCustomizationModal from '@/components/ItemCustomizationModal';
import { useCart } from '@/lib/CartContext';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '@/lib/LanguageContext';
import '@/app/restaurant-detail.css';

gsap.registerPlugin(ScrollTrigger);

export default function RestaurantDetailPage({ params }) {
  const resolvedParams = use(params);
  const restaurantSlug = resolvedParams.id;
  const { t } = useLanguage();

  const { items, addItem, totalItems, subtotal, restaurantName } = useCart();
  
  // State
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [activeMenuCategory, setActiveMenuCategory] = useState('');
  const [cartFlash, setCartFlash] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const heroBgRef = useRef(null);

  // Fetch restaurant data from API
  useEffect(() => {
    async function fetchRestaurant() {
      try {
        const res = await fetch(`/api/restaurants/${restaurantSlug}`);
        if (res.ok) {
          const data = await res.json();
          setRestaurant(data);
          if (data.menu && data.menu.length > 0) {
            setActiveMenuCategory(data.menu[0].id);
            setActiveTab('menu');
          }
        }
      } catch (err) {
        console.error('Failed to fetch restaurant:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRestaurant();
  }, [restaurantSlug]);

  // GSAP Parallax scroll on hero background
  useEffect(() => {
    if (!heroBgRef.current || !restaurant) return;
    const ctx = gsap.context(() => {
      gsap.to(heroBgRef.current, {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: {
          trigger: '.rd-hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });
    });
    return () => ctx.revert();
  }, [restaurant]);

  // GSAP Stagger Entrance
  useEffect(() => {
    if (!restaurant) return;
    const ctx = gsap.context(() => {
      if (activeTab === 'menu') {
        gsap.fromTo('.rd-menu-item', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.04, ease: 'power2.out', clearProps: 'all' });
      } else if (activeTab === 'info') {
        gsap.fromTo('.rd-info-card', { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out', clearProps: 'all' });
      }
    });
    return () => ctx.revert();
  }, [activeTab, restaurant]);

  if (loading) {
    return (
      <div className="rd-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#16191c', color: '#fff' }}>
        <div className="skeleton-card" style={{ width: '300px', height: '200px' }} />
        <p style={{ marginTop: '1rem', opacity: 0.5 }}>Loading restaurant...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="rd-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '1rem' }}>Restaurant Not Found</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>We couldn&apos;t find a restaurant matching this identifier.</p>
        <Link href="/discover" className="shiny-btn-mini">Back to Discover</Link>
      </div>
    );
  }

  const heroImage = restaurant.heroImage || '/images/dish_injera.webp';
  const primaryBranch = restaurant.branches?.find(b => b.isFeatured) || restaurant.branches?.[0];
  const hasMenu = restaurant.menu && restaurant.menu.length > 0;
  const tabs = hasMenu ? ['menu', 'info'] : ['info'];

  // Social link icon mapping
  const socialIcons = {
    INSTAGRAM: { icon: '📸', color: '#E1306C', label: 'Instagram' },
    FACEBOOK: { icon: '📘', color: '#1877F2', label: 'Facebook' },
    TIKTOK: { icon: '🎵', color: '#000000', label: 'TikTok' },
    YOUTUBE: { icon: '▶️', color: '#FF0000', label: 'YouTube' },
    WEBSITE: { icon: '🌐', color: '#34C759', label: 'Website' },
  };

  const handleAddItemClick = (item) => {
    addItem({ ...item, selectedOptions: {}, specialInstructions: '' }, restaurant);
    triggerCartFlash();
  };

  const triggerCartFlash = () => {
    setCartFlash(true);
    setTimeout(() => setCartFlash(false), 800);
  };

  return (
    <div className="rd-container">
      <AppNavbar />
      <CartDrawer />
      
      <ItemCustomizationModal
        item={selectedItem}
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        onAdd={(customizedItem) => {
          addItem(customizedItem, restaurant);
          triggerCartFlash();
        }}
      />

      {/* Breadcrumb */}
      <div className="rd-breadcrumb">
        <Link href="/discover">Discover</Link>
        <span>&rsaquo;</span>
        <span>{restaurant.name}</span>
      </div>

      {/* Hero */}
      <div className="rd-hero">
        <div
          ref={heroBgRef}
          className="rd-hero-bg"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="rd-hero-gradient" />

        <div className="rd-hero-content">
          <div>
            <div className="rd-hero-tags">
              {restaurant.cuisines?.map((c) => (
                <span key={c} className="rd-hero-tag">{c}</span>
              ))}
              {restaurant.type?.name && restaurant.type.name !== 'Restaurant' && (
                <span className="rd-hero-tag">{restaurant.type.name}</span>
              )}
            </div>
            <h1 className="rd-hero-title">{restaurant.name}</h1>
            {restaurant.tagline && (
              <p className="rd-hero-tagline">&ldquo;{restaurant.tagline}&rdquo;</p>
            )}
            <div className="rd-hero-meta">
              <span>📍 {restaurant.emirate}{restaurant.area ? ` · ${restaurant.area}` : ''}</span>
              {restaurant.rating > 0 && (
                <>
                  <span>•</span>
                  <span className="rd-hero-rating">★ {restaurant.rating}</span>
                </>
              )}
              <span>•</span>
              <span className="rd-hero-price">{restaurant.priceRange}</span>
            </div>
          </div>

          <div className="rd-hero-actions">
            {primaryBranch?.googleMapsUrl && (
              <a 
                href={primaryBranch.googleMapsUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="shiny-btn" 
                style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem' }}
              >
                📍 View on Maps
              </a>
            )}
            {primaryBranch?.phone && primaryBranch.phone !== 'missing' && (
              <a
                href={`tel:${primaryBranch.phone}`}
                className="cta-secondary cta-button"
                style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem', borderRadius: '100px' }}
              >
                📞 Call Now
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <section className="rd-tabs" id="menu-start">
        <div className="rd-tabs-inner" role="tablist" aria-label="Restaurant Details Tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              id={`tab-${tab}`}
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={`rd-tab-btn ${activeTab === tab ? 'rd-tab-btn-active' : ''}`}
            >
              {tab}
              {activeTab === tab && <span className="rd-tab-line" />}
            </button>
          ))}
        </div>
      </section>

      {/* Content */}
      <div className="rd-content-wrapper">
        
        {/* MENU TAB */}
        {activeTab === 'menu' && hasMenu && (
          <div className="rd-menu-layout" role="tabpanel">
            <aside className="rd-menu-aside">
              {restaurant.menu.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveMenuCategory(cat.id);
                    document.getElementById(`category-sec-${cat.id}`)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`rd-menu-aside-btn ${activeMenuCategory === cat.id ? 'rd-menu-aside-btn-active' : ''}`}
                >
                  {cat.name}
                </button>
              ))}
            </aside>

            <div style={{ flex: 1 }}>
              {restaurant.menu.map((cat) => (
                <section key={cat.id} id={`category-sec-${cat.id}`} className="rd-menu-category-section">
                  <h2 className="rd-menu-category-title">{cat.name}</h2>
                  <div className="rd-menu-grid">
                    {cat.items.map((item) => (
                      <div key={item.id} className="rd-menu-item">
                        {item.imageUrl && (
                          <img src={item.imageUrl} alt={item.name} className="rd-menu-item-img" />
                        )}
                        <div className="rd-menu-item-body">
                          <div className="rd-menu-item-header">
                            <h3 className="rd-menu-item-name">{item.name}</h3>
                            <span className="rd-menu-item-price">AED {item.price}</span>
                          </div>
                          {item.description && (
                            <p className="rd-menu-item-desc">{item.description}</p>
                          )}
                          <div className="rd-menu-item-footer">
                            <div className="rd-item-tags">
                              {item.tags?.includes('spicy') && <span className="rd-item-tag rd-item-tag-spicy">🌶️ Spicy</span>}
                              {item.tags?.includes('vegan') && <span className="rd-item-tag rd-item-tag-vegan">🌱 Vegan</span>}
                              {item.tags?.includes('popular') && <span className="rd-item-tag rd-item-tag-popular">🔥 Popular</span>}
                              {!item.isAvailable && <span className="rd-item-tag" style={{ color: '#ff6b6b' }}>Unavailable</span>}
                            </div>
                            {item.isAvailable && (
                              <button
                                onClick={() => handleAddItemClick(item)}
                                className="shiny-btn-mini"
                                style={{ padding: '0.35rem 0.85rem', borderRadius: '100px', fontSize: '0.75rem' }}
                              >
                                + Add
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        )}

        {/* INFO TAB */}
        {activeTab === 'info' && (
          <div className="rd-info-grid" role="tabpanel">
            
            {/* Contact & Social */}
            <div className="rd-info-card">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                Contact & Social
              </h3>
              
              {/* Social Links */}
              {restaurant.socialLinks && restaurant.socialLinks.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  {restaurant.socialLinks.map((s, i) => {
                    const si = socialIcons[s.code] || { icon: '🔗', color: '#888', label: s.platform };
                    return (
                      <a
                        key={i}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.6rem 1rem',
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '0.875rem',
                          textDecoration: 'none',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        <span style={{ fontSize: '1.1rem' }}>{si.icon}</span>
                        <span>{si.label}</span>
                      </a>
                    );
                  })}
                </div>
              )}

              {/* Phone / WhatsApp */}
              {primaryBranch?.phone && primaryBranch.phone !== 'missing' && (
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: '0 0 0.5rem 0' }}>
                  📞 <a href={`tel:${primaryBranch.phone}`} style={{ color: 'var(--color-habesha-green)', textDecoration: 'none' }}>{primaryBranch.phone}</a>
                </p>
              )}
              {primaryBranch?.whatsapp && primaryBranch.whatsapp !== 'missing' && (
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: '0 0 0.5rem 0' }}>
                  💬 <a href={`https://wa.me/${primaryBranch.whatsapp.replace(/\s+/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-habesha-green)', textDecoration: 'none' }}>WhatsApp</a>
                </p>
              )}
              {restaurant.email && (
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                  ✉️ <a href={`mailto:${restaurant.email}`} style={{ color: 'var(--color-habesha-green)', textDecoration: 'none' }}>{restaurant.email}</a>
                </p>
              )}
            </div>

            {/* Branches / Locations */}
            <div className="rd-info-card">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                Locations ({restaurant.branches?.length || 0})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {restaurant.branches?.map((branch) => (
                  <div
                    key={branch.id}
                    style={{
                      padding: '1rem',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '14px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
                        📍 {branch.emirate}{branch.area ? ` — ${branch.area}` : ''}
                      </h4>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        {branch.acceptsDineIn && (
                          <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', background: 'rgba(52,199,89,0.12)', color: 'var(--color-habesha-green)', borderRadius: '6px' }}>Dine-in</span>
                        )}
                        {branch.acceptsDelivery && (
                          <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', background: 'rgba(252,217,0,0.12)', color: 'var(--color-habesha-gold)', borderRadius: '6px' }}>Delivery</span>
                        )}
                      </div>
                    </div>
                    {branch.address && (
                      <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', margin: '0 0 0.5rem 0' }}>{branch.address}</p>
                    )}
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {branch.phone && branch.phone !== 'missing' && (
                        <a href={`tel:${branch.phone}`} style={{ fontSize: '0.8125rem', color: 'var(--color-habesha-green)', textDecoration: 'none' }}>📞 {branch.phone}</a>
                      )}
                      {branch.googleMapsUrl && (
                        <a href={branch.googleMapsUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8125rem', color: 'var(--color-habesha-green)', textDecoration: 'none' }}>🗺️ Maps</a>
                      )}
                    </div>

                    {/* Delivery Partner UAE Apps */}
                    {branch.deliveryPartners && branch.deliveryPartners.filter(dp => dp.partnerUrl).length > 0 && (
                      <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', marginTop: 0 }}>
                          Order Delivery
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {branch.deliveryPartners.filter(dp => dp.partnerUrl).map((dp) => {
                            let brandColor = '#ff5a00';
                            let brandName = dp.name;
                            let emoji = '🛵';
                            if (dp.code === 'TALABAT') { brandColor = '#FF5A00'; emoji = '🛵'; brandName = 'Talabat'; }
                            else if (dp.code === 'DELIVEROO') { brandColor = '#00CDBC'; emoji = '🦘'; brandName = 'Deliveroo'; }
                            else if (dp.code === 'NOON') { brandColor = '#e6cf00'; emoji = '🟡'; brandName = 'Noon Food'; }
                            else if (dp.code === 'CAREEM') { brandColor = '#47A248'; emoji = '💚'; brandName = 'Careem'; }

                            return (
                              <a
                                key={dp.code}
                                href={dp.partnerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  padding: '0.35rem 0.65rem',
                                  background: 'rgba(255,255,255,0.02)',
                                  border: '1px solid rgba(255,255,255,0.06)',
                                  borderRadius: '8px',
                                  color: '#fff',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  textDecoration: 'none',
                                  transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={e => {
                                  e.currentTarget.style.background = `${brandColor}15`;
                                  e.currentTarget.style.borderColor = brandColor;
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                                }}
                              >
                                <span style={{ fontSize: '0.85rem' }}>{emoji}</span>
                                <span>{brandName}</span>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar */}
      {totalItems > 0 && (
        <div className={`sticky-order-bar ${cartFlash ? 'cart-flash' : ''}`}>
          <div className="sticky-order-info">
            <span>🛒 {totalItems} {totalItems === 1 ? t('discover.stickyItem') : t('discover.stickyItems')}</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>|</span>
            <span style={{ color: 'var(--color-habesha-green)', fontWeight: 700 }}>AED {subtotal}</span>
          </div>
          <button
            onClick={() => { const btn = document.getElementById('cart-btn'); if (btn) btn.click(); }}
            className="shiny-btn-mini"
            style={{ padding: '0.5rem 1.25rem' }}
          >
            {t('discover.stickyViewCart')}
          </button>
        </div>
      )}
    </div>
  );
}
