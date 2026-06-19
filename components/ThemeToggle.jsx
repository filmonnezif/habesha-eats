'use client';

import { useRef, useEffect, useCallback } from 'react';
import { Sun, Moon } from 'lucide-react';
import { gsap } from 'gsap';
import { useTheme } from '@/lib/ThemeContext';

/**
 * ThemeToggle — A fixed button in the top-right corner that toggles
 * between light and dark themes with a satisfying circular reveal
 * animation (day-to-night / night-to-day).
 */
export default function ThemeToggle() {
  const { theme, isDark, toggleTheme, toggleRef } = useTheme();
  const btnRef = useRef(null);
  const overlayRef = useRef(null);
  const iconRef = useRef(null);

  // Register button ref for position calculations
  useEffect(() => {
    toggleRef.current = btnRef.current;
  }, [toggleRef]);

  const handleToggle = useCallback(() => {
    const btn = btnRef.current;
    const overlay = overlayRef.current;
    if (!btn || !overlay) {
      toggleTheme();
      return;
    }

    // Get button center position for the circular reveal origin
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    // Calculate the radius needed to cover the entire viewport
    const maxRadius = Math.hypot(
      Math.max(cx, window.innerWidth - cx),
      Math.max(cy, window.innerHeight - cy)
    );

    // Set the overlay color to the NEXT theme's background
    const nextBg = isDark ? '#c0c2c6' : '#16191c';
    overlay.style.background = nextBg;

    // Animate the circular reveal
    const tl = gsap.timeline({
      onComplete: () => {
        // Reset overlay after animation
        gsap.set(overlay, { clipPath: 'circle(0px at 50% 50%)', opacity: 0 });
      },
    });

    // Phase 1: Expand circle from button
    tl.set(overlay, {
      opacity: 1,
      clipPath: `circle(0px at ${cx}px ${cy}px)`,
    });

    tl.to(overlay, {
      clipPath: `circle(${maxRadius}px at ${cx}px ${cy}px)`,
      duration: 0.7,
      ease: 'power2.inOut',
    });

    // Toggle theme at peak of animation (halfway through expansion)
    tl.call(toggleTheme, [], 0.35);

    // Phase 2: Fade out overlay to reveal the new theme underneath
    tl.to(
      overlay,
      {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.out',
      },
      0.55
    );

    // Animate the icon
    if (iconRef.current) {
      gsap.fromTo(
        iconRef.current,
        { rotation: 0, scale: 0.5, opacity: 0 },
        { rotation: 360, scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(2)', delay: 0.35 }
      );
    }
  }, [isDark, toggleTheme]);

  return (
    <>
      {/* Full-screen overlay for the circular reveal animation */}
      <div
        ref={overlayRef}
        className="theme-transition-overlay"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99997,
          pointerEvents: 'none',
          opacity: 0,
          clipPath: 'circle(0px at 50% 50%)',
          willChange: 'clip-path, opacity',
        }}
      />

      {/* Toggle button */}
      <button
        ref={btnRef}
        className="theme-toggle-btn"
        onClick={handleToggle}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <span ref={iconRef} className="theme-toggle-icon">
          {isDark ? (
            <Sun size={20} strokeWidth={2.5} />
          ) : (
            <Moon size={20} strokeWidth={2.5} />
          )}
        </span>
      </button>
    </>
  );
}
