'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Custom hook that preloads a sequence of frame images and returns them
 * as an array of HTMLImageElement objects ready for canvas rendering.
 *
 * Uses progressive loading: loads keyframes first for instant scrubbing,
 * then fills in remaining frames for smooth playback.
 */
export function useFrameSequence(frameCount, basePath = '/frames/frame-') {
  const [frames, setFrames] = useState([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const framesRef = useRef([]);

  const loadImage = useCallback((index) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const paddedIndex = String(index + 1).padStart(3, '0');
      img.src = `${basePath}${paddedIndex}.webp`;
      img.onload = () => {
        framesRef.current[index] = img;
        setLoadedCount(prev => prev + 1);
        resolve(img);
      };
      img.onerror = () => {
        console.warn(`Failed to load frame ${paddedIndex}`);
        reject(new Error(`Frame ${paddedIndex} failed`));
      };
    });
  }, [basePath]);

  useEffect(() => {
    if (frameCount <= 0) return;

    framesRef.current = new Array(frameCount).fill(null);

    const loadFrames = async () => {
      // Phase 1: Load keyframes (every 10th frame + first + last) for instant scrubbing
      const keyframeIndices = [0];
      for (let i = 9; i < frameCount; i += 10) {
        keyframeIndices.push(i);
      }
      if (!keyframeIndices.includes(frameCount - 1)) {
        keyframeIndices.push(frameCount - 1);
      }

      // Load keyframes in parallel
      await Promise.allSettled(
        keyframeIndices.map(i => loadImage(i))
      );

      setIsReady(true); // Mark as ready after keyframes load

      // Phase 2: Fill in remaining frames
      const remainingIndices = [];
      for (let i = 0; i < frameCount; i++) {
        if (!keyframeIndices.includes(i)) {
          remainingIndices.push(i);
        }
      }

      // Load remaining in batches of 8 to avoid overwhelming the network
      const BATCH_SIZE = 8;
      for (let batch = 0; batch < remainingIndices.length; batch += BATCH_SIZE) {
        const batchIndices = remainingIndices.slice(batch, batch + BATCH_SIZE);
        await Promise.allSettled(
          batchIndices.map(i => loadImage(i))
        );
      }

      setFrames([...framesRef.current]);
    };

    loadFrames();

    return () => {
      framesRef.current = [];
    };
  }, [frameCount, loadImage]);

  /**
   * Get the best available frame for a given index.
   * Falls back to nearest loaded keyframe if the exact frame isn't loaded yet.
   */
  const getFrame = useCallback((index) => {
    const clampedIndex = Math.max(0, Math.min(index, frameCount - 1));

    // Try exact frame first
    if (framesRef.current[clampedIndex]) {
      return framesRef.current[clampedIndex];
    }

    // Fallback: find nearest loaded frame
    let nearest = null;
    let nearestDist = Infinity;
    for (let i = 0; i < framesRef.current.length; i++) {
      if (framesRef.current[i] && Math.abs(i - clampedIndex) < nearestDist) {
        nearest = framesRef.current[i];
        nearestDist = Math.abs(i - clampedIndex);
      }
    }
    return nearest;
  }, [frameCount]);

  return {
    frames,
    getFrame,
    loadedCount,
    totalFrames: frameCount,
    isReady,
    progress: frameCount > 0 ? loadedCount / frameCount : 0,
  };
}
