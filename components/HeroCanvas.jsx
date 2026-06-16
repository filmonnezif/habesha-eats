'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { useFrameSequence } from '@/lib/useFrameSequence';

const TOTAL_FRAMES = 250;

/**
 * HeroCanvas renders the frame sequence onto an HTML5 <canvas> element.
 * Handles responsive sizing and cover-fit rendering.
 */
export default function HeroCanvas({ currentFrameIndex = 0 }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const animFrameRef = useRef(null);
  const lastDrawnFrame = useRef(-1);

  const { getFrame, isReady, progress } = useFrameSequence(TOTAL_FRAMES);

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

  // Draw frame to canvas with cover-fit
  const drawFrame = useCallback((frameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const frame = getFrame(frameIndex);
    if (!frame) return;

    // Skip if same frame already drawn
    if (lastDrawnFrame.current === frameIndex && frame === getFrame(lastDrawnFrame.current)) return;

    const { width: cw, height: ch } = canvas;

    // Cover-fit calculation
    const imgAspect = frame.naturalWidth / frame.naturalHeight;
    const canvasAspect = cw / ch;

    let drawWidth, drawHeight, offsetX, offsetY;
    const zoomFactor = 1.0;

    if (canvasAspect > imgAspect) {
      // Canvas is wider than image
      drawWidth = cw * zoomFactor;
      drawHeight = (cw / imgAspect) * zoomFactor;
    } else {
      // Canvas is taller than image
      drawHeight = ch * zoomFactor;
      drawWidth = (ch * imgAspect) * zoomFactor;
    }

    offsetX = (cw - drawWidth) / 2;
    offsetY = (ch - drawHeight) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(frame, offsetX, offsetY, drawWidth, drawHeight);
    lastDrawnFrame.current = frameIndex;
  }, [getFrame]);

  // Render on frame index change
  useEffect(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    animFrameRef.current = requestAnimationFrame(() => {
      drawFrame(currentFrameIndex);
    });

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [currentFrameIndex, drawFrame, isReady]);

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

      <canvas
        ref={canvasRef}
        width={dimensions.width * (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1)}
        height={dimensions.height * (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1)}
        style={{
          width: dimensions.width,
          height: dimensions.height,
        }}
        className="hero-canvas"
      />
      <div className="hero-canvas-overlay" />
    </div>
  );
}
