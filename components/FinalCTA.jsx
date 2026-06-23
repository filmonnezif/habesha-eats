'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import FloatingBeans from './FloatingBeans';
import { useLanguage } from '@/lib/LanguageContext';

/**
 * FinalCTA — Bold full-width call-to-action section before the footer.
 * Includes the main conversion CTA and a secondary partner CTA.
 */
export default function FinalCTA() {
  const { t } = useLanguage();
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || visible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  useEffect(() => {
    if (!visible) return;

    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

    tl.fromTo(
      '.final-cta-title',
      { opacity: 0, y: 40, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 1 },
      0
    );

    tl.fromTo(
      '.final-cta-subtitle',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 },
      0.2
    );

    tl.fromTo(
      '.final-cta-btn',
      { opacity: 0, y: 20, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8 },
      0.35
    );

    tl.fromTo(
      '.partner-cta',
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.7 },
      0.5
    );

    return () => tl.kill();
  }, [visible]);

  return (
    <section ref={sectionRef} className="final-cta-section" id="final-cta">
      <FloatingBeans />
      {/* Decorative gradient orbs */}
      <div className="final-cta-glow final-cta-glow-1" aria-hidden="true" />
      <div className="final-cta-glow final-cta-glow-2" aria-hidden="true" />

      <div className="final-cta-inner">
        <h2 className="final-cta-title" style={{ opacity: 0 }}>
          {t('finalCta.title')}
        </h2>

        <p className="final-cta-subtitle" style={{ opacity: 0 }}>
          {t('finalCta.subtitle')}
        </p>

        <a href="/discover" className="shiny-btn final-cta-btn" style={{ opacity: 0 }}>
          {t('navbar.exploreRestaurants')}
          <svg className="cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>

        <div className="partner-cta" style={{ opacity: 0 }}>
          <p className="partner-cta-text">
            {t('finalCta.partnerText')}{' '}
            <a href="#contact" className="partner-cta-link">{t('finalCta.partnerLink')}</a>
          </p>
        </div>
      </div>
    </section>
  );
}
