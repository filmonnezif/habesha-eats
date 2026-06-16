'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import FloatingBeans from './FloatingBeans';

const UAE_HABESHA_RESTAURANTS = [
  {
    name: 'Al Habasha Restaurant',
    emirate: 'Dubai & Sharjah',
    tagline: 'The pioneer of traditional taste',
    image: '/images/restaurant_al_habasha.webp',
    description: 'Renowned for their legendary slow-cooked Doro Wot and rich, authentic flavor profile serving the diaspora since 1999.',
    specialty: 'Doro Wot (Chicken Stew)',
    rating: '4.8',
    reviews: '1,240'
  },
  {
    name: 'Zagol Ethiopian Restaurant',
    emirate: 'Dubai (Karama)',
    tagline: 'An authentic Mesob experience',
    image: '/images/restaurant_zagol.webp',
    description: 'Dine in traditional mud-wall decorated rooms on low-slung hand-woven Mesob tables for a deeply immersive cultural feast.',
    specialty: 'Beyaynetu Platter',
    rating: '4.9',
    reviews: '850'
  },
  {
    name: 'Kazoza Eritrean Restaurant',
    emirate: 'Abu Dhabi',
    tagline: 'True Eritrean hospitality',
    image: '/images/restaurant_kazoza.webp',
    description: 'Savor sizzling Lamb Tibs served in rustic clay burners alongside house-roasted Eritrean coffee and fresh, warm injera.',
    specialty: 'Sizzling Lamb Tibs',
    rating: '4.7',
    reviews: '620'
  },
  {
    name: 'Milano Habesha Restaurant',
    emirate: 'Sharjah',
    tagline: 'Where East Africa meets Italy',
    image: '/images/restaurant_milano.webp',
    description: 'Blending the best of Eritrean hospitality with signature Italian-influenced coffee beverages and breakfast specialties.',
    specialty: 'Kitcha Fit-Fit & Espresso',
    rating: '4.6',
    reviews: '410'
  },
  {
    name: 'Abyssinia Restaurant',
    emirate: 'Dubai (Deira)',
    tagline: 'Historic flavors, modern elegance',
    image: '/images/restaurant_abyssinia.webp',
    description: 'A beautiful upscale setting to enjoy modern takes on classic stews, premium kitfo, and traditional coffee ceremonies.',
    specialty: 'Kitfo & Special Wots',
    rating: '4.8',
    reviews: '530'
  }
];

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
  const sectionRef = useRef(null);
  const carouselTrackRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);

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
    if (index < 0 || index >= UAE_HABESHA_RESTAURANTS.length) return;
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
    if (currentIndex < UAE_HABESHA_RESTAURANTS.length - 1) {
      slideTo(currentIndex + 1);
    } else {
      slideTo(0); // Loop back
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      slideTo(currentIndex - 1);
    } else {
      slideTo(UAE_HABESHA_RESTAURANTS.length - 1); // Loop to end
    }
  };

  return (
    <section ref={sectionRef} className="taste-of-home-section" id="taste-of-home">
      <FloatingBeans />
      <div className="taste-of-home-inner">
        {/* Section Header */}
        <div className="taste-of-home-header">
          <p className="taste-of-home-eyebrow" style={{ opacity: 0 }}>
            Taste of Home
          </p>
          <h2 className="taste-of-home-title" style={{ opacity: 0 }}>
            Featured UAE Habesha Restaurants
          </h2>
          <p className="taste-of-home-subtitle" style={{ opacity: 0 }}>
            &ldquo;Food is Community&rdquo;
          </p>
        </div>

        {/* Carousel Container */}
        <div className="taste-carousel-container" style={{ opacity: 0 }}>
          <div className="taste-carousel-viewport">
            <div ref={carouselTrackRef} className="taste-carousel-track">
              {UAE_HABESHA_RESTAURANTS.map((restaurant, i) => (
                <Card3DTilt
                  key={restaurant.name}
                  className={`restaurant-carousel-card ${i === currentIndex ? 'card-active' : ''}`}
                >
                  <div className="card-image-wrapper">
                    <img
                      src={restaurant.image}
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
                      <a href="/discover" className="shiny-btn-mini" style={{ width: 'fit-content' }}>
                        View Menu &amp; Order
                      </a>
                    </div>

                    <div className="card-footer-row">
                      <span className="card-specialty">
                        Specialty: <strong>{restaurant.specialty}</strong>
                      </span>
                      <span className="card-reviews">{restaurant.reviews} reviews</span>
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
              {UAE_HABESHA_RESTAURANTS.map((_, i) => (
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
