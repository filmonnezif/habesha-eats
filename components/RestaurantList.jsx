'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

const restaurants = [
  {
    id: 1,
    name: 'Yod Abyssinia',
    cuisine: 'Traditional Ethiopian',
    rating: 4.9,
    reviews: 342,
    location: 'Bole, Addis Ababa',
    description: 'Award-winning cultural dining with live traditional music and dance performances.',
    priceRange: '$$$',
    image: '/restaurants/yod-abyssinia.webp',
    tags: ['Live Music', 'Cultural'],
  },
  {
    id: 2,
    name: 'Lucy Restaurant',
    cuisine: 'Ethiopian & Eritrean',
    rating: 4.8,
    reviews: 256,
    location: 'Piazza, Addis Ababa',
    description: 'Named after the famous fossil, serving authentic dishes in a historic setting.',
    priceRange: '$$',
    image: '/restaurants/lucy-restaurant.webp',
    tags: ['Historic', 'Family-friendly'],
  },
  {
    id: 3,
    name: 'Kategna',
    cuisine: 'Modern Ethiopian',
    rating: 4.7,
    reviews: 189,
    location: 'Kazanchis, Addis Ababa',
    description: 'Contemporary twist on classic recipes with locally sourced organic ingredients.',
    priceRange: '$$',
    image: '/restaurants/kategna.webp',
    tags: ['Organic', 'Modern'],
  },
  {
    id: 4,
    name: 'Totot Restaurant',
    cuisine: 'Traditional Ethiopian',
    rating: 4.8,
    reviews: 421,
    location: 'Meskel Square, Addis Ababa',
    description: 'Beloved local favorite known for the best doro wot and kitfo in the city.',
    priceRange: '$$',
    image: '/restaurants/totot.webp',
    tags: ['Local Favorite', 'Doro Wot'],
  },
  {
    id: 5,
    name: 'Habesha 2000',
    cuisine: 'Ethiopian Fine Dining',
    rating: 4.6,
    reviews: 178,
    location: 'CMC, Addis Ababa',
    description: 'Elevated dining experience with premium tej and an extensive vegetarian menu.',
    priceRange: '$$$',
    image: '/restaurants/habesha-2000.webp',
    tags: ['Fine Dining', 'Vegetarian'],
  },
  {
    id: 6,
    name: 'Serenade',
    cuisine: 'Ethiopian Fusion',
    rating: 4.7,
    reviews: 215,
    location: 'Sarbet, Addis Ababa',
    description: 'Creative fusion cuisine blending Ethiopian spices with international techniques.',
    priceRange: '$$$',
    image: '/restaurants/serenade.webp',
    tags: ['Fusion', 'Rooftop'],
  },
];

function StarRating({ rating }) {
  return (
    <div className="star-rating" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`star-icon ${star <= Math.round(rating) ? 'star-filled' : 'star-empty'}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          width="16"
          height="16"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="star-rating-value">{rating}</span>
    </div>
  );
}

function RestaurantCard({ restaurant, index }) {
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('card-visible');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <article
      ref={cardRef}
      className="restaurant-card"
      style={{ '--card-delay': `${index * 0.1}s` }}
      id={`restaurant-${restaurant.id}`}
    >
      <div className="restaurant-card-image-wrapper">
        <div
          className="restaurant-card-image"
          style={{
            backgroundImage: `url(${restaurant.image})`,
            backgroundColor: '#f3f4f6',
          }}
        />
        <div className="restaurant-card-price">{restaurant.priceRange}</div>
      </div>

      <div className="restaurant-card-body">
        <div className="restaurant-card-header">
          <h3 className="restaurant-card-name">{restaurant.name}</h3>
          <StarRating rating={restaurant.rating} />
        </div>

        <p className="restaurant-card-cuisine">{restaurant.cuisine}</p>
        <p className="restaurant-card-description">{restaurant.description}</p>

        <div className="restaurant-card-footer">
          <div className="restaurant-card-location">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{restaurant.location}</span>
          </div>
          <span className="restaurant-card-reviews">{restaurant.reviews} reviews</span>
        </div>

        <div className="restaurant-card-tags">
          {restaurant.tags.map((tag) => (
            <span key={tag} className="restaurant-tag">{tag}</span>
          ))}
        </div>
      </div>
    </article>
  );
}

/**
 * RestaurantList displays a grid of restaurant cards with
 * staggered intersection-observer-driven entrance animations.
 */
export default function RestaurantList() {
  return (
    <section className="restaurant-section" id="restaurants">
      <div className="restaurant-section-header">
        <p className="restaurant-section-eyebrow">Curated Selection</p>
        <h2 className="restaurant-section-title">
          Featured <span className="text-highlight-green">Restaurants</span>
        </h2>
        <p className="restaurant-section-subtitle">
          Handpicked by our community for an unforgettable dining experience
        </p>
      </div>

      <div className="restaurant-grid">
        {restaurants.map((restaurant, index) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
