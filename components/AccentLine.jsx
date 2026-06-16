'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * AccentLine renders a decorative SVG path that "draws" itself
 * as the user scrolls. Uses stroke-dasharray/dashoffset animation
 * driven by GSAP ScrollTrigger scrub.
 *
 * @param {string} color - CSS color for the stroke
 * @param {string} path - SVG path data string
 * @param {string} className - Additional CSS class
 * @param {number} strokeWidth - Stroke width in px
 * @param {string} viewBox - SVG viewBox attribute
 */
export default function AccentLine({
  color = '#34c759',
  path = 'M0,50 Q250,0 500,50 T1000,50',
  className = '',
  strokeWidth = 2,
  viewBox = '0 0 1000 100',
}) {
  const svgRef = useRef(null);
  const pathRef = useRef(null);

  useEffect(() => {
    if (!pathRef.current || !svgRef.current) return;

    const pathEl = pathRef.current;
    const totalLength = pathEl.getTotalLength();

    // Set initial state: line fully hidden
    gsap.set(pathEl, {
      strokeDasharray: totalLength,
      strokeDashoffset: totalLength,
    });

    const ctx = gsap.context(() => {
      gsap.to(pathEl, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: svgRef.current,
          start: 'top 85%',
          end: 'bottom 30%',
          scrub: 0.8,
        },
      });
    }, svgRef);

    return () => ctx.revert();
  }, []);

  return (
    <svg
      ref={svgRef}
      className={`accent-line ${className}`}
      viewBox={viewBox}
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        ref={pathRef}
        d={path}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
