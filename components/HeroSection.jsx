'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import ScrollController from './ScrollController';
import HeroCanvas from './HeroCanvas';
import TextOverlay from './TextOverlay';

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
  const [currentFrame, setCurrentFrame] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const bgTitleRef = useRef(null);
  const viewportRef = useRef(null);
  const parallaxRef = useRef({ x: 0, y: 0 });

  const handleFrameChange = useCallback((frameIndex) => {
    setCurrentFrame(frameIndex);
  }, []);

  const handleProgressChange = useCallback((progress) => {
    setScrollProgress(progress);
  }, []);

  // Entrance animation on mount
  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.3 });

    tl.fromTo(
      '.hero-title-top',
      { opacity: 0, y: -40, scale: 0.92, filter: 'blur(10px)' },
      { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 1.2, ease: 'expo.out' },
      0
    );

    tl.fromTo(
      '.hero-title-bottom',
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
  }, []);

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

  // HABESHA letter dispersal on scroll
  useEffect(() => {
    if (!bgTitleRef.current) return;
    const chars = bgTitleRef.current.querySelectorAll('.char-habesha');
    
    // Map progress to [0, 1] range within the first 25% scroll distance
    const p = Math.min(1, Math.max(0, scrollProgress / 0.25));

    chars.forEach((char, idx) => {
      const centerDist = idx - (chars.length - 1) / 2;
      
      // Calculate kinetic trajectories
      const xTranslate = centerDist * 90 * p; // Disperse outward horizontally
      const yTranslate = -140 * p - Math.abs(centerDist) * 30 * p; // Explode upward
      const rotate = centerDist * 18 * p; // Twist outward
      const scale = 1 - p * 0.35; // Shrink as they fly out
      const opacity = 1 - p; // Fade out

      gsap.set(char, {
        x: xTranslate,
        y: yTranslate,
        rotation: rotate,
        scale: scale,
        opacity: opacity,
        transformOrigin: 'center center'
      });
    });
  }, [scrollProgress]);

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

  const habeshaText = "HABESHA";

  return (
    <section className="hero-section" id="hero">
      <ScrollController
        onFrameChange={handleFrameChange}
        onProgressChange={handleProgressChange}
      >
        <div className="hero-viewport" ref={viewportRef}>
          {/* Background Text Layer (behind canvas) — parallax bg layer */}
          <div className="hero-background-text-container hero-parallax-bg">
            <h1 className="hero-title-top" ref={bgTitleRef} style={{ opacity: 0 }}>
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
          </div>

          <HeroCanvas currentFrameIndex={currentFrame} />

          {/* Foreground Text Layer (in front of canvas) — parallax fg layer */}
          <TextOverlay progress={scrollProgress} />
        </div>
      </ScrollController>
    </section>
  );
}
