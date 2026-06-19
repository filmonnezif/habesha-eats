'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';

export default function OrderConfirmationPage({ params }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const [step, setStep] = useState(1);

  // Automatically advance steps for demonstration effect
  useEffect(() => {
    const timer1 = setTimeout(() => setStep(2), 5000); // 5s to preparing
    const timer2 = setTimeout(() => setStep(3), 12000); // 12s to on the way
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="coming-soon-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#16191c', color: '#fff', padding: '2rem 1.5rem', textAlign: 'center' }}>
      
      {/* Decorative glows */}
      <div className="bg-glow bg-glow-green" style={{ top: '20%', left: '30%', opacity: 0.15 }} />
      <div className="bg-glow bg-glow-red" style={{ bottom: '20%', right: '30%', opacity: 0.1 }} />

      {/* Success Badge */}
      <div
        style={{
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          background: 'rgba(52, 199, 89, 0.1)',
          border: '3px solid var(--color-habesha-green)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
          color: 'var(--color-habesha-green)',
          marginBottom: '1.5rem',
          animation: 'pulse-glow 2s infinite',
        }}
      >
        ✓
      </div>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
        Order <span className="highlight-gradient">Confirmed!</span>
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', maxWidth: '420px', margin: '0 auto 2.5rem' }}>
        Your feast is being prepared. Get ready to experience the rich aromas and authentic spices of Habesha cooking.
      </p>

      {/* Details Box */}
      <div
        style={{
          width: '100%',
          maxWidth: '540px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          padding: '2rem',
          textAlign: 'left',
          marginBottom: '2.5rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1rem' }}>
          <div>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 700 }}>Order Reference</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-habesha-gold)' }}>{orderId}</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 700 }}>Estimated Delivery</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-habesha-green)' }}>30 - 40 Mins</span>
          </div>
        </div>

        {/* Live Stepper */}
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1.25rem', color: 'rgba(255,255,255,0.8)' }}>
          Order Tracker
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
          {/* Vertical connecting line */}
          <div
            style={{
              position: 'absolute',
              left: '11px',
              top: '12px',
              bottom: '12px',
              width: '2px',
              background: 'rgba(255, 255, 255, 0.08)',
              zIndex: 1,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '11px',
              top: '12px',
              height: step === 1 ? '0%' : step === 2 ? '50%' : '100%',
              width: '2px',
              background: 'var(--color-habesha-green)',
              transition: 'height 1s ease-in-out',
              zIndex: 2,
            }}
          />

          {[
            { id: 1, title: 'Order Placed', desc: 'We have received your order details and confirmed it with the kitchen.' },
            { id: 2, title: 'Preparing Food', desc: 'The chefs are slow-cooking your stews, baking fresh injera, and preparing spices.' },
            { id: 3, title: 'On the Way', desc: 'A dedicated delivery partner is carrying your warm food to your address.' },
            { id: 4, title: 'Delivered', desc: 'Enjoy your meal! Melkam megeb! (Bon appétit!)' },
          ].map((s) => {
            const isCompleted = step >= s.id;
            const isActive = step === s.id;

            return (
              <div key={s.id} style={{ display: 'flex', gap: '1.25rem', zIndex: 3 }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: isCompleted ? 'var(--color-habesha-green)' : '#22272c',
                    border: `2px solid ${isActive ? 'var(--color-habesha-gold)' : isCompleted ? 'var(--color-habesha-green)' : 'rgba(255,255,255,0.15)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                    color: isCompleted ? '#000' : 'rgba(255,255,255,0.4)',
                    transition: 'all 0.5s ease',
                  }}
                >
                  {isCompleted ? '✓' : s.id}
                </div>
                <div>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0, color: isActive ? 'var(--color-habesha-gold)' : isCompleted ? '#fff' : 'rgba(255,255,255,0.4)', transition: 'color 0.3s' }}>
                    {s.title}
                  </h4>
                  <p style={{ fontSize: '0.8125rem', color: isActive ? 'rgba(255,255,255,0.7)' : isCompleted ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.3)', margin: '0.25rem 0 0 0', transition: 'color 0.3s' }}>
                    {s.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link href="/discover" className="shiny-btn" style={{ padding: '0.75rem 2rem', fontSize: '0.9375rem' }}>
          Back to Discover
        </Link>
        <button
          onClick={() => alert(`Tracking updates for order ${orderId} are fully automated. Your delivery driver will call you shortly.`)}
          className="cta-secondary cta-button"
          style={{ padding: '0.75rem 2rem', fontSize: '0.9375rem', borderRadius: '100px' }}
        >
          Track Live (Mock)
        </button>
      </div>

      <style jsx global>{`
        @keyframes pulse-glow {
          0% { box-shadow: 0 0 0 0 rgba(52, 199, 89, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(52, 199, 89, 0); }
          100% { box-shadow: 0 0 0 0 rgba(52, 199, 89, 0); }
        }
      `}</style>
    </div>
  );
}
