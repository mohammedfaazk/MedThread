#!/usr/bin/env node

/**
 * Icon Generation Script
 * 
 * This script helps generate PWA icons from a source image.
 * 
 * Usage:
 *   node scripts/generate-icons.js path/to/logo.png
 * 
 * Requirements:
 *   npm install -g pwa-asset-generator
 * 
 * Or use online tools:
 *   - https://realfavicongenerator.net/
 *   - https://favicon.io/
 */

const fs = require('fs')
const path = require('path')

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512]
const ICONS_DIR = path.join(__dirname, '../public/icons')

console.log('📱 PWA Icon Generator')
console.log('====================\n')

// Check if icons directory exists
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true })
  console.log('✅ Created icons directory')
}

console.log('Required icon sizes:')
ICON_SIZES.forEach(size => {
  const filename = `icon-${size}x${size}.png`
  const filepath = path.join(ICONS_DIR, filename)
  const exists = fs.existsSync(filepath)
  console.log(`  ${exists ? '✅' : '❌'} ${filename}`)
})

console.log('\n📝 To generate icons:')
console.log('1. Install pwa-asset-generator:')
console.log('   npm install -g pwa-asset-generator')
console.log('\n2. Generate icons from your logo:')
console.log('   pwa-asset-generator logo.png ./public/icons --icon-only')
console.log('\n3. Or use online tools:')
console.log('   - https://realfavicongenerator.net/')
console.log('   - https://favicon.io/')
console.log('   - https://www.pwabuilder.com/')

// Check if source image provided
const sourceImage = process.argv[2]
if (sourceImage && fs.existsSync(sourceImage)) {
  console.log(`\n🎨 Source image found: ${sourceImage}`)
  console.log('Run this command to generate icons:')
  console.log(`pwa-asset-generator ${sourceImage} ./public/icons --icon-only --manifest ./public/manifest.json`)
}
