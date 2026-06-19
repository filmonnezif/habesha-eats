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
        opacity: Math.random() * 0.16 + 0.22, // 0.22 to 0.38 opacity (more visible)
        delay: Math.random() * -8, // Negative delay so beans start at different parts of their bounce animation immediately
        shimmer: Math.random() > 0.4, // 60% of beans shimmer
        bounceDuration: Math.random() * 4 + 5, // 5s to 9s bounce
        isShiny: false,
      };
    });
    setBeans(generatedBeans);
  }, [count]);

  // Handle random golden shine trigger
  useEffect(() => {
    if (beans.length === 0) return;

    const triggerRandomShine = () => {
      const randomIndex = Math.floor(Math.random() * beans.length);
      
      setBeans((prevBeans) =>
        prevBeans.map((bean, idx) =>
          idx === randomIndex ? { ...bean, isShiny: true } : bean
        )
      );

      // Reset shiny state after animation ends
      setTimeout(() => {
        setBeans((prevBeans) =>
          prevBeans.map((bean, idx) =>
            idx === randomIndex ? { ...bean, isShiny: false } : bean
          )
        );
      }, 1600);
    };

    let timeoutId;
    const nextShine = () => {
      triggerRandomShine();
      const delay = Math.random() * 3000 + 2000; // 2s to 5s random intervals
      timeoutId = setTimeout(nextShine, delay);
    };

    timeoutId = setTimeout(nextShine, 1500);

    return () => clearTimeout(timeoutId);
  }, [beans.length]);

  if (beans.length === 0) return null;

  return (
    <div className="floating-beans-container" aria-hidden="true">
      {beans.map((bean) => (
        <div
          key={bean.id}
          className={`floating-bean ${bean.shimmer ? 'bean-shimmer' : ''} ${bean.isShiny ? 'bean-shiny' : ''}`}
          style={{
            top: bean.top,
            left: bean.left,
            width: `${bean.size}px`,
            height: `${bean.size}px`,
            opacity: bean.opacity,
            '--bean-rotation': `${bean.rotate}deg`,
            animationDelay: `${bean.delay}s`,
            animationDuration: `${bean.bounceDuration}s`,
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
              filter: 'brightness(0.95) saturate(0.9)',
            }}
          />
        </div>
      ))}
    </div>
  );
}
