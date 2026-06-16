'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import FloatingBeans from './FloatingBeans';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: '01',
    headline: 'Discover Restaurants',
    highlightWord: 'Discover',
    description:
      'Browse curated Habesha restaurants across the UAE. Filter by location, cuisine type, and dietary preferences.',
    color: 'var(--color-habesha-green)',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" className="step-icon">
        <circle cx="28" cy="28" r="20" stroke="currentColor" strokeWidth="3" />
        <path d="M42 42L56 56" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M20 28H36M28 20V36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    number: '02',
    headline: 'Compare & Choose',
    highlightWord: 'Compare',
    description:
      'View full menus side-by-side, compare prices, read real reviews, and find the perfect meal.',
    color: 'var(--color-habesha-gold)',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" className="step-icon">
        <rect x="4" y="8" width="24" height="48" rx="4" stroke="currentColor" strokeWidth="3" />
        <rect x="36" y="8" width="24" height="48" rx="4" stroke="currentColor" strokeWidth="3" />
        <path d="M10 20H22M10 28H22M10 36H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M42 20H54M42 28H54M42 36H50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M28 24L36 24M28 32L36 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 3" />
      </svg>
    ),
  },
  {
    number: '03',
    headline: 'Order & Enjoy',
    highlightWord: 'Order',
    description:
      'Place your order for delivery or dine-in. Track your food in real-time and savor authentic flavors from home.',
    color: 'var(--color-habesha-red)',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" className="step-icon">
        <path d="M8 52H56L50 24H14L8 52Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
        <path d="M24 24V16C24 10.5 28 6 32 6C36 6 40 10.5 40 16V24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <circle cx="32" cy="38" r="4" fill="currentColor" />
        <path d="M32 42V48" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const path1Ref = useRef(null);
  const path2Ref = useRef(null);
  const path3Ref = useRef(null);

  // Refs for each step element
  const stepRefs = useRef([]);
  stepRefs.current = [];

  const addToRefs = (el) => {
    if (el && !stepRefs.current.includes(el)) {
      stepRefs.current.push(el);
    }
  };

  useEffect(() => {
    const section = sectionRef.current;
    const container = containerRef.current;
    const paths = [path1Ref.current, path2Ref.current, path3Ref.current];
    const stepsElements = stepRefs.current;

    if (!section || !container || !paths.every(Boolean) || stepsElements.length < 3) return;

    // Set initial path states
    paths.forEach((p) => {
      const len = p.getTotalLength();
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
    });

    const ctx = gsap.context(() => {
      // Build master animation timeline synced to scroll
      // end length set to 350% to slow down transition speeds
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=200%',
          scrub: 0.5, // lower scrub value for faster, more responsive tracking
          pin: true,
          anticipatePin: 1,
        },
      });

      // Step 1 Elements
      const step1 = stepsElements[0];
      const num1 = step1.querySelector('.step-number');
      const icon1 = step1.querySelector('.step-icon-wrapper');
      const bar1 = step1.querySelector('.step-bar');
      const chars1 = step1.querySelectorAll('.step-char');
      const descWords1 = step1.querySelectorAll('.desc-word');

      // Step 2 Elements
      const step2 = stepsElements[1];
      const num2 = step2.querySelector('.step-number');
      const icon2 = step2.querySelector('.step-icon-wrapper');
      const bar2 = step2.querySelector('.step-bar');
      const chars2 = step2.querySelectorAll('.step-char');
      const descWords2 = step2.querySelectorAll('.desc-word');

      // Step 3 Elements
      const step3 = stepsElements[2];
      const num3 = step3.querySelector('.step-number');
      const icon3 = step3.querySelector('.step-icon-wrapper');
      const bar3 = step3.querySelector('.step-bar');
      const chars3 = step3.querySelectorAll('.step-char');
      const descWords3 = step3.querySelectorAll('.desc-word');

      // --- TIMELINE SEQUENCE (Slower & Spaced out) ---

      // 1. Reveal Step 1 (Gradual fade-in)
      tl.to([num1, icon1], { opacity: 0.9, scale: 1, y: 0, duration: 0.6 }, 0)
        .to(bar1, { scaleX: 1, duration: 0.5 }, 0.1)
        .to(chars1, { opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)', stagger: 0.035, duration: 0.8 }, 0.2)
        .to(descWords1, { opacity: 1, y: 0, stagger: 0.02, duration: 0.6 }, 0.4);

      // 2. Draw first curve (Green) to Step 2
      tl.to(path1Ref.current, { strokeDashoffset: 0, duration: 1.8 }, 1.0);
      
      // 3. Reveal Step 2 as line approaches
      tl.to([num2, icon2], { opacity: 0.9, scale: 1, y: 0, duration: 0.6 }, 2.8)
        .to(bar2, { scaleX: 1, duration: 0.5 }, 2.9)
        .to(chars2, { opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)', stagger: 0.035, duration: 0.8 }, 3.0)
        .to(descWords2, { opacity: 1, y: 0, stagger: 0.02, duration: 0.6 }, 3.2);

      // 4. Draw second curve (Yellow) to Step 3
      tl.to(path2Ref.current, { strokeDashoffset: 0, duration: 1.8 }, 3.8);

      // 5. Reveal Step 3 as line approaches
      tl.to([num3, icon3], { opacity: 0.9, scale: 1, y: 0, duration: 0.6 }, 5.6)
        .to(bar3, { scaleX: 1, duration: 0.5 }, 5.7)
        .to(chars3, { opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)', stagger: 0.035, duration: 0.8 }, 5.8)
        .to(descWords3, { opacity: 1, y: 0, stagger: 0.02, duration: 0.6 }, 6.0);

      // 6. Draw third curve (Red) to the end (stops at bottom of Step 3)
      tl.to(path3Ref.current, { strokeDashoffset: 0, duration: 1.8 }, 6.6);

      // Continuous floating animations for icons
      [icon1, icon2, icon3].forEach((icon) => {
        if (icon) {
          gsap.to(icon, {
            y: -8,
            duration: 2.5,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          });
        }
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="how-it-works-section" id="how-it-works">
      <FloatingBeans />
      {/* Curved Snaking Guiding Line */}
      <svg
        className="guiding-line-svg"
        viewBox="0 0 1000 900"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* Segment 1: Green — curvy path from step 1 to step 2 */}
        <path
          ref={path1Ref}
          d="M 180 180 C 450 180, 820 160, 820 380"
          stroke="#34c759"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Segment 2: Yellow — curvy path from step 2 to step 3 */}
        <path
          ref={path2Ref}
          d="M 820 380 C 820 600, 180 500, 180 720"
          stroke="#fcd900"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Segment 3: Red — curvy path that stops exactly at Step 3 area */}
        <path
          ref={path3Ref}
          d="M 180 720 C 180 780, 300 810, 500 810"
          stroke="#ff454f"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      <div ref={containerRef} className="how-it-works-container-inner">
        {/* Section Header */}
        <div className="how-it-works-header">
          <p className="how-it-works-eyebrow">
            Simple &amp; Seamless
          </p>
          <h2 className="how-it-works-title">
            {'How It Works'.split('').map((char, i) => (
              <span
                key={i}
                className="title-char"
                style={{
                  display: 'inline-block',
                  ...(char === ' ' ? { width: '0.35em' } : {}),
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h2>
        </div>

        {/* Steps */}
        <div className="steps-container">
          {steps.map((step, index) => {
            const isEven = index % 2 === 0;

            const headlineChars = step.headline.split('').map((char, i) => {
              const isSpace = char === ' ';
              const words = step.headline.split(' ');
              let charIndex = 0;
              let isHighlight = false;
              for (const word of words) {
                if (i >= charIndex && i < charIndex + word.length) {
                  isHighlight = word.replace(/[^a-zA-Z]/g, '') === step.highlightWord;
                  break;
                }
                charIndex += word.length + 1;
              }

              return (
                <span
                  key={i}
                  className={`step-char ${isHighlight ? 'step-char-highlight' : ''}`}
                  style={{
                    display: 'inline-block',
                    ...(isSpace ? { width: '0.3em' } : {}),
                    ...(isHighlight ? { color: step.color } : {}),
                    opacity: 0,
                    transform: 'translateY(25px) rotateX(-40deg)',
                  }}
                >
                  {isSpace ? '\u00A0' : char}
                </span>
              );
            });

            const descWords = step.description.split(' ').map((word, i) => (
              <span
                key={i}
                className="desc-word"
                style={{ display: 'inline-block', opacity: 0, translateY: 15, marginRight: '0.3em' }}
              >
                {word}
              </span>
            ));

            return (
              <div
                key={step.number}
                ref={addToRefs}
                className={`step-block ${isEven ? 'step-block-left' : 'step-block-right'}`}
                id={`step-${step.number}`}
              >
                <div className="step-content">
                  <div className="step-top-row">
                    <div
                      className="step-number"
                      style={{ color: step.color, opacity: 0, transform: 'scale(0.5)' }}
                      aria-hidden="true"
                    >
                      {step.number}
                    </div>

                    <div
                      className="step-icon-wrapper"
                      style={{ color: step.color, opacity: 0, transform: 'scale(0.3)' }}
                    >
                      {step.icon}
                    </div>
                  </div>

                  <div
                    className="step-bar"
                    style={{
                      background: step.color,
                      transformOrigin: isEven ? 'left center' : 'right center',
                      transform: 'scaleX(0)',
                    }}
                  />

                  <h3 className="step-headline">
                    {headlineChars}
                  </h3>

                  <p className="step-description">
                    {descWords}
                  </p>
                </div>

                <div
                  className="step-glow"
                  style={{
                    background: `radial-gradient(ellipse at ${isEven ? '20%' : '80%'} 50%, ${step.color}10 0%, transparent 70%)`,
                  }}
                  aria-hidden="true"
                />
              </div>
            );
          })}
        </div>

        {/* CTA Button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
          <a href="/discover" className="shiny-btn">
            Find Restaurants Near You
            <svg className="cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>

      {/* Bottom flag stripe decoration */}
      <div className="flag-stripe-row" aria-hidden="true">
        <div className="flag-stripe flag-stripe-green" />
        <div className="flag-stripe flag-stripe-red" />
        <div className="flag-stripe flag-stripe-yellow" />
      </div>
    </section>
  );
}
