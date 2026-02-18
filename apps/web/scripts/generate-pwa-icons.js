#!/usr/bin/env node

/**
 * PWA Icon Generator Script
 * 
 * This script generates all required PWA icons from a source image.
 * 
 * Usage:
 *   node scripts/generate-pwa-icons.js <source-image-path>
 * 
 * Example:
 *   node scripts/generate-pwa-icons.js public/medthread-logo-1.jpeg
 * 
 * Requirements:
 *   npm install sharp
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons(sourcePath) {
  // Validate source file exists
  if (!fs.existsSync(sourcePath)) {
    console.error(`❌ Source image not found: ${sourcePath}`);
    process.exit(1);
  }

  // Create icons directory if it doesn't exist
  const iconsDir = path.join(__dirname, '../public/icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
    console.log('✅ Created icons directory');
  }

  console.log(`📸 Generating PWA icons from: ${sourcePath}\n`);

  // Generate each icon size
  for (const size of ICON_SIZES) {
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    
    try {
      await sharp(sourcePath)
        .resize(size, size, {
          fit: 'cover',
          position: 'center'
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated ${size}x${size} icon`);
    } catch (error) {
      console.error(`❌ Failed to generate ${size}x${size} icon:`, error.message);
    }
  }

  console.log('\n🎉 PWA icons generated successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Verify icons in public/icons/');
  console.log('2. Test PWA installation');
  console.log('3. Run Lighthouse audit');
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('PWA Icon Generator\n');
  console.log('Usage: node scripts/generate-pwa-icons.js <source-image-path>');
  console.log('\nExample:');
  console.log('  node scripts/generate-pwa-icons.js public/medthread-logo-1.jpeg');
  console.log('\nNote: Requires sharp package (npm install sharp)');
  process.exit(0);
}

const sourcePath = path.resolve(args[0]);
generateIcons(sourcePath).catch(error => {
  console.error('❌ Error generating icons:', error);
  process.exit(1);
});
