'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import FloatingBeans from './FloatingBeans';
import { useLanguage } from '@/lib/LanguageContext';

const testimonials = [
  {
    quote: "Finally, a platform that understands what it means to crave the taste of home. I found my favorite Doro Wot within minutes!",
    name: 'Hanna M.',
    role: 'Food Lover, Dubai',
    rating: 5,
  },
  {
    quote: "As a restaurant owner, Habesha Eats brought us closer to our community. Our orders tripled in the first month.",
    name: 'Tesfaye G.',
    role: 'Owner, Zagol Restaurant',
    rating: 5,
  },
  {
    quote: "The menu comparison feature is brilliant. I can finally see prices side-by-side instead of checking each restaurant individually.",
    name: 'Sara A.',
    role: 'Student, Abu Dhabi',
    rating: 5,
  },
  {
    quote: "I've tried every Habesha restaurant in the UAE and this platform mapped them all perfectly. An essential tool for the diaspora.",
    name: 'Daniel K.',
    role: 'Engineer, Sharjah',
    rating: 5,
  },
  {
    quote: "The coffee ceremony recommendations alone make this app worth it. Found a hidden gem I'd never have discovered otherwise.",
    name: 'Meron T.',
    role: 'Writer, Dubai',
    rating: 5,
  },
  {
    quote: "Ordering for our community gathering was seamless. We fed 30 people authentic food without a single hiccup.",
    name: 'Yonas B.',
    role: 'Community Organizer, Ajman',
    rating: 4,
  },
];

/**
 * Testimonials — Auto-scrolling ticker of review cards with staggered reveal.
 */
export default function Testimonials() {
  const { t } = useLanguage();
  const sectionRef = useRef(null);
  const tickerRef = useRef(null);
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
      '.testimonials-eyebrow',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 },
      0
    );

    tl.fromTo(
      '.testimonials-title',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.9 },
      0.1
    );

    tl.fromTo(
      '.testimonial-card',
      { opacity: 0, y: 40, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, stagger: 0.08, duration: 0.8 },
      0.3
    );

    return () => tl.kill();
  }, [visible]);

  // Duplicate testimonials for infinite scroll effect
  const doubledTestimonials = [...testimonials, ...testimonials];

  return (
    <section ref={sectionRef} className="testimonials-section" id="testimonials">
      <FloatingBeans />
      <div className="testimonials-inner">
        <div className="testimonials-header">
          <p className="testimonials-eyebrow" style={{ opacity: 0 }}>{t('testimonials.eyebrow')}</p>
          <h2 className="testimonials-title" style={{ opacity: 0 }}>
            {t('testimonials.title')}
          </h2>
        </div>

        <div className="testimonials-ticker-wrapper">
          <div ref={tickerRef} className="testimonials-ticker">
            {doubledTestimonials.map((testimonial, i) => (
              <div
                key={`${testimonial.name}-${i}`}
                className="testimonial-card"
                style={{ opacity: 0 }}
              >
                <div className="testimonial-stars">
                  {Array.from({ length: testimonial.rating }).map((_, starIdx) => (
                    <svg key={starIdx} className="testimonial-star" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="testimonial-quote">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="testimonial-name">{testimonial.name}</p>
                    <p className="testimonial-role">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
