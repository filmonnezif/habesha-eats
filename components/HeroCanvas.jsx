'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { useFrameSequence } from '@/lib/useFrameSequence';
import { useTheme } from '@/lib/ThemeContext';

const DARK_TOTAL_FRAMES = 250;
const LIGHT_TOTAL_FRAMES = 300;

/**
 * HeroCanvas renders the frame sequence onto an HTML5 <canvas> element.
 * Handles responsive sizing, cover-fit rendering, and crossfade between
 * dark and light hero sequences on theme toggle.
 */
export default function HeroCanvas({ currentFrameIndex = 0 }) {
  const canvasRef = useRef(null);
  const lightCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const animFrameRef = useRef(null);
  const lastDrawnFrame = useRef({ dark: -1, light: -1 });

  const { isDark } = useTheme();
  const [canvasOpacity, setCanvasOpacity] = useState({ dark: 1, light: 0 });
  const transitionRef = useRef(null);

  const { getFrame: getDarkFrame, isReady: darkReady, progress: darkProgress } = useFrameSequence(DARK_TOTAL_FRAMES, '/frames/frame-');
  const { getFrame: getLightFrame, isReady: lightReady, progress: lightProgress } = useFrameSequence(LIGHT_TOTAL_FRAMES, '/frames-light/frame-');

  const isReady = isDark ? darkReady : lightReady;
  const progress = isDark ? darkProgress : lightProgress;

  // Crossfade on theme change
  useEffect(() => {
    if (transitionRef.current) {
      cancelAnimationFrame(transitionRef.current);
    }

    const targetDark = isDark ? 1 : 0;
    const targetLight = isDark ? 0 : 1;
    const duration = 800; // ms
    const startTime = performance.now();
    const startDark = canvasOpacity.dark;
    const startLight = canvasOpacity.light;

    const animate = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      // Smooth easing
      const ease = 1 - Math.pow(1 - t, 3);

      setCanvasOpacity({
        dark: startDark + (targetDark - startDark) * ease,
        light: startLight + (targetLight - startLight) * ease,
      });

      if (t < 1) {
        transitionRef.current = requestAnimationFrame(animate);
      }
    };

    transitionRef.current = requestAnimationFrame(animate);

    return () => {
      if (transitionRef.current) {
        cancelAnimationFrame(transitionRef.current);
      }
    };
  }, [isDark]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle responsive canvas sizing
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({ width: clientWidth, height: clientHeight });
      }
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Draw frame to a specific canvas with cover-fit
  const drawFrameToCanvas = useCallback((canvas, getFrame, frameIndex, cacheKey) => {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const frame = getFrame(frameIndex);
    if (!frame) return;

    // Skip if same frame already drawn
    if (lastDrawnFrame.current[cacheKey] === frameIndex) return;

    const { width: cw, height: ch } = canvas;

    // Cover-fit calculation
    const imgAspect = frame.naturalWidth / frame.naturalHeight;
    const canvasAspect = cw / ch;

    let drawWidth, drawHeight, offsetX, offsetY;
    const zoomFactor = 1.0;

    if (canvasAspect > imgAspect) {
      drawWidth = cw * zoomFactor;
      drawHeight = (cw / imgAspect) * zoomFactor;
    } else {
      drawHeight = ch * zoomFactor;
      drawWidth = (ch * imgAspect) * zoomFactor;
    }

    offsetX = (cw - drawWidth) / 2;
    offsetY = (ch - drawHeight) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(frame, offsetX, offsetY, drawWidth, drawHeight);
    lastDrawnFrame.current[cacheKey] = frameIndex;
  }, []);

  // Map the shared frame index to each sequence's range
  const getDarkFrameIndex = useCallback((idx) => {
    return Math.min(idx, DARK_TOTAL_FRAMES - 1);
  }, []);

  const getLightFrameIndex = useCallback((idx) => {
    // Scale proportionally if frame counts differ
    const ratio = LIGHT_TOTAL_FRAMES / DARK_TOTAL_FRAMES;
    return Math.min(Math.round(idx * ratio), LIGHT_TOTAL_FRAMES - 1);
  }, []);

  // Render on frame index change
  useEffect(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    animFrameRef.current = requestAnimationFrame(() => {
      // Always draw both canvases so crossfade works smoothly
      drawFrameToCanvas(canvasRef.current, getDarkFrame, getDarkFrameIndex(currentFrameIndex), 'dark');
      drawFrameToCanvas(lightCanvasRef.current, getLightFrame, getLightFrameIndex(currentFrameIndex), 'light');
    });

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [currentFrameIndex, drawFrameToCanvas, getDarkFrame, getLightFrame, getDarkFrameIndex, getLightFrameIndex, darkReady, lightReady]);

  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

  return (
    <div
      ref={containerRef}
      className="hero-canvas-container"
    >
      {/* Loading indicator */}
      {!isReady && (
        <div className="hero-canvas-loader">
          <div className="hero-canvas-loader-inner">
            <div className="loader-spinner" />
            <p className="loader-text">
              Loading experience{' '}
              <span className="loader-percent">
                {Math.round(progress * 100)}%
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Dark canvas */}
      <canvas
        ref={canvasRef}
        width={dimensions.width * dpr}
        height={dimensions.height * dpr}
        style={{
          width: dimensions.width,
          height: dimensions.height,
          opacity: canvasOpacity.dark,
          position: 'absolute',
          inset: 0,
          transition: 'opacity 0.1s linear',
        }}
        className="hero-canvas"
      />

      {/* Light canvas */}
      <canvas
        ref={lightCanvasRef}
        width={dimensions.width * dpr}
        height={dimensions.height * dpr}
        style={{
          width: dimensions.width,
          height: dimensions.height,
          opacity: canvasOpacity.light,
          position: 'absolute',
          inset: 0,
          transition: 'opacity 0.1s linear',
        }}
        className="hero-canvas"
      />

      <div className="hero-canvas-overlay" />
    </div>
  );
}
