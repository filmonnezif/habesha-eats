'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import ScrollController from './ScrollController';
import HeroCanvas from './HeroCanvas';
import TextOverlay from './TextOverlay';
import { useLanguage } from '@/lib/LanguageContext';

/**
 * HeroSection is the main wrapper that composes the scroll controller,
 * canvas renderer, and text overlays into the full hero experience.
 *
 * Drives the background word "HABESHA" with a staggered letter dispersal
 * animation using GSAP linked directly to the scrollProgress state.
 *
 * Includes mouse-position parallax and an entrance animation on load.
 */
export default function HeroSection() {
  const { t, language } = useLanguage();
  const [currentFrame, setCurrentFrame] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const viewportRef = useRef(null);
  const parallaxRef = useRef({ x: 0, y: 0 });

  const handleFrameChange = useCallback((frameIndex) => {
    setCurrentFrame(frameIndex);
  }, []);

  const handleProgressChange = useCallback((progress) => {
    setScrollProgress(progress);
  }, []);

  // Entrance animation on mount (or layout change)
  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.3 });

    tl.fromTo(
      '.hero-title-top, .hero-title-symmetrical-left',
      { opacity: 0, y: -40, scale: 0.92, filter: 'blur(10px)' },
      { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 1.2, ease: 'expo.out' },
      0
    );

    tl.fromTo(
      '.hero-title-bottom, .hero-title-symmetrical-right',
      { opacity: 0, y: 40, scale: 0.92, filter: 'blur(10px)' },
      { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 1.2, ease: 'expo.out' },
      0.15
    );

    tl.fromTo(
      '.hero-bottom-left-content',
      { opacity: 0, x: -30, filter: 'blur(6px)' },
      { opacity: 1, x: 0, filter: 'blur(0px)', duration: 1, ease: 'expo.out' },
      0.5
    );

    tl.fromTo(
      '.hero-scroll-indicator',
      { opacity: 0, x: 30 },
      { opacity: 1, x: 0, duration: 1, ease: 'expo.out' },
      0.6
    );

    return () => tl.kill();
  }, [language]);

  // Mouse parallax
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;

      // Normalize to [-1, 1] range
      const nx = (clientX / innerWidth - 0.5) * 2;
      const ny = (clientY / innerHeight - 0.5) * 2;

      parallaxRef.current = { x: nx, y: ny };

      // Move layers in opposite direction of cursor
      gsap.to('.hero-parallax-bg', {
        x: -nx * 8,
        y: -ny * 6,
        duration: 1,
        ease: 'power2.out',
      });

      gsap.to('.hero-parallax-fg', {
        x: -nx * 15,
        y: -ny * 10,
        duration: 1,
        ease: 'power2.out',
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Unified letter dispersal on scroll
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const charsHabesha = viewport.querySelectorAll('.char-habesha');
    const charsEats = viewport.querySelectorAll('.char-eats');
    
    // Map progress to [0, 1] range within the first 25% scroll distance
    const p = Math.min(1, Math.max(0, scrollProgress / 0.25));
    const isSymmetrical = language === 'am' || language === 'ti';

    if (isSymmetrical) {
      // Symmetrical layout dispersal
      // Habesha (Left word) -> disperse horizontally to the left
      charsHabesha.forEach((char, idx) => {
        const centerDist = idx - (charsHabesha.length - 1) / 2;
        const xTranslate = (centerDist * 50 - 150) * p; // Shifting left and dispersing
        const yTranslate = -100 * p - Math.abs(centerDist) * 20 * p;
        const rotate = (centerDist * 12 - 15) * p;
        const scale = 1 - p * 0.35;
        const opacity = 1 - p;

        gsap.set(char, {
          x: xTranslate,
          y: yTranslate,
          rotation: rotate,
          scale: scale,
          opacity: opacity,
          transformOrigin: 'center center'
        });
      });

      // Eats (Right word) -> disperse horizontally to the right
      charsEats.forEach((char, idx) => {
        const centerDist = idx - (charsEats.length - 1) / 2;
        const xTranslate = (centerDist * 50 + 150) * p; // Shifting right and dispersing
        const yTranslate = 100 * p + Math.abs(centerDist) * 20 * p;
        const rotate = (centerDist * 12 + 15) * p;
        const scale = 1 - p * 0.35;
        const opacity = 1 - p;

        gsap.set(char, {
          x: xTranslate,
          y: yTranslate,
          rotation: rotate,
          scale: scale,
          opacity: opacity,
          transformOrigin: 'center center'
        });
      });
    } else {
      // Standard stacked layout dispersal
      // HABESHA (Top word)
      charsHabesha.forEach((char, idx) => {
        const centerDist = idx - (charsHabesha.length - 1) / 2;
        const xTranslate = centerDist * 90 * p;
        const yTranslate = -140 * p - Math.abs(centerDist) * 30 * p;
        const rotate = centerDist * 18 * p;
        const scale = 1 - p * 0.35;
        const opacity = 1 - p;

        gsap.set(char, {
          x: xTranslate,
          y: yTranslate,
          rotation: rotate,
          scale: scale,
          opacity: opacity,
          transformOrigin: 'center center'
        });
      });

      // EATS (Bottom word)
      charsEats.forEach((char, idx) => {
        const centerDist = idx - (charsEats.length - 1) / 2;
        const xTranslate = centerDist * 90 * p;
        const yTranslate = 140 * p + Math.abs(centerDist) * 30 * p;
        const rotate = -centerDist * 18 * p;
        const scale = 1 - p * 0.35;
        const opacity = 1 - p;

        gsap.set(char, {
          x: xTranslate,
          y: yTranslate,
          rotation: rotate,
          scale: scale,
          opacity: opacity,
          transformOrigin: 'center center'
        });
      });
    }
  }, [scrollProgress, language]);

  // Viewport fade-out at end of hero
  useEffect(() => {
    const viewport = document.querySelector('.hero-viewport');
    if (!viewport) return;

    if (scrollProgress >= 0.8) {
      // Map progress [0.8, 1.0] to opacity [1, 0]
      const opacity = 1 - (scrollProgress - 0.8) / 0.2;
      gsap.set(viewport, { opacity: Math.max(0, opacity) });
    } else {
      gsap.set(viewport, { opacity: 1 });
    }
  }, [scrollProgress]);

  const habeshaText = t('hero.habesha');
  const eatsText = t('hero.eats');
  const isSymmetrical = language === 'am' || language === 'ti';

  return (
    <section className="hero-section" id="hero">
      <ScrollController
        onFrameChange={handleFrameChange}
        onProgressChange={handleProgressChange}
      >
        <div className="hero-viewport" ref={viewportRef}>
          {/* Background Text Layer (behind canvas) — parallax bg layer */}
          <div className="hero-background-text-container hero-parallax-bg">
            {isSymmetrical ? (
              <div className="hero-symmetrical-row">
                <h1 className="hero-title-symmetrical-left" style={{ opacity: 0 }}>
                  {Array.from(habeshaText).map((char, idx) => (
                    <span
                      key={idx}
                      className="char-habesha"
                      style={{ display: 'inline-block', willChange: 'transform, opacity' }}
                    >
                      {char}
                    </span>
                  ))}
                </h1>
                <div className="hero-symmetrical-spacer" />
                <h1 className="hero-title-symmetrical-right" style={{ opacity: 0 }}>
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
              </div>
            ) : (
              <h1 className="hero-title-top" style={{ opacity: 0 }}>
                {Array.from(habeshaText).map((char, idx) => (
                  <span
                    key={idx}
                    className="char-habesha"
                    style={{ display: 'inline-block', willChange: 'transform, opacity' }}
                  >
                    {char}
                  </span>
                ))}
              </h1>
            )}
          </div>

          <HeroCanvas currentFrameIndex={currentFrame} />

          {/* Foreground Text Layer (in front of canvas) — parallax fg layer */}
          <TextOverlay progress={scrollProgress} />
        </div>
      </ScrollController>
    </section>
  );
}
