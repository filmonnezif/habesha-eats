'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useLanguage } from '@/lib/LanguageContext';

/**
 * TextOverlay renders the foreground display elements:
 * - "EATS" centered below the Mesob, animated with letter-dispersal on scroll
 * - Slogan and desc in the bottom-left, animated with side-slide, blur, and fade on scroll
 * - Scroll indicator in the bottom-right, animated with exit slide on scroll
 */
export default function TextOverlay({ progress = 0 }) {
  const { t, language } = useLanguage();
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const descRef = useRef(null);
  const scrollRef = useRef(null);
  const msg1Ref = useRef(null);
  const msg2Ref = useRef(null);

  useEffect(() => {
    const p = Math.min(1, Math.max(0, progress / 0.25));

    // Animate bottom-left description sliding left, fading out, and blurring
    if (descRef.current) {
      gsap.set(descRef.current, {
        x: -150 * p,
        opacity: 1 - p,
        filter: `blur(${p * 8}px)`
      });
    }

    // Animate bottom-right scroll indicator sliding right/down and fading out
    if (scrollRef.current) {
      gsap.set(scrollRef.current, {
        x: 100 * p,
        y: 50 * p,
        opacity: 1 - p
      });
    }

    // Sequential animation helper for HUD messages
    const animateMsg = (ref, start, peakStart, peakEnd, end) => {
      if (!ref.current) return;

      let opacity = 0;
      let y = 40;
      let filterBlur = 8;
      let display = 'none';

      if (progress > start && progress < end) {
        display = 'flex';
        if (progress < peakStart) {
          // Fade in
          const ratio = (progress - start) / (peakStart - start);
          opacity = ratio;
          y = 40 - 40 * ratio;
          filterBlur = 8 - 8 * ratio;
        } else if (progress >= peakStart && progress <= peakEnd) {
          // Stable
          opacity = 1;
          y = 0;
          filterBlur = 0;
        } else {
          // Fade out
          const ratio = (progress - peakEnd) / (end - peakEnd);
          opacity = 1 - ratio;
          y = -40 * ratio;
          filterBlur = 8 * ratio;
        }
      }

      gsap.set(ref.current, {
        opacity: opacity,
        y: y,
        filter: `blur(${filterBlur}px)`,
        display: display
      });
    };

    // Animate the two messages sequentially across the scroll space
    animateMsg(msg1Ref, 0.28, 0.34, 0.46, 0.52);
    animateMsg(msg2Ref, 0.53, 0.59, 0.72, 0.78);
  }, [progress, t]);

  const eatsText = t('hero.eats');
  const isSymmetrical = language === 'am' || language === 'ti';

  return (
    <div ref={containerRef} className="hero-text-overlay hero-parallax-fg">
      {/* Centered Typography */}
      {!isSymmetrical && (
        <>
          <div className="hero-title-middle-spacer"></div>
          <h1 className="hero-title-bottom" ref={titleRef} style={{ opacity: 0 }}>
            {Array.from(eatsText).map((char, idx) => (
              <span
                key={idx}
                className="char-eats"
                style={{ display: 'inline-block', willChange: 'transform, opacity' }}
              >
                {char}
              </span>
            ))}
          </h1>
        </>
      )}

      {/* Sequential HUD Chips (rendered over hologram UAE map) */}
      <div
        ref={msg1Ref}
        className="hud-chip"
        style={{ display: 'none', position: 'absolute', willChange: 'transform, opacity, filter' }}
      >
        {t('hero.hudMsg1')}
      </div>

      <div
        ref={msg2Ref}
        className="hud-chip"
        style={{ display: 'none', position: 'absolute', willChange: 'transform, opacity, filter' }}
      >
        {t('hero.hudMsg2')}
      </div>

      {/* Bottom-Left Slogan and Description */}
      <div className="hero-bottom-left-content" ref={descRef} style={{ willChange: 'transform, opacity, filter' }}>
        <h2 className="hero-subhead" style={{ marginBottom: '0.5rem' }}>{t('hero.slogan')}</h2>
        <div className="hero-desc-container">
          <p className="hero-desc">
            {t('hero.desc')}
          </p>
        </div>
        <a href="/discover" className="shiny-btn">
          {t('navbar.exploreRestaurants')}
          <svg className="cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
      </div>

      {/* Bottom-Right Scroll Indicator */}
      <a
        href="#how-it-works"
        className="hero-scroll-indicator"
        ref={scrollRef}
        style={{ willChange: 'transform, opacity' }}
      >
        <span>{t('hero.scroll')}</span>
        <span className="scroll-arrow scroll-arrow-bounce">↓</span>
      </a>
    </div>
  );
}
