#!/bin/bash
# Extract frames from the Mesob basket video as optimized WebP sequence
# Usage: ./scripts/extract-frames.sh <input-video> <output-dir> [fps] [width]

INPUT="${1:-../Mesob_basket_with_holographic_in…_202606121708.mp4}"
OUTPUT_DIR="${2:-public/frames}"
FPS="${3:-30}"
WIDTH="${4:-1920}"

mkdir -p "$OUTPUT_DIR"

echo "🎬 Extracting frames from: $INPUT"
echo "📁 Output directory: $OUTPUT_DIR"
echo "🎞️  FPS: $FPS, Width: ${WIDTH}px"

# Extract frames as WebP for optimal compression
ffmpeg -i "$INPUT" \
  -vf "crop=1496:1080:212:0,fps=$FPS,scale=${WIDTH}:-1:flags=lanczos" \
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
