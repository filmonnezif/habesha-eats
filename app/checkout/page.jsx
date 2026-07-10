'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/CartContext';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, restaurantId, restaurantName, deliveryFee, subtotal, clearCart } = useCart();

  // Redirect to discover if cart is empty
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Address states
  const [address, setAddress] = useState('');
  const [addressSaved, setAddressSaved] = useState('Home');
  const [phone, setPhone] = useState('');

  // Delivery time states
  const [deliveryTime, setDeliveryTime] = useState('asap');
  const [deliveryDate, setDeliveryDate] = useState('today');

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');

  // Instructions
  const [instructions, setInstructions] = useState('');

  // Promo code
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');

  const serviceFee = Math.round(subtotal * 0.03);
  
  let discount = 0;
  if (appliedPromo === 'HABESHA10') {
    discount = Math.round(subtotal * 0.1); // 10% off
  }

  const total = Math.max(0, subtotal + deliveryFee + serviceFee - discount);

  const applyPromo = () => {
    setPromoError('');
    if (promoCode.toUpperCase() === 'HABESHA10') {
      setAppliedPromo('HABESHA10');
      setPromoCode('');
    } else {
      setPromoError('Invalid promo code. Try HABESHA10');
    }
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (items.length === 0) return;
    
    setIsPlacingOrder(true);

    // Simulate order placement API call
    setTimeout(() => {
      setIsPlacingOrder(false);
      const mockOrderId = 'HE-' + Math.floor(100000 + Math.random() * 900000);
      
      // Clear cart
      clearCart();
      
      // Navigate to order confirmation
      router.push(`/order/${mockOrderId}`);
    }, 1500);
  };

  if (items.length === 0 && !isPlacingOrder) {
    return (
      <div className="coming-soon-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#16191c', color: '#fff', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '1rem' }}>Your Cart is Empty</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>You cannot checkout without items in your cart.</p>
        <Link href="/discover" className="shiny-btn-mini">Go to Discover</Link>
      </div>
    );
  }

  return (
    <div className="discover-page" style={{ background: '#16191c', color: '#fff', minHeight: '100vh', paddingBottom: '6rem' }}>
      {/* Mini Simple Header */}
      <header className="app-navbar" style={{ height: '70px', justifyContent: 'space-between', padding: '0 2rem' }}>
        <Link href={`/restaurant/${restaurantId || 'discover'}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '0.9375rem' }}>
          &larr; Back to menu
        </Link>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
          SECURE <span className="highlight-gradient">CHECKOUT</span> 🔒
        </div>
        <div style={{ width: '80px' }} /> {/* Spacer */}
      </header>

      {/* Main Form Area */}
      <main className="checkout-main-grid">
        {/* Left Columns - Form details */}
        <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Section 1: Address */}
          <fieldset style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '20px', padding: '1.75rem', margin: 0 }}>
            <legend style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-habesha-gold)', padding: '0 0.5rem', textTransform: 'uppercase' }}>
              1. Delivery Details
            </legend>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', marginBottom: '1.25rem' }}>
              {['Home', 'Office', 'Other'].map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setAddressSaved(loc)}
                  style={{
                    flex: 1,
                    padding: '0.6rem',
                    background: addressSaved === loc ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${addressSaved === loc ? 'var(--color-habesha-green)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '10px',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {loc === 'Home' ? '🏠 Home' : loc === 'Office' ? '🏢 Office' : '📍 Other'}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem' }}>Street Address (Flat/Villa, Building, Area)</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="E.g. Apartment 302, Marina Heights, Dubai Marina"
                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem' }}>Contact Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="E.g. +971 50 123 4567"
                  style={{ width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', outline: 'none' }}
                />
              </div>
            </div>
          </fieldset>

          {/* Section 2: Delivery Schedule */}
          <fieldset style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '20px', padding: '1.75rem', margin: 0 }}>
            <legend style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-habesha-gold)', padding: '0 0.5rem', textTransform: 'uppercase' }}>
              2. Delivery Timing
            </legend>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <label
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: deliveryTime === 'asap' ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                  border: `1px solid ${deliveryTime === 'asap' ? 'var(--color-habesha-green)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="deliveryTime"
                  checked={deliveryTime === 'asap'}
                  onChange={() => setDeliveryTime('asap')}
                  style={{ accentColor: 'var(--color-habesha-green)' }}
                />
                <div>
                  <span style={{ display: 'block', fontWeight: 700, fontSize: '0.9375rem' }}>🚀 ASAP Delivery</span>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Arrives in {deliveryTime === 'asap' ? '30-45' : ''} mins</span>
                </div>
              </label>

              <label
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: deliveryTime === 'later' ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                  border: `1px solid ${deliveryTime === 'later' ? 'var(--color-habesha-green)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="deliveryTime"
                  checked={deliveryTime === 'later'}
                  onChange={() => setDeliveryTime('later')}
                  style={{ accentColor: 'var(--color-habesha-green)' }}
                />
                <div>
                  <span style={{ display: 'block', fontWeight: 700, fontSize: '0.9375rem' }}>📅 Schedule Later</span>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Pick your preferred slot</span>
                </div>
              </label>
            </div>

            {deliveryTime === 'later' && (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem' }}>
                <select
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  style={{ flex: 1, padding: '0.75rem', background: '#22272c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }}
                >
                  <option value="today">Today</option>
                  <option value="tomorrow">Tomorrow</option>
                </select>
                <select
                  style={{ flex: 1, padding: '0.75rem', background: '#22272c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }}
                >
                  <option>12:00 PM - 1:00 PM</option>
                  <option>1:00 PM - 2:00 PM</option>
                  <option>6:00 PM - 7:00 PM</option>
                  <option>7:00 PM - 8:00 PM</option>
                  <option>8:00 PM - 9:00 PM</option>
                </select>
              </div>
            )}
          </fieldset>

          {/* Section 3: Payment Method */}
          <fieldset style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '20px', padding: '1.75rem', margin: 0 }}>
            <legend style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-habesha-gold)', padding: '0 0.5rem', textTransform: 'uppercase' }}>
              3. Payment Method
            </legend>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', marginBottom: '1.5rem' }}>
              <label
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: paymentMethod === 'card' ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                  border: `1px solid ${paymentMethod === 'card' ? 'var(--color-habesha-green)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  style={{ accentColor: 'var(--color-habesha-green)' }}
                />
                <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>💳 Credit / Debit Card</span>
              </label>

              <label
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: paymentMethod === 'cod' ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                  border: `1px solid ${paymentMethod === 'cod' ? 'var(--color-habesha-green)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  style={{ accentColor: 'var(--color-habesha-green)' }}
                />
                <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>💵 Cash on Delivery</span>
              </label>
            </div>

            {paymentMethod === 'card' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem' }}>Name on Card</label>
                  <input
                    type="text"
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="E.g. Hanna Mamo"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(22, 25, 28, 0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem' }}>Card Number</label>
                  <input
                    type="text"
                    required
                    maxLength="19"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                    placeholder="•••• •••• •••• ••••"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(22, 25, 28, 0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', outline: 'none', letterSpacing: '0.1em' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem' }}>Expiry Date</label>
                    <input
                      type="text"
                      required
                      maxLength="5"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(22, 25, 28, 0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', outline: 'none', textAlign: 'center' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem' }}>CVV</label>
                    <input
                      type="password"
                      required
                      maxLength="3"
                      placeholder="•••"
                      value={cardCVV}
                      onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, ''))}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(22, 25, 28, 0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', outline: 'none', textAlign: 'center' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </fieldset>

          {/* Section 4: Instructions */}
          <fieldset style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '20px', padding: '1.75rem', margin: 0 }}>
            <legend style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-habesha-gold)', padding: '0 0.5rem', textTransform: 'uppercase' }}>
              4. Delivery Instructions
            </legend>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="E.g. Please leave bag at the door, call when arriving, ring building bell..."
              style={{ width: '100%', height: '80px', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#fff', resize: 'none', outline: 'none', marginTop: '0.5rem' }}
            />
          </fieldset>
        </form>

        {/* Right Column - Cart Summary */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: 'fit-content', position: 'sticky', top: '100px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '24px', padding: '1.75rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem' }}>
              Order Summary
            </h3>
            
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-habesha-gold)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🏪</span> {restaurantName}
            </p>

            {/* Item list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '200px', overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '0.5rem' }}>
              {items.map((item) => (
                <div key={item.cartId} style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <div style={{ flex: 1, paddingRight: '1rem' }}>
                    <span style={{ fontWeight: 700 }}>{item.quantity}x</span> {item.name}
                    {item.selectedOptions && (
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.15rem' }}>
                        {Object.values(item.selectedOptions).map((val) => {
                          if (Array.isArray(val)) return val.map((v) => v.name).join(', ');
                          return val?.name || '';
                        }).filter(Boolean).join(' · ')}
                      </span>
                    )}
                  </div>
                  <span style={{ fontWeight: 700 }}>
                    AED {item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Promo code field */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <input
                type="text"
                placeholder="Promo Code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                disabled={!!appliedPromo}
                style={{ flex: 1, padding: '0.5rem 0.75rem', background: 'rgba(22, 25, 28, 0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', fontSize: '0.8125rem', outline: 'none' }}
              />
              <button
                type="button"
                onClick={applyPromo}
                disabled={!!appliedPromo}
                className="shiny-btn-mini"
                style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem', borderRadius: '8px' }}
              >
                Apply
              </button>
            </div>
            {appliedPromo && (
              <p style={{ fontSize: '0.75rem', color: 'var(--color-habesha-green)', marginTop: '-1rem', marginBottom: '1rem', fontWeight: 600 }}>
                ✓ Code HABESHA10 applied successfully!
              </p>
            )}
            {promoError && (
              <p style={{ fontSize: '0.75rem', color: 'var(--color-habesha-red)', marginTop: '-1rem', marginBottom: '1rem', fontWeight: 600 }}>
                {promoError}
              </p>
            )}

            {/* Pricing Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.6)' }}>
                <span>Subtotal</span><span>AED {subtotal}</span>
              </div>
              {appliedPromo && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-habesha-green)' }}>
                  <span>Discount (10%)</span><span>- AED {discount}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.6)' }}>
                <span>Delivery Fee</span><span>{deliveryFee === 0 ? 'Free' : `AED ${deliveryFee}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.6)' }}>
                <span>Service Fee (3%)</span><span>AED {serviceFee}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 800, color: '#fff', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem', marginTop: '0.25rem' }}>
                <span>Total</span><span>AED {total}</span>
              </div>
            </div>

            {/* Place Order CTA Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
              className="shiny-btn"
              style={{ width: '100%', justifyContent: 'center', padding: '0.9rem', fontSize: '1rem' }}
            >
              {isPlacingOrder ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg className="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="16" height="16">
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)" />
                    <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing Order...
                </span>
              ) : (
                `Place Order — AED ${total}`
              )}
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}
