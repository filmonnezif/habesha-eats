'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * CountUpStat — Animated counter that counts from 0 to `value`
 * when scrolled into view. Uses IntersectionObserver + requestAnimationFrame.
 *
 * @param {number} value - Target number to count up to
 * @param {string} suffix - Suffix to append (e.g. '+')
 * @param {string} label - Description text below the number
 * @param {string} color - CSS color for the number
 * @param {number} duration - Animation duration in ms
 */
export default function CountUpStat({
  value = 0,
  suffix = '',
  label = '',
  color = '#ffffff',
  duration = 2000,
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          const startTime = performance.now();

          const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(Math.floor(eased * value));

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setDisplayValue(value);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, duration, hasAnimated]);

  return (
    <div ref={ref} className="count-up-stat">
      <span className="count-up-value" style={{ color }}>
        {displayValue}
        {suffix}
      </span>
      <span className="count-up-label">{label}</span>
    </div>
  );
}
