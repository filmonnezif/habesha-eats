'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import FloatingBeans from './FloatingBeans';
import { useLanguage } from '@/lib/LanguageContext';

/**
 * PopularDishes — Horizontal scrolling showcase of popular Habesha dishes.
 * Each card reveals on scroll with staggered animation.
 */
export default function PopularDishes() {
  const { t } = useLanguage();
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const [visible, setVisible] = useState(false);

  const dishes = [
    {
      name: 'Doro Wot',
      description: t('dishes.doro'),
      image: '/images/dish_doro_wot.webp',
      tag: t('dishes.tags.signature'),
    },
    {
      name: 'Kitfo',
      description: t('dishes.kitfo'),
      image: '/images/dish_kitfo.webp',
      tag: t('dishes.tags.delicacy'),
    },
    {
      name: 'Injera & Beyaynetu',
      description: t('dishes.injera'),
      image: '/images/dish_injera.webp',
      tag: t('dishes.tags.classic'),
    },
    {
      name: 'Tibs',
      description: t('dishes.tibs'),
      image: '/images/dish_tibs.webp',
      tag: t('dishes.tags.popular'),
    },
    {
      name: 'Shiro',
      description: t('dishes.shiro'),
      image: '/images/dish_shiro.webp',
      tag: t('dishes.tags.vegan'),
    },
    {
      name: 'Coffee Ceremony',
      description: t('dishes.coffee'),
      image: '/images/dish_coffee.webp',
      tag: t('dishes.tags.cultural'),
    },
  ];

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
          <p className="dishes-eyebrow" style={{ opacity: 0 }}>{t('dishes.eyebrow')}</p>
          <h2 className="dishes-title" style={{ opacity: 0 }}>
            {t('dishes.title')}
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
