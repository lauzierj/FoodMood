#!/usr/bin/env node

import { writeFileSync } from 'fs';
import { resolve } from 'path';

// Simple SVG icon for FoodMood - using standard emojis
// Apple emoji (🍎) and happy face emoji (😊)
const createIconSVG = (size) => {
  const center = size / 2;
  const fontSize = size * 0.4;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background circle with gradient -->
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4A90E2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#7B68EE;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <circle cx="${center}" cy="${center}" r="${size * 0.45}" fill="url(#bgGradient)"/>
  
  <!-- Apple emoji -->
  <text 
    x="${center}" 
    y="${center * 0.65}" 
    font-size="${fontSize}" 
    text-anchor="middle" 
    dominant-baseline="middle"
    font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif"
  >🍎</text>
  
  <!-- Happy face emoji -->
  <text 
    x="${center}" 
    y="${center * 1.35}" 
    font-size="${fontSize}" 
    text-anchor="middle" 
    dominant-baseline="middle"
    font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif"
  >😊</text>
</svg>`;
};

// For now, let's use a simpler approach - create PNG using a library
// But first, let me check if we can use sharp or canvas
// Actually, let's create a script that uses sharp if available, otherwise fall back to a simple approach

async function generateIcons() {
  try {
    // Use sharp for high-quality PNG generation
    const sharpModule = await import('sharp');
    const sharp = sharpModule.default;
    
    const sizes = [192, 512];
    const publicDir = resolve('public');
    
    // Generate PWA icons
    for (const size of sizes) {
      const svg = Buffer.from(createIconSVG(size));
      const png = await sharp(svg)
        .resize(size, size)
        .png()
        .toBuffer();
      
      writeFileSync(resolve(publicDir, `pwa-${size}x${size}.png`), png);
      console.log(`Generated pwa-${size}x${size}.png`);
    }
    
    // Generate Apple touch icon (180x180)
    const appleTouchSvg = Buffer.from(createIconSVG(180));
    const appleTouchPng = await sharp(appleTouchSvg)
      .resize(180, 180)
      .png()
      .toBuffer();
    
    writeFileSync(resolve(publicDir, 'apple-touch-icon.png'), appleTouchPng);
    console.log('Generated apple-touch-icon.png');
    
    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();

