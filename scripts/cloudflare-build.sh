#!/bin/bash
# Cloudflare Pages build script
# Ensures no cache files exceed 25MB limit

echo "🚀 Starting Cloudflare Pages build..."

# Run the Next.js build
echo "📦 Building Next.js application..."
npm run build

# Remove all cache files to prevent 25MB limit issues
echo "🧹 Cleaning up cache files..."
rm -rf .next/cache || true
find .next -name "*.pack" -delete || true
find .next -size +20M -delete || true

# Show final .next directory size
echo "📊 Final build size:"
du -sh .next/

echo "✅ Cloudflare Pages build completed successfully!"