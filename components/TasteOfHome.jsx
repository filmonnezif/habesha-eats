'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import FloatingBeans from './FloatingBeans';
import { useLanguage } from '@/lib/LanguageContext';
import { restaurants as DB_RESTAURANTS } from '@/lib/data';

/**
 * Card3DTilt wrapper for 3D mouse hover tilt effect.
 */
function Card3DTilt({ children, className }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within element
    const y = e.clientY - rect.top;  // y position within element

    const xc = rect.width / 2;
    const yc = rect.height / 2;

    const angleX = -(yc - y) / 16; // tilt limit X
    const angleY = (xc - x) / 20;  // tilt limit Y

    gsap.to(card, {
      rotateX: angleX,
      rotateY: angleY,
      transformPerspective: 1000,
      ease: 'power2.out',
      duration: 0.3,
    });
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;

    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      ease: 'power3.out',
      duration: 0.5,
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
    >
      {children}
    </div>
  );
}

export default function TasteOfHome() {
  const { t, translateRestaurant } = useLanguage();
  const sectionRef = useRef(null);
  const carouselTrackRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  const displayRestaurants = DB_RESTAURANTS.slice(0, 5).map(translateRestaurant);

  // IntersectionObserver for entrance reveal
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

  // Entrance animations
  useEffect(() => {
    if (!visible) return;

    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

    tl.fromTo(
      '.taste-of-home-eyebrow',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 },
      0
    );

    tl.fromTo(
      '.taste-of-home-title',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.9 },
      0.1
    );

    tl.fromTo(
      '.taste-of-home-subtitle',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 },
      0.2
    );

    tl.fromTo(
      '.taste-carousel-container',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1 },
      0.3
    );

    return () => tl.kill();
  }, [visible]);

  // Handle slide transitions
  const slideTo = (index) => {
    if (index < 0 || index >= displayRestaurants.length) return;
    setCurrentIndex(index);

    const cardWidth = carouselTrackRef.current.querySelector('.restaurant-carousel-card').offsetWidth;
    const gap = 24; // 1.5rem gap

    gsap.to(carouselTrackRef.current, {
      x: -(index * (cardWidth + gap)),
      duration: 0.8,
      ease: 'power3.out'
    });
  };

  const handleNext = () => {
    if (currentIndex < displayRestaurants.length - 1) {
      slideTo(currentIndex + 1);
    } else {
      slideTo(0); // Loop back
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      slideTo(currentIndex - 1);
    } else {
      slideTo(displayRestaurants.length - 1); // Loop to end
    }
  };

  return (
    <section ref={sectionRef} className="taste-of-home-section" id="taste-of-home">
      <FloatingBeans />
      <div className="taste-of-home-inner">
        {/* Section Header */}
        <div className="taste-of-home-header">
          <p className="taste-of-home-eyebrow" style={{ opacity: 0 }}>
            {t('tasteOfHome.eyebrow')}
          </p>
          <h2 className="taste-of-home-title" style={{ opacity: 0 }}>
            {t('tasteOfHome.title')}
          </h2>
          <p className="taste-of-home-subtitle" style={{ opacity: 0 }}>
            {t('tasteOfHome.subtitle')}
          </p>
        </div>

        {/* Carousel Container */}
        <div className="taste-carousel-container" style={{ opacity: 0 }}>
          <div className="taste-carousel-viewport">
            <div ref={carouselTrackRef} className="taste-carousel-track">
              {displayRestaurants.map((restaurant, i) => (
                <Card3DTilt
                  key={restaurant.id}
                  className={`restaurant-carousel-card ${i === currentIndex ? 'card-active' : ''}`}
                >
                  <div className="card-image-wrapper">
                    <img
                      src={restaurant.heroImage}
                      alt={restaurant.name}
                      className="card-restaurant-image"
                    />
                    <span className="card-emirate-badge">
                      {restaurant.emirate}
                    </span>
                  </div>

                  <div className="card-info-content">
                    <div className="card-header-row">
                      <h3 className="card-restaurant-name">{restaurant.name}</h3>
                      <div className="card-rating-badge">
                        <svg className="star-icon" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                        <span>{restaurant.rating}</span>
                      </div>
                    </div>

                    <p className="card-tagline">{restaurant.tagline}</p>
                    <p className="card-description">{restaurant.description}</p>
                    <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                      <a href={`/restaurant/${restaurant.id}`} className="shiny-btn-mini" style={{ width: 'fit-content' }}>
                        {t('tasteOfHome.viewMenu')}
                      </a>
                    </div>

                    <div className="card-footer-row">
                      <span className="card-specialty">
                        {t('tasteOfHome.specialty')}: <strong>{restaurant.specialty}</strong>
                      </span>
                      <span className="card-reviews">{restaurant.reviewCount} {t('tasteOfHome.reviews')}</span>
                    </div>
                  </div>
                </Card3DTilt>
              ))}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="carousel-nav-controls">
            <button
              onClick={handlePrev}
              className="carousel-nav-btn prev-btn"
              aria-label="Previous slide"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="nav-arrow">
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Pagination Dots */}
            <div className="carousel-dots">
              {displayRestaurants.map((_, i) => (
                <button
                  key={i}
                  onClick={() => slideTo(i)}
                  className={`carousel-dot ${i === currentIndex ? 'dot-active' : ''}`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="carousel-nav-btn next-btn"
              aria-label="Next slide"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="nav-arrow">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
