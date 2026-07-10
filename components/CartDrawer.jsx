'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Link from 'next/link';
import { useCart } from '@/lib/CartContext';
import { useLanguage } from '@/lib/LanguageContext';

/**
 * CartDrawer — Right slide-over panel showing cart items.
 */
export default function CartDrawer() {
  const { t, language } = useLanguage();
  const {
    items, restaurantId, restaurantName, deliveryFee,
    isCartOpen, setIsCartOpen,
    removeItem, updateQuantity, clearCart,
    subtotal,
  } = useCart();

  const drawerRef = useRef(null);
  const backdropRef = useRef(null);

  const serviceFee = Math.round(subtotal * 0.03);
  const total = subtotal + deliveryFee + serviceFee;

  useEffect(() => {
    if (!drawerRef.current || !backdropRef.current) return;
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
      gsap.to(backdropRef.current, { opacity: 1, pointerEvents: 'auto', duration: 0.3 });
      gsap.to(drawerRef.current, { x: 0, duration: 0.5, ease: 'power3.out' });
    } else {
      document.body.style.overflow = '';
      gsap.to(backdropRef.current, { opacity: 0, pointerEvents: 'none', duration: 0.3 });
      gsap.to(drawerRef.current, { x: '100%', duration: 0.4, ease: 'power3.in' });
    }
  }, [isCartOpen]);

  // Focus trap when cart is open
  useEffect(() => {
    if (!isCartOpen || !drawerRef.current) return;
    
    const focusableElements = drawerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex="0"]'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (firstElement) {
      // Small timeout to wait for slide transition
      setTimeout(() => firstElement.focus(), 100);
    }

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen]);

  const getItemTotal = (item) => {
    let price = item.price;
    if (item.selectedOptions) {
      Object.values(item.selectedOptions).forEach((opts) => {
        if (Array.isArray(opts)) {
          opts.forEach((o) => { price += o.price || 0; });
        } else if (opts?.price) {
          price += opts.price;
        }
      });
    }
    return price * item.quantity;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="cart-backdrop"
        onClick={() => setIsCartOpen(false)}
        style={{ opacity: 0, pointerEvents: 'none' }}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        ref={drawerRef}
        className="cart-drawer"
        style={{ transform: 'translateX(100%)' }}
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="cart-drawer-header">
          <h2 className="cart-drawer-title">{t('cart.title')}</h2>
          <button className="cart-drawer-close" onClick={() => setIsCartOpen(false)} aria-label="Close cart">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🧺</div>
            <p className="cart-empty-title">{t('cart.empty')}</p>
            <p className="cart-empty-subtitle">
              {language === 'am'
                ? 'ለመጀመር ከሬስቶራንት ምግብ ይጨምሩ'
                : language === 'ti'
                ? 'ንምጅማር ካብ ቤት-መግቢ መግቢ ወስኹ'
                : language === 'om'
                ? 'Nyaata galchuun jalqabaa'
                : 'Add items from a restaurant to get started'}
            </p>
            <Link href="/discover" className="shiny-btn-mini" onClick={() => setIsCartOpen(false)}>
              {t('navbar.exploreRestaurants')}
            </Link>
          </div>
        ) : (
          <>
            {/* Restaurant */}
            <div className="cart-restaurant-badge">
              <span className="cart-restaurant-icon">🏪</span>
              <span>{restaurantName}</span>
            </div>

            {/* Items */}
            <div className="cart-items-list">
              {items.map((item) => (
                <div key={item.cartId} className="cart-item">
                  <div className="cart-item-info">
                    <p className="cart-item-name">{item.name}</p>
                    {item.selectedOptions && (
                      <p className="cart-item-options">
                        {Object.entries(item.selectedOptions).map(([group, val]) => {
                          if (Array.isArray(val)) return val.map((v) => v.name).join(', ');
                          return val?.name || '';
                        }).filter(Boolean).join(' · ')}
                      </p>
                    )}
                    {item.specialInstructions && (
                      <p className="cart-item-instructions">📝 {item.specialInstructions}</p>
                    )}
                  </div>
                  <div className="cart-item-right">
                    <button className="cart-item-remove" onClick={() => removeItem(item.cartId)} aria-label="Remove item">×</button>
                    <div className="cart-qty-control">
                      <button onClick={() => updateQuantity(item.cartId, item.quantity - 1)} className="cart-qty-btn" aria-label="Decrease">−</button>
                      <span className="cart-qty-value">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.cartId, item.quantity + 1)} className="cart-qty-btn" aria-label="Increase">+</button>
                    </div>
                    <span className="cart-item-price">AED {getItemTotal(item)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Add more */}
            {restaurantId && (
              <Link
                href={`/restaurant/${restaurantId}`}
                className="cart-add-more"
                onClick={() => setIsCartOpen(false)}
              >
                {language === 'am'
                  ? '+ ተጨማሪ ምግቦችን ይጨምሩ'
                  : language === 'ti'
                  ? '+ ተወሳኺ መግቢ ወስኹ'
                  : language === 'om'
                  ? '+ Nyaata Dabalataa'
                  : '+ Add more items'}
              </Link>
            )}

            {/* Totals */}
            <div className="cart-totals">
              <div className="cart-total-row">
                <span>{t('cart.subtotal')}</span><span>AED {subtotal}</span>
              </div>
              <div className="cart-total-row">
                <span>
                  {language === 'am'
                    ? 'የማድረሻ ዋጋ'
                    : language === 'ti'
                    ? 'ናይ ምብጻሕ ዋጋ'
                    : language === 'om'
                    ? 'Kaffaltii Dhiheessii'
                    : 'Delivery Fee'}
                </span>
                <span>
                  {deliveryFee === 0
                    ? (language === 'am' ? 'ነጻ' : language === 'ti' ? 'ነጻ' : language === 'om' ? 'Bilisa' : 'Free')
                    : `AED ${deliveryFee}`}
                </span>
              </div>
              <div className="cart-total-row">
                <span>
                  {language === 'am'
                    ? 'የአገልግሎት ክፍያ'
                    : language === 'ti'
                    ? 'ናይ ኣገልግሎት ክፍሊት'
                    : language === 'om'
                    ? 'Kaffaltii Tajaajilaa'
                    : 'Service Fee'}
                </span>
                <span>AED {serviceFee}</span>
              </div>
              <div className="cart-total-row cart-total-final">
                <span>
                  {language === 'am'
                    ? 'ድምር'
                    : language === 'ti'
                    ? 'ጠቕላላ'
                    : language === 'om'
                    ? 'Ida\'ama'
                    : 'Total'}
                </span>
                <span>AED {total}</span>
              </div>
            </div>

            {/* CTA */}
            <div className="cart-checkout-cta">
              <Link
                href="/checkout"
                className="shiny-btn cart-checkout-btn"
                onClick={() => setIsCartOpen(false)}
              >
                {t('cart.checkout')}
                <svg className="cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
