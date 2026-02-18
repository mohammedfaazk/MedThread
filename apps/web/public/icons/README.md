# PWA Icons

Place your app icons in this directory with the following sizes:

## Required Sizes
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## Icon Guidelines
- Use PNG format with transparency
- Square aspect ratio (1:1)
- Minimum safe zone: 80% of icon size
- Support both light and dark backgrounds
- Use "maskable" design (important content in center 80%)

## Generation Tools
- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [Favicon.io](https://favicon.io/)

## Quick Generation
```bash
npx pwa-asset-generator logo.svg ./public/icons --icon-only --manifest ./public/manifest.json
```
