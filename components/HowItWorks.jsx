'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '@/lib/LanguageContext';
import FloatingBeans from './FloatingBeans';

gsap.registerPlugin(ScrollTrigger);

export default function HowItWorks() {
  const { t, language } = useLanguage();
  const sectionRef = useRef(null);

  const steps = [
    {
      number: '01',
      headline: t('howItWorks.step1.headline'),
      highlightWord: language === 'en' ? 'Discover' : language === 'am' ? 'ሬስቶራንቶችን' : language === 'ti' ? 'ቤተ-ብልዓት' : 'Nyaatawwan',
      description: t('howItWorks.step1.desc'),
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
      headline: t('howItWorks.step2.headline'),
      highlightWord: language === 'en' ? 'Compare' : language === 'am' ? 'ያወዳድሩ' : language === 'ti' ? 'ኣወዳድሩን' : 'Walbira',
      description: t('howItWorks.step2.desc'),
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
      headline: t('howItWorks.step3.headline'),
      highlightWord: language === 'en' ? 'Order' : language === 'am' ? 'ያዝዙ' : language === 'ti' ? 'እዘዙን' : 'Ajaji',
      description: t('howItWorks.step3.desc'),
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

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade in/out the header
      gsap.fromTo(
        '.how-it-works-header',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.how-it-works-header',
            start: 'top 90%',
            end: 'bottom 10%',
            toggleActions: 'play reverse play reverse',
          },
        }
      );

      // Stagger reveal/hide the cards with a modern 3D tilt & springy motion
      gsap.fromTo(
        '.how-it-works-card',
        { 
          opacity: 0, 
          y: 60, 
          scale: 0.9, 
          rotationX: -12, 
          transformPerspective: 1000 
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotationX: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: 'back.out(1.2)',
          scrollTrigger: {
            trigger: '.steps-grid',
            start: 'top 85%',
            end: 'bottom 15%',
            toggleActions: 'play reverse play reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="how-it-works-section" id="how-it-works">
      <FloatingBeans />

      <div className="how-it-works-container-inner">
        {/* Section Header */}
        <div className="how-it-works-header">
          <p className="how-it-works-eyebrow">
            {t('howItWorks.eyebrow')}
          </p>
          <h2 className="how-it-works-title">
            {t('howItWorks.title')}
          </h2>
        </div>

        {/* Steps Grid */}
        <div className="steps-grid">
          {steps.map((step) => {
            const words = step.headline.split(' ');
            const headlineElements = words.map((word, i) => {
              const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
              const isHighlight = cleanWord === step.highlightWord;
              return (
                <span
                  key={i}
                  className={isHighlight ? 'step-headline-highlight' : ''}
                  style={isHighlight ? { color: step.color } : {}}
                >
                  {word}{i < words.length - 1 ? ' ' : ''}
                </span>
              );
            });

            return (
              <div
                key={step.number}
                className="how-it-works-card"
                style={{ '--accent-color': step.color }}
              >
                {/* Visual Top Highlight Bar */}
                <div className="card-top-bar" />

                <div className="card-top-row">
                  <span className="card-step-number">{step.number}</span>
                  <div className="card-icon-wrapper">
                    {step.icon}
                  </div>
                </div>

                <div className="card-body">
                  <h3 className="step-headline">
                    {headlineElements}
                  </h3>
                  <p className="step-description">
                    {step.description}
                  </p>
                </div>

                {/* Ambient glow matching the step color */}
                <div className="card-glow" />
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="how-it-works-cta-container">
          <a href="/discover" className="shiny-btn">
            {t('navbar.findNearYou')}
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
