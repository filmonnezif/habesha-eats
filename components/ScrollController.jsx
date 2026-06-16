'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 250;

/**
 * ScrollController manages the GSAP ScrollTrigger that pins the hero
 * section and maps scroll progress to frame indices and text overlay phases.
 */
export default function ScrollController({ children, onFrameChange, onProgressChange }) {
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const loopTweenRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create the loading/idle rotation loop for the mesob
    const animObj = { frame: 0 };
    loopTweenRef.current = gsap.to(animObj, {
      frame: 35, // Proportional idle rotation phase (frames 0 to 35)
      duration: 6, // 6 seconds per loop cycle (slower rotation)
      repeat: -1,
      yoyo: true, // yoyo back-and-forth for seamless looping
      ease: 'sine.inOut',
      onUpdate: () => {
        // Only drive the frame index if the page hasn't been scrolled
        if (!triggerRef.current || triggerRef.current.progress <= 0.001) {
          onFrameChange?.(Math.floor(animObj.frame));
        }
      }
    });

    const ctx = gsap.context(() => {
      // Create the scroll-linked animation
      triggerRef.current = ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: '+=400%', // 4x viewport height of scroll distance (faster scroll speed)
        pin: true,
        scrub: 0.5, // Smooth scrubbing with slight easing
        anticipatePin: 1,
        onUpdate: (self) => {
          const progress = self.progress;

          if (progress > 0.001) {
            // User has scrolled: pause the idle loop if it's running
            if (loopTweenRef.current && loopTweenRef.current.isActive()) {
              loopTweenRef.current.pause();
            }

            // Map progress to frame index: play video from 0 to 0.8 progress.
            // Stay on the last frame for progress > 0.8.
            const videoEndProgress = 0.8;
            let frameIndex;
            if (progress <= videoEndProgress) {
              frameIndex = Math.min(
                Math.floor((progress / videoEndProgress) * TOTAL_FRAMES),
                TOTAL_FRAMES - 1
              );
            } else {
              frameIndex = TOTAL_FRAMES - 1;
            }

            onFrameChange?.(frameIndex);
          } else {
            // User is at the top: play/resume the idle loop
            if (loopTweenRef.current && !loopTweenRef.current.isActive()) {
              loopTweenRef.current.play();
            }
          }

          onProgressChange?.(progress);
        },
      });
    }, containerRef);

    return () => {
      ctx.revert();
      if (loopTweenRef.current) {
        loopTweenRef.current.kill();
      }
    };
  }, [onFrameChange, onProgressChange]);

  return (
    <div ref={containerRef} className="scroll-controller">
      {children}
    </div>
  );
}
