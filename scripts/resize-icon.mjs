#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { existsSync } from 'fs';

async function resizeIcon(inputPath, outputSizes) {
  try {
    if (!existsSync(inputPath)) {
      console.error(`Error: Input file not found: ${inputPath}`);
      console.log('\nUsage: node scripts/resize-icon.mjs <path-to-image>');
      console.log('Example: node scripts/resize-icon.mjs ~/Downloads/foodmood-icon.png');
      process.exit(1);
    }

    const sharp = (await import('sharp')).default;
    const imageBuffer = readFileSync(inputPath);
    
    const publicDir = resolve(__dirname, '..', 'public');
    
    // Get original dimensions to maintain aspect ratio
    const metadata = await sharp(imageBuffer).metadata();
    console.log(`Original image: ${metadata.width}x${metadata.height}`);
    
    for (const size of outputSizes) {
      const outputPath = resolve(publicDir, `pwa-${size}x${size}.png`);
      await sharp(imageBuffer)
        .resize(size, size, {
          fit: 'cover', // Cover the entire area, may crop slightly
          position: 'center'
        })
        .png()
        .toFile(outputPath);
      console.log(`✓ Generated pwa-${size}x${size}.png`);
    }
    
    // Also generate apple-touch-icon (180x180)
    const appleTouchPath = resolve(publicDir, 'apple-touch-icon.png');
    await sharp(imageBuffer)
      .resize(180, 180, {
        fit: 'cover',
        position: 'center'
      })
      .png()
      .toFile(appleTouchPath);
    console.log('✓ Generated apple-touch-icon.png');
    
    console.log('\n✨ All icons resized successfully!');
  } catch (error) {
    console.error('Error resizing icon:', error.message);
    process.exit(1);
  }
}

// Get input file from command line argument
const inputFile = process.argv[2];

if (!inputFile) {
  console.error('Error: No input file specified');
  console.log('\nUsage: node scripts/resize-icon.mjs <path-to-image>');
  console.log('Example: node scripts/resize-icon.mjs ~/Downloads/foodmood-icon.png');
  console.log('\nOr save your image as "icon-source.png" in the public/ directory and run:');
  console.log('  node scripts/resize-icon.mjs public/icon-source.png');
  process.exit(1);
}

const fullPath = inputFile.startsWith('/') ? inputFile : resolve(process.cwd(), inputFile);
console.log(`Resizing icon from: ${fullPath}\n`);
resizeIcon(fullPath, [192, 512]);

