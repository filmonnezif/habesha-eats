'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import FloatingBeans from './FloatingBeans';

const dishes = [
  {
    name: 'Doro Wot',
    description: 'Slow-braised chicken stew in rich berbere sauce, a cornerstone of Ethiopian cuisine',
    image: '/images/dish_doro_wot.webp',
    tag: 'Signature',
  },
  {
    name: 'Kitfo',
    description: 'Ethiopian steak tartare seasoned with mitmita spice and niter kibbeh butter',
    image: '/images/dish_kitfo.webp',
    tag: 'Delicacy',
  },
  {
    name: 'Injera & Beyaynetu',
    description: 'Sourdough flatbread with an assortment of colorful vegetarian and meat stews',
    image: '/images/dish_injera.webp',
    tag: 'Classic',
  },
  {
    name: 'Tibs',
    description: 'Sizzling sautéed meat with peppers, onions, and rosemary in a clay dish',
    image: '/images/dish_tibs.webp',
    tag: 'Popular',
  },
  {
    name: 'Shiro',
    description: 'Creamy chickpea stew seasoned with garlic, ginger, and Ethiopian spices',
    image: '/images/dish_shiro.webp',
    tag: 'Vegan',
  },
  {
    name: 'Coffee Ceremony',
    description: 'Traditional roasting, grinding, and brewing ritual — the heart of Habesha hospitality',
    image: '/images/dish_coffee.webp',
    tag: 'Cultural',
  },
];

/**
 * PopularDishes — Horizontal scrolling showcase of popular Habesha dishes.
 * Each card reveals on scroll with staggered animation.
 */
export default function PopularDishes() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
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
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  useEffect(() => {
    if (!visible) return;

    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

    tl.fromTo(
      '.dishes-eyebrow',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 },
      0
    );

    tl.fromTo(
      '.dishes-title',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.9 },
      0.1
    );

    tl.fromTo(
      '.dish-card',
      { opacity: 0, y: 50, scale: 0.93 },
      { opacity: 1, y: 0, scale: 1, stagger: 0.1, duration: 0.8 },
      0.3
    );

    return () => tl.kill();
  }, [visible]);

  return (
    <section ref={sectionRef} className="dishes-section" id="dishes">
      <FloatingBeans />
      <div className="dishes-inner">
        <div className="dishes-header">
          <p className="dishes-eyebrow" style={{ opacity: 0 }}>Explore the Flavors</p>
          <h2 className="dishes-title" style={{ opacity: 0 }}>
            Popular Habesha Dishes
          </h2>
        </div>

        <div className="dishes-scroll-container">
          <div ref={trackRef} className="dishes-track">
            {dishes.map((dish) => (
              <div key={dish.name} className="dish-card" style={{ opacity: 0 }}>
                <div className="dish-image-wrapper">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="dish-image"
                    loading="lazy"
                  />
                  <span className="dish-tag">{dish.tag}</span>
                </div>
                <div className="dish-info">
                  <h3 className="dish-name">{dish.name}</h3>
                  <p className="dish-description">{dish.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
