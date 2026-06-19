#!/bin/bash
# Extract frames from a video as optimized WebP sequence
# Usage: ./scripts/extract-frames.sh <input-video> <output-dir> [fps] [width] [crop_filter]
# Example: ./scripts/extract-frames.sh hero-light.mp4 public/frames-light 30 1920 "none"

INPUT="${1:-../Mesob_basket_with_holographic_in…_202606121708.mp4}"
OUTPUT_DIR="${2:-public/frames}"
FPS="${3:-30}"
WIDTH="${4:-1920}"
CROP_FILTER="${5:-crop=1496:1080:212:0}" # Default crop for backward compatibility

mkdir -p "$OUTPUT_DIR"

echo "🎬 Extracting frames from: $INPUT"
echo "📁 Output directory: $OUTPUT_DIR"
echo "🎞️  FPS: $FPS, Width: ${WIDTH}px"

FILTER_STR="fps=$FPS,scale=${WIDTH}:-1:flags=lanczos"
if [ -n "$CROP_FILTER" ] && [ "$CROP_FILTER" != "none" ]; then
  FILTER_STR="${CROP_FILTER},${FILTER_STR}"
  echo "✂️  Applying crop filter: $CROP_FILTER"
else
  echo "🚫 No crop filter applied"
fi

# Extract frames as WebP for optimal compression
ffmpeg -i "$INPUT" \
  -vf "$FILTER_STR" \
  -c:v libwebp \
  -quality 82 \
  -compression_level 4 \
  "$OUTPUT_DIR/frame-%03d.webp" \
  -y 2>&1

FRAME_COUNT=$(ls -1 "$OUTPUT_DIR"/frame-*.webp 2>/dev/null | wc -l)
TOTAL_SIZE=$(du -sh "$OUTPUT_DIR" 2>/dev/null | cut -f1)

echo ""
echo "✅ Extracted $FRAME_COUNT frames"
echo "📦 Total size: $TOTAL_SIZE"
echo "🖼️  Preview: $OUTPUT_DIR/frame-001.webp"
