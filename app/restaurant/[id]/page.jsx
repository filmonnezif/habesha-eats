'use client';

import { useState, useEffect, use, useRef } from 'react';
import AppNavbar from '@/components/AppNavbar';
import CartDrawer from '@/components/CartDrawer';
import ItemCustomizationModal from '@/components/ItemCustomizationModal';
import { useCart } from '@/lib/CartContext';
import Link from 'next/link';
import {
  getRestaurantById,
  getReviewsForRestaurant,
  restaurants,
} from '@/lib/data';

export default function RestaurantDetailPage({ params }) {
  // Unwrapping params Promise (standard Next.js 16/React 19 pattern)
  const resolvedParams = use(params);
  const restaurantId = resolvedParams.id;
  const restaurant = getRestaurantById(restaurantId);

  const { items, addItem, totalItems, subtotal, restaurantName } = useCart();
  
  // State variables
  const [activeTab, setActiveTab] = useState('menu');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [activeMenuCategory, setActiveMenuCategory] = useState(restaurant?.menu[0]?.id || '');

  // Review form states
  const [reviewsList, setReviewsList] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');

  const menuSectionsRef = useRef({});

  useEffect(() => {
    if (restaurant) {
      setReviewsList(getReviewsForRestaurant(restaurant.id));
    }
  }, [restaurant]);

  if (!restaurant) {
    return (
      <div className="discover-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#16191c', color: '#fff', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '1rem' }}>Restaurant Not Found</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>We couldn't find a restaurant matching this identifier.</p>
        <Link href="/discover" className="shiny-btn-mini">Back to Discover</Link>
      </div>
    );
  }

  // Handle menu item click
  const handleAddItemClick = (item) => {
    if (item.options && item.options.length > 0) {
      setSelectedItem(item);
      setIsCustomizeOpen(true);
    } else {
      // Direct add to cart
      addItem({ ...item, selectedOptions: {}, specialInstructions: '' }, restaurant);
    }
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

  return (
    <div className="discover-page" style={{ background: '#16191c', color: '#fff', minHeight: '100vh', paddingBottom: '6rem' }}>
      <AppNavbar />
      <CartDrawer />
      
      {/* Item customization sheet */}
      <ItemCustomizationModal
        item={selectedItem}
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        onAdd={(customizedItem) => addItem(customizedItem, restaurant)}
      />

      {/* Hero Header Banner */}
      <div
        style={{
          position: 'relative',
          height: '42vh',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Background Image with elegant fade overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${restaurant.heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.65)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(22, 25, 28, 0.1) 0%, rgba(22, 25, 28, 0.45) 50%, #16191c 100%)',
          }}
        />

        {/* Restaurant Details Header */}
        <div
          style={{
            position: 'absolute',
            bottom: '1.5rem',
            left: 0,
            right: 0,
            padding: '0 2rem',
            maxWidth: '1280px',
            margin: '0 auto',
            zIndex: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              {restaurant.cuisine.map((c) => (
                <span key={c} style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.75rem', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', borderRadius: '100px', textTransform: 'uppercase' }}>
                  {c}
                </span>
              ))}
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.75rem', background: 'rgba(52, 199, 89, 0.15)', color: 'var(--color-habesha-green)', borderRadius: '100px', textTransform: 'uppercase' }}>
                🟢 Open Now
              </span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4.5vw, 3.25rem)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', margin: '0 0 0.5rem 0' }}>
              {restaurant.name}
            </h1>
            <p style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.7)', margin: 0, fontStyle: 'italic', maxWidth: '600px' }}>
              &ldquo;{restaurant.tagline}&rdquo;
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.75rem', fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.5)' }}>
              <span>📍 {restaurant.emirate} · {restaurant.area}</span>
              <span>•</span>
              <span style={{ color: 'var(--color-habesha-gold)', fontWeight: 600 }}>★ {restaurant.rating} ({restaurant.reviewCount} reviews)</span>
              <span>•</span>
              <span style={{ fontWeight: 700, color: '#fff' }}>{restaurant.priceRange}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
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
      <section
        style={{
          position: 'sticky',
          top: '80px',
          zIndex: 90,
          background: 'rgba(22, 25, 28, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
        id="menu-start"
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem', display: 'flex', gap: '2rem', height: '54px', alignItems: 'center' }}>
          {['menu', 'reviews', 'photos', 'info'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === tab ? '#fff' : 'rgba(255, 255, 255, 0.6)',
                fontFamily: 'var(--font-display)',
                fontSize: '0.9375rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                position: 'relative',
                height: '100%',
                padding: '0 0.5rem',
                transition: 'color 0.2s',
              }}
            >
              {tab}
              {activeTab === tab && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'var(--color-habesha-gold)',
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Main Content Sections */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem' }}>
        
        {/* TAB 1: MENU */}
        {activeTab === 'menu' && (
          <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '3rem', alignItems: 'start' }}>
            {/* Left Category Navigation (Desktop) */}
            <aside style={{ position: 'sticky', top: '160px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }} className="menu-aside-nav">
              {restaurant.menu.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveMenuCategory(cat.id);
                    document.getElementById(`category-sec-${cat.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  style={{
                    background: activeMenuCategory === cat.id ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    color: activeMenuCategory === cat.id ? 'var(--color-habesha-gold)' : 'rgba(255,255,255,0.7)',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </aside>

            {/* Menu Items Content */}
            <div>
              {restaurant.menu.map((cat) => (
                <section
                  key={cat.id}
                  id={`category-sec-${cat.id}`}
                  style={{ marginBottom: '3rem' }}
                >
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                    {cat.name}
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
                    {cat.items.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '16px',
                          padding: '1.25rem',
                          display: 'flex',
                          gap: '1rem',
                          alignItems: 'center',
                          transition: 'all 0.3s',
                        }}
                        className="menu-item-card"
                      >
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '12px' }}
                          />
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0 }}>{item.name}</h3>
                            <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-habesha-green)' }}>AED {item.price}</span>
                          </div>
                          <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)', margin: '0 0 0.75rem 0', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {item.description}
                          </p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                              {item.tags.includes('spicy') && (
                                <span style={{ fontSize: '0.625rem', fontWeight: 700, background: 'rgba(255, 69, 79, 0.12)', color: 'var(--color-habesha-red)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>🌶️ Spicy</span>
                              )}
                              {item.tags.includes('vegan') && (
                                <span style={{ fontSize: '0.625rem', fontWeight: 700, background: 'rgba(52, 199, 89, 0.12)', color: 'var(--color-habesha-green)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>🌱 Vegan</span>
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
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Reviews Summary Stats */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem', padding: '2rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '20px', marginBottom: '2rem' }} className="reviews-summary-flex">
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {reviewsList.map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                        {rev.userName.charAt(0)}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0 }}>{rev.userName}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{rev.date}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', color: 'var(--color-habesha-gold)', gap: '0.1rem' }}>
                      {Array.from({ length: rev.rating }).map((_, idx) => (
                        <span key={idx}>★</span>
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
                    &ldquo;{rev.text}&rdquo;
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={() => alert('Thanks for marking this review as helpful!')}
                      style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      👍 Helpful ({rev.helpfulCount})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PHOTOS */}
        {activeTab === 'photos' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
              {restaurant.images.map((imgUrl, i) => (
                <div
                  key={i}
                  style={{
                    height: '240px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <img
                    src={imgUrl}
                    alt={`${restaurant.name} gallery ${i}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.04)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: INFO */}
        {activeTab === 'info' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }} className="info-tab-flex">
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
                      <span style={{ color: 'rgba(255,255,255,0.6)' }}>{hrs.open} - {hrs.close}</span>
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
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)', margin: '0 0 0.5rem 0' }}>
                🏢 {restaurant.address}
              </p>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                📞 +971 4 345 6789 (Mock Phone)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Order Bar */}
      {totalItems > 0 && (
        <div className="sticky-order-bar">
          <div className="sticky-order-info">
            <span>🛒 {totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>|</span>
            <span style={{ color: 'var(--color-habesha-green)', fontWeight: 700 }}>AED {subtotal}</span>
            {restaurantName && restaurantName !== restaurant.name && (
              <span className="sticky-order-restaurant">from {restaurantName}</span>
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
            View Cart &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
