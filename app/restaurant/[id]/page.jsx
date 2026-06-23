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
import {
  getRestaurantById,
  getReviewsForRestaurant,
} from '@/lib/data';
import '@/app/restaurant-detail.css';

gsap.registerPlugin(ScrollTrigger);

// Helper to determine if restaurant is open
const checkIfOpen = (hours) => {
  if (!hours) return { isOpen: false, text: "Closed" };
  const now = new Date();
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const currentDay = days[now.getDay()];
  const todayHours = hours[currentDay];
  
  if (!todayHours || todayHours.open === 'Closed') {
    return { isOpen: false, text: "Closed today" };
  }
  
  const [openH, openM] = todayHours.open.split(':').map(Number);
  const [closeH, closeM] = todayHours.close.split(':').map(Number);
  
  const openTime = new Date();
  openTime.setHours(openH, openM, 0);
  
  const closeTime = new Date();
  closeTime.setHours(closeH, closeM, 0);
  
  if (closeTime < openTime) {
    closeTime.setDate(closeTime.getDate() + 1);
  }
  
  const isOpen = now >= openTime && now <= closeTime;
  return {
    isOpen,
    text: isOpen ? "Open Now" : "Closed Now"
  };
};

export default function RestaurantDetailPage({ params }) {
  const resolvedParams = use(params);
  const restaurantId = resolvedParams.id;
  const { translateRestaurant, t } = useLanguage();
  const rawRestaurant = getRestaurantById(restaurantId);
  const restaurant = translateRestaurant(rawRestaurant);

  const { items, addItem, totalItems, subtotal, restaurantName } = useCart();
  
  // State variables
  const [activeTab, setActiveTab] = useState('menu');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [activeMenuCategory, setActiveMenuCategory] = useState(restaurant?.menu[0]?.id || '');
  const [cartFlash, setCartFlash] = useState(false);
  
  // Lightbox gallery modal state
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Review form states
  const [reviewsList, setReviewsList] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');

  const heroBgRef = useRef(null);

  useEffect(() => {
    if (restaurant) {
      setReviewsList(getReviewsForRestaurant(restaurant.id));
    }
  }, [restaurant?.id]);

  // GSAP Parallax scroll on hero background
  useEffect(() => {
    if (!heroBgRef.current) return;
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
  }, []);

  // GSAP Stagger Entrance for Menu Items and Reviews
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (activeTab === 'menu') {
        gsap.fromTo(
          '.rd-menu-item',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.45, stagger: 0.04, ease: 'power2.out', clearProps: 'all' }
        );
      } else if (activeTab === 'reviews') {
        gsap.fromTo(
          '.rd-review-card',
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out', clearProps: 'all' }
        );
      } else if (activeTab === 'photos') {
        gsap.fromTo(
          '.rd-gallery-item',
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.4, stagger: 0.04, ease: 'power2.out', clearProps: 'all' }
        );
      }
    });
    return () => ctx.revert();
  }, [activeTab]);

  // Sidebar Scroll-Spy with IntersectionObserver
  useEffect(() => {
    if (activeTab !== 'menu' || !restaurant) return;

    const sections = restaurant.menu.map((cat) => document.getElementById(`category-sec-${cat.id}`));
    const observerOptions = {
      root: null,
      rootMargin: '-180px 0px -40% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const catId = entry.target.id.replace('category-sec-', '');
          setActiveMenuCategory(catId);
        }
      });
    }, observerOptions);

    sections.forEach((sec) => {
      if (sec) observer.observe(sec);
    });

    return () => {
      sections.forEach((sec) => {
        if (sec) observer.unobserve(sec);
      });
    };
  }, [activeTab, restaurant?.id]);

  if (!restaurant) {
    return (
      <div className="rd-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '1rem' }}>Restaurant Not Found</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>We couldn't find a restaurant matching this identifier.</p>
        <Link href="/discover" className="shiny-btn-mini">Back to Discover</Link>
      </div>
    );
  }

  const isOpenInfo = checkIfOpen(restaurant.hours);

  // Handle menu item add
  const handleAddItemClick = (item) => {
    if (item.options && item.options.length > 0) {
      setSelectedItem(item);
      setIsCustomizeOpen(true);
    } else {
      addItem({ ...item, selectedOptions: {}, specialInstructions: '' }, restaurant);
      triggerCartFlash();
    }
  };

  const triggerCartFlash = () => {
    setCartFlash(true);
    setTimeout(() => setCartFlash(false), 800);
  };

  // Submit mock review
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewText.trim()) return;

    const newRev = {
      id: Date.now().toString(),
      restaurantId: restaurant.id,
      userName: newReviewName,
      rating: Number(newReviewRating),
      text: newReviewText,
      date: new Date().toISOString().split('T')[0],
      helpfulCount: 0,
    };

    setReviewsList((prev) => [newRev, ...prev]);
    setNewReviewName('');
    setNewReviewText('');
    setNewReviewRating(5);
    setShowReviewForm(false);
  };

  // Dynamic rating distribution helper
  const getRatingDistribution = (reviews) => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      const rating = Math.round(r.rating);
      if (counts[rating] !== undefined) {
        counts[rating]++;
      }
    });
    const total = reviews.length || 1;
    return Object.keys(counts).reduce((acc, key) => {
      acc[key] = {
        count: counts[key],
        pct: Math.round((counts[key] / total) * 100)
      };
      return acc;
    }, {});
  };

  const ratingDistribution = getRatingDistribution(reviewsList);

  return (
    <div className="rd-container">
      <AppNavbar />
      <CartDrawer />
      
      {/* Item customization sheet */}
      <ItemCustomizationModal
        item={selectedItem}
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        onAdd={(customizedItem) => {
          addItem(customizedItem, restaurant);
          triggerCartFlash();
        }}
      />

      {/* Breadcrumb Navigation */}
      <div className="rd-breadcrumb">
        <Link href="/discover">Discover</Link>
        <span>&rsaquo;</span>
        <span>{restaurant.name}</span>
      </div>

      {/* Hero Header Banner with Parallax */}
      <div className="rd-hero">
        <div
          ref={heroBgRef}
          className="rd-hero-bg"
          style={{ backgroundImage: `url(${restaurant.heroImage})` }}
        />
        <div className="rd-hero-gradient" />

        {/* Restaurant Details Content */}
        <div className="rd-hero-content">
          <div>
            <div className="rd-hero-tags">
              {restaurant.cuisine.map((c) => (
                <span key={c} className="rd-hero-tag">
                  {c}
                </span>
              ))}
              <span className={`rd-hero-tag ${isOpenInfo.isOpen ? 'rd-hero-status-open' : 'rd-hero-status-closed'}`}>
                {isOpenInfo.isOpen ? '🟢 Open Now' : '🔴 Closed Now'}
              </span>
            </div>
            <h1 className="rd-hero-title">
              {restaurant.name}
            </h1>
            <p className="rd-hero-tagline">
              &ldquo;{restaurant.tagline}&rdquo;
            </p>
            <div className="rd-hero-meta">
              <span>📍 {restaurant.emirate} · {restaurant.area}</span>
              <span>•</span>
              <span className="rd-hero-rating">★ {restaurant.rating} ({reviewsList.length} {t('tasteOfHome.reviews')})</span>
              <span>•</span>
              <span className="rd-hero-price">{restaurant.priceRange}</span>
            </div>
          </div>

          <div className="rd-hero-actions">
            <a href="#menu-start" className="shiny-btn" style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem' }}>
              Order Delivery
            </a>
            <button
              onClick={() => alert(`Table booking requests at ${restaurant.name} are currently fully booked for today. Please try again tomorrow!`)}
              className="cta-secondary cta-button"
              style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem', borderRadius: '100px' }}
            >
              Book a Table
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Navigation Tabs */}
      <section className="rd-tabs" id="menu-start">
        <div className="rd-tabs-inner" role="tablist" aria-label="Restaurant Details Tabs">
          {['menu', 'reviews', 'photos', 'info'].map((tab) => (
            <button
              key={tab}
              id={`tab-${tab}`}
              role="tab"
              aria-selected={activeTab === tab}
              aria-controls={`tabpanel-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`rd-tab-btn ${activeTab === tab ? 'rd-tab-btn-active' : ''}`}
            >
              {tab}
              {activeTab === tab && <span className="rd-tab-line" />}
            </button>
          ))}
        </div>
      </section>

      {/* Main Content Sections */}
      <div className="rd-content-wrapper">
        
        {/* TAB 1: MENU */}
        {activeTab === 'menu' && (
          <div className="rd-menu-layout" role="tabpanel" id="tabpanel-menu" aria-labelledby="tab-menu">
            {/* Left Category Navigation (Desktop Sidebar / Mobile Horizontal scroll) */}
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

            {/* Menu Items Content */}
            <div style={{ flex: 1 }}>
              {restaurant.menu.map((cat) => (
                <section
                  key={cat.id}
                  id={`category-sec-${cat.id}`}
                  className="rd-menu-category-section"
                >
                  <h2 className="rd-menu-category-title">
                    {cat.name}
                  </h2>
                  <div className="rd-menu-grid">
                    {cat.items.map((item) => (
                      <div key={item.id} className="rd-menu-item">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="rd-menu-item-img"
                          />
                        )}
                        <div className="rd-menu-item-body">
                          <div className="rd-menu-item-header">
                            <h3 className="rd-menu-item-name">{item.name}</h3>
                            <span className="rd-menu-item-price">AED {item.price}</span>
                          </div>
                          <p className="rd-menu-item-desc">
                            {item.description}
                          </p>
                          <div className="rd-menu-item-footer">
                            <div className="rd-item-tags">
                              {item.tags.includes('spicy') && (
                                <span className="rd-item-tag rd-item-tag-spicy">🌶️ Spicy</span>
                              )}
                              {item.tags.includes('vegan') && (
                                <span className="rd-item-tag rd-item-tag-vegan">🌱 Vegan</span>
                              )}
                              {item.tags.includes('popular') && (
                                <span className="rd-item-tag rd-item-tag-popular">🔥 Popular</span>
                              )}
                            </div>
                            <button
                              onClick={() => handleAddItemClick(item)}
                              className="shiny-btn-mini"
                              style={{ padding: '0.35rem 0.85rem', borderRadius: '100px', fontSize: '0.75rem' }}
                            >
                              + Add
                            </button>
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

        {/* TAB 2: REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="rd-reviews-container" role="tabpanel" id="tabpanel-reviews" aria-labelledby="tab-reviews">
            {/* Reviews Summary & Rating Distribution Bar Chart */}
            <div className="rd-reviews-summary">
              <div>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', margin: '0 0 0.5rem 0' }}>Overall Rating</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  <span style={{ fontSize: '3rem', fontWeight: 900 }}>{restaurant.rating}</span>
                  <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.4)' }}>/ 5.0</span>
                </div>
                <div style={{ display: 'flex', color: 'var(--color-habesha-gold)', gap: '0.15rem', marginTop: '0.5rem' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s}>★</span>
                  ))}
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem', marginBlockEnd: 0 }}>Based on {reviewsList.length} reviews</p>
              </div>

              {/* Dynamic bar chart rating distribution */}
              <div className="rd-rating-breakdown">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const dist = ratingDistribution[stars] || { count: 0, pct: 0 };
                  return (
                    <div key={stars} className="rd-rating-bar-row">
                      <span style={{ width: '45px' }}>{stars} Star</span>
                      <div className="rd-rating-bar-bg">
                        <div className="rd-rating-bar-fill" style={{ width: `${dist.pct}%` }} />
                      </div>
                      <span style={{ width: '30px', textAlign: 'right' }}>{dist.pct}%</span>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setShowReviewForm(true)}
                className="shiny-btn"
                style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem' }}
              >
                Write a Review
              </button>
            </div>

            {/* Write a Review Form overlay */}
            {showReviewForm && (
              <form
                onSubmit={handleReviewSubmit}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '20px',
                  padding: '2rem',
                  marginBottom: '2rem',
                  position: 'relative',
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '1.5rem', cursor: 'pointer' }}
                >
                  ×
                </button>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                  Share Your Experience
                </h3>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Your Name</label>
                  <input
                    type="text"
                    required
                    value={newReviewName}
                    onChange={(e) => setNewReviewName(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#fff' }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Rating</label>
                  <select
                    value={newReviewRating}
                    onChange={(e) => setNewReviewRating(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#fff', outline: 'none' }}
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n} style={{ background: '#22272c', color: '#fff' }}>
                        {n} Stars {n === 5 ? '— Excellent!' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Review Details</label>
                  <textarea
                    required
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    placeholder="Describe the dishes, flavors, atmosphere, and service..."
                    style={{ width: '100%', height: '100px', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#fff', resize: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="submit" className="shiny-btn" style={{ padding: '0.6rem 1.5rem', fontSize: '0.875rem' }}>
                    Submit Review
                  </button>
                  <button type="button" onClick={() => setShowReviewForm(false)} className="cta-secondary cta-button" style={{ padding: '0.6rem 1.5rem', fontSize: '0.875rem', borderRadius: '100px' }}>
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Reviews List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {reviewsList.map((rev) => (
                <div key={rev.id} className="rd-review-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div 
                        className="rd-review-avatar"
                        style={{
                          background: rev.rating >= 4 ? 'rgba(52, 199, 89, 0.15)' : 'rgba(252, 217, 0, 0.15)',
                          color: rev.rating >= 4 ? 'var(--color-habesha-green)' : 'var(--color-habesha-gold)',
                          border: `1px solid ${rev.rating >= 4 ? 'rgba(52, 199, 89, 0.25)' : 'rgba(252, 217, 0, 0.25)'}`
                        }}
                      >
                        {rev.userName.charAt(0)}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0 }}>{rev.userName}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>{rev.date}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', color: 'var(--color-habesha-gold)', gap: '0.1rem' }}>
                      {Array.from({ length: rev.rating }).map((_, idx) => (
                        <span key={idx}>★</span>
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
                    &ldquo;{rev.text}&rdquo;
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={() => alert('Thanks for marking this review as helpful!')}
                      style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      👍 Helpful ({rev.helpfulCount})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PHOTOS & LIGHTBOX */}
        {activeTab === 'photos' && (
          <div role="tabpanel" id="tabpanel-photos" aria-labelledby="tab-photos">
            <div className="rd-gallery-grid">
              {restaurant.images.map((imgUrl, i) => (
                <div
                  key={i}
                  className="rd-gallery-item"
                  onClick={() => setLightboxIndex(i)}
                >
                  <img
                    src={imgUrl}
                    alt={`${restaurant.name} gallery ${i}`}
                    className="rd-gallery-img"
                  />
                </div>
              ))}
            </div>

            {/* Photo Lightbox Overlay */}
            {lightboxIndex !== null && (
              <div className="rd-lightbox rd-lightbox-active" onClick={() => setLightboxIndex(null)}>
                <div className="rd-lightbox-content" onClick={(e) => e.stopPropagation()}>
                  <button className="rd-lightbox-close" onClick={() => setLightboxIndex(null)}>×</button>
                  <img
                    src={restaurant.images[lightboxIndex]}
                    alt={`${restaurant.name} photo ${lightboxIndex}`}
                    className="rd-lightbox-img"
                  />
                  {restaurant.images.length > 1 && (
                    <>
                      <button
                        className="rd-lightbox-arrow rd-lightbox-arrow-left"
                        onClick={() => setLightboxIndex((prev) => (prev === 0 ? restaurant.images.length - 1 : prev - 1))}
                      >
                        &larr;
                      </button>
                      <button
                        className="rd-lightbox-arrow rd-lightbox-arrow-right"
                        onClick={() => setLightboxIndex((prev) => (prev === restaurant.images.length - 1 ? 0 : prev + 1))}
                      >
                        &rarr;
                      </button>
                    </>
                  )}
                  <div className="rd-lightbox-caption">
                    {restaurant.name} — Photo {lightboxIndex + 1} of {restaurant.images.length}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: INFO */}
        {activeTab === 'info' && (
          <div className="rd-info-grid" role="tabpanel" id="tabpanel-info" aria-labelledby="tab-info">
            {/* Hours */}
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                Opening Hours
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                {[
                  { name: 'Monday', code: 'mon' },
                  { name: 'Tuesday', code: 'tue' },
                  { name: 'Wednesday', code: 'wed' },
                  { name: 'Thursday', code: 'thu' },
                  { name: 'Friday', code: 'fri' },
                  { name: 'Saturday', code: 'sat' },
                  { name: 'Sunday', code: 'sun' },
                ].map((day) => {
                  const hrs = restaurant.hours[day.code];
                  return (
                    <div key={day.code} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ fontWeight: 600 }}>{day.name}</span>
                      <span style={{ color: 'var(--color-text-secondary)' }}>{hrs.open} - {hrs.close}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Amenities and Contact */}
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                Amenities & details
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                {restaurant.amenities.map((amen) => {
                  const labels = {
                    wifi: '📶 Free High-speed WiFi',
                    parking: '🚗 Free Valet & Customer Parking',
                    halal: '🥩 100% Certified Halal Ingredients',
                    mesob: '🫓 Traditional Mesob Basket Dining Rooms',
                    delivery: '🚀 Fast Home Delivery Available',
                    'dine-in': '🍽️ Spacious Dine-in Seating',
                  };
                  return (
                    <div key={amen} style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {labels[amen] || amen}
                    </div>
                  );
                })}
              </div>

              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                Address & Contact
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: '0 0 0.5rem 0' }}>
                🏢 {restaurant.address}
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                📞 +971 4 345 6789 (Mock Phone)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Order Bar */}
      {totalItems > 0 && (
        <div className={`sticky-order-bar ${cartFlash ? 'cart-flash' : ''}`}>
          <div className="sticky-order-info">
            <span>🛒 {totalItems} {totalItems === 1 ? t('discover.stickyItem') : t('discover.stickyItems')}</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>|</span>
            <span style={{ color: 'var(--color-habesha-green)', fontWeight: 700 }}>AED {subtotal}</span>
            {restaurantName && restaurantName !== restaurant.name && (
              <span className="sticky-order-restaurant">{t('discover.stickyFrom')} {restaurantName}</span>
            )}
          </div>
          <button
            onClick={() => {
              const btn = document.getElementById('cart-btn');
              if (btn) btn.click();
            }}
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
