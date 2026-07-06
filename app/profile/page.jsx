'use client';

import { useState } from 'react';
import AppNavbar from '@/components/AppNavbar';
import CartDrawer from '@/components/CartDrawer';
import RestaurantCard from '@/components/RestaurantCard';
import { useCart } from '@/lib/CartContext';
import { restaurants, getRestaurantById } from '@/lib/data';
import Link from 'next/link';

export default function ProfilePage() {
  const { addItem, setIsCartOpen } = useCart();
  const [activeTab, setActiveTab] = useState('orders');

  // Hardcoded profile details
  const user = {
    name: 'Hanna Mamo',
    email: 'hanna.mamo@gmail.com',
    avatar: 'H',
    since: 'September 2025',
    ordersCount: 14,
  };

  // Mock order history
  const [orderHistory, setOrderHistory] = useState([
    {
      id: 'HE-829410',
      date: '2026-06-10',
      restaurantId: 'al-habasha',
      restaurantName: 'Al Habasha Restaurant',
      items: [
        { id: 'ah-1', name: 'Doro Wot', price: 55, quantity: 2, selectedOptions: { 'Spice Level': { name: 'Extra Spicy', price: 0 } } },
        { id: 'ah-11', name: 'Traditional Coffee Ceremony', price: 25, quantity: 1, selectedOptions: {} },
      ],
      subtotal: 135,
      total: 154, // inc delivery and service fees
      status: 'delivered',
    },
    {
      id: 'HE-391402',
      date: '2026-05-28',
      restaurantId: 'zagol',
      restaurantName: 'Zagol Ethiopian Restaurant',
      items: [
        { id: 'zg-1', name: 'Beyaynetu Special', price: 48, quantity: 1, selectedOptions: {} },
        { id: 'zg-4', name: 'Lamb Tibs', price: 58, quantity: 1, selectedOptions: {} },
      ],
      subtotal: 106,
      total: 122,
      status: 'delivered',
    },
  ]);

  // Saved / Favorited restaurants ( Zagol and Al Habasha )
  const savedRestaurants = restaurants.slice(0, 2);

  // Past reviews written by this user
  const userReviews = [
    {
      id: 'ur-1',
      restaurantName: 'Al Habasha Restaurant',
      rating: 5,
      text: 'Finally, a platform that understands what it means to crave the taste of home. The Doro Wot here is legendary!',
      date: '2026-06-10',
    },
    {
      id: 'ur-2',
      restaurantName: 'Kazoza Eritrean Restaurant',
      rating: 5,
      text: 'The coffee here is roasted with cardamom — absolutely divine.',
      date: '2026-06-07',
    },
  ];

  // Reorder click
  const handleReorder = (order) => {
    const restaurant = getRestaurantById(order.restaurantId);
    if (!restaurant) return;

    // Add each item in order to cart
    order.items.forEach((item) => {
      addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        selectedOptions: item.selectedOptions || {},
        specialInstructions: '',
      }, restaurant);
    });

    // Open Cart Drawer
    setIsCartOpen(true);
  };

  return (
    <div className="discover-page" style={{ background: '#16191c', color: '#fff', minHeight: '100vh', paddingBottom: '6rem' }}>
      <AppNavbar />
      <CartDrawer />

      {/* Main Profile Layout Container */}
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        
        {/* Profile Header */}
        <section
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '24px',
            padding: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            marginBottom: '3rem',
            position: 'relative',
            overflow: 'hidden',
          }}
          className="profile-header-flex"
        >
          {/* Decorative glows */}
          <div className="bg-glow bg-glow-green" style={{ top: '-50%', left: '-20%', opacity: 0.1, pointerEvents: 'none' }} />
          
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-habesha-green), var(--color-habesha-gold), var(--color-habesha-red))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 900,
              color: '#000',
              textShadow: 'none',
              boxShadow: '0 0 20px rgba(252, 217, 0, 0.3)',
            }}
          >
            {user.avatar}
          </div>

          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 900, textTransform: 'uppercase', margin: '0 0 0.25rem 0', letterSpacing: '-0.01em' }}>
              {user.name}
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', margin: '0 0 0.5rem 0' }}>
              ✉ {user.email}
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
              Member since {user.since} · {user.ordersCount} total orders
            </p>
          </div>

          <button
            onClick={() => alert('Profile editing is currently a simulated feature for this UI demonstration.')}
            className="shiny-btn-mini"
            style={{ padding: '0.5rem 1.25rem' }}
          >
            Edit Profile
          </button>
        </section>

        {/* Inner Tabs navigation */}
        <nav
          className="profile-tabs-nav"
          style={{
            display: 'flex',
            gap: '2.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: '0.5rem',
            marginBottom: '2rem',
          }}
        >
          {[
            { id: 'orders', label: 'Order History', emoji: '📋' },
            { id: 'saved', label: 'Saved Kitchens', emoji: '❤️' },
            { id: 'reviews', label: 'My Reviews', emoji: '★' },
            { id: 'settings', label: 'Settings', emoji: '⚙️' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === tab.id ? '#fff' : 'rgba(255, 255, 255, 0.5)',
                fontFamily: 'var(--font-display)',
                fontSize: '0.9375rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                position: 'relative',
                padding: '0 0.25rem 0.75rem 0.25rem',
                transition: 'color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: -1,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'var(--color-habesha-gold)',
                  }}
                />
              )}
            </button>
          ))}
        </nav>

        {/* Tab 1: Orders Tab */}
        {activeTab === 'orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {orderHistory.map((order) => (
              <div
                key={order.id}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '20px',
                  padding: '1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '1.5rem',
                }}
                className="profile-order-card"
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>
                      {order.date}
                    </span>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-habesha-green)', background: 'rgba(52,199,89,0.12)', padding: '0.15rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase' }}>
                      ✓ {order.status}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    {order.restaurantName}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>
                    {order.items.map((item, idx) => (
                      <span key={idx}>
                        {item.quantity}x {item.name} {Object.keys(item.selectedOptions).length > 0 ? `(${Object.values(item.selectedOptions).map(v => v.name).join(', ')})` : ''}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', height: '100%', gap: '1rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Total Paid</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>AED {order.total}</span>
                  </div>
                  <button
                    onClick={() => handleReorder(order)}
                    className="shiny-btn-mini"
                    style={{ padding: '0.5rem 1.25rem' }}
                  >
                    🔄 Reorder
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Saved Kitchens Tab */}
        {activeTab === 'saved' && (
          <div className="discover-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))' }}>
            {savedRestaurants.map((rest) => (
              <RestaurantCard key={rest.id} restaurant={rest} />
            ))}
          </div>
        )}

        {/* Tab 3: Reviews Tab */}
        {activeTab === 'reviews' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {userReviews.map((rev) => (
              <div
                key={rev.id}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
                    {rev.restaurantName}
                  </h3>
                  <div style={{ display: 'flex', color: 'var(--color-habesha-gold)', gap: '0.1rem' }}>
                    {Array.from({ length: rev.rating }).map((_, idx) => (
                      <span key={idx}>★</span>
                    ))}
                  </div>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, margin: '0 0 0.5rem 0' }}>
                  &ldquo;{rev.text}&rdquo;
                </p>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                  Reviewed on {rev.date}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Settings Tab */}
        {activeTab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Address Setting */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem' }}>
                📍 Saved Addresses
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: '0 0 0.15rem 0' }}>Home</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Apartment 402, Marina Heights, Dubai Marina, Dubai</p>
                </div>
                <button onClick={() => alert('Address editing is currently a simulated feature for this UI demonstration.')} style={{ background: 'none', border: 'none', color: 'var(--color-habesha-gold)', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>Edit</button>
              </div>
            </div>

            {/* General Preferences */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem' }}>
                ⚙️ App Settings
              </h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', marginBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: '0 0 0.15rem 0' }}>Notifications</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Receive order status updates via WhatsApp and push notifications</p>
                </div>
                <input type="checkbox" defaultChecked style={{ accentColor: 'var(--color-habesha-green)', cursor: 'pointer' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: '0 0 0.15rem 0' }}>App Language</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Choose your preferred interface language</p>
                </div>
                <select style={{ padding: '0.4rem 0.75rem', background: '#22272c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}>
                  <option value="en">English (EN)</option>
                  <option value="am">አማርኛ (AM)</option>
                  <option value="ti">ትግርኛ (TI)</option>
                </select>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
