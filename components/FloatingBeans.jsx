'use client';

import { useEffect, useState } from 'react';

export default function FloatingBeans({ count = 10 }) {
  const [beans, setBeans] = useState([]);

  useEffect(() => {
    // Generate random but well-distributed positions on the client to avoid hydration mismatch
    const generatedBeans = Array.from({ length: count }).map((_, i) => {
      // Divide the section vertical space roughly to prevent all beans clumping at the top
      const segmentHeight = 100 / count;
      const minTop = i * segmentHeight + 5;
      const maxTop = (i + 1) * segmentHeight - 5;
      const randomTop = Math.random() * (maxTop - minTop) + minTop;

      return {
        id: i,
        top: `${randomTop}%`,
        left: `${Math.random() * 85 + 5}%`, // Keep away from extreme edges
        size: Math.floor(Math.random() * 16) + 16, // 16px to 32px
        rotate: Math.floor(Math.random() * 360),
        opacity: Math.random() * 0.13 + 0.12, // 0.12 to 0.25 opacity
        delay: Math.random() * 8,
        shimmer: Math.random() > 0.4, // 60% of beans shimmer
      };
    });
    setBeans(generatedBeans);
  }, [count]);

  if (beans.length === 0) return null;

  return (
    <div className="floating-beans-container" aria-hidden="true">
      {beans.map((bean) => (
        <div
          key={bean.id}
          className={`floating-bean ${bean.shimmer ? 'bean-shimmer' : ''}`}
          style={{
            top: bean.top,
            left: bean.left,
            width: `${bean.size}px`,
            height: `${bean.size}px`,
            opacity: bean.opacity,
            transform: `rotate(${bean.rotate}deg)`,
            animationDelay: `${bean.delay}s`,
          }}
        >
          <img
            src="/coffee-bean.png"
            alt=""
            draggable={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: 'brightness(0.85) saturate(0.85)',
            }}
          />
        </div>
      ))}
    </div>
  );
}
