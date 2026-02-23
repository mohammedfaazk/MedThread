# Deployment Guide - Mobile-First PWA

## Pre-Deployment Checklist

### 1. Generate PWA Icons
```bash
# Install icon generator
npm install -g pwa-asset-generator

# Generate icons from your logo
pwa-asset-generator logo.png ./public/icons --icon-only --manifest ./public/manifest.json

# Or run the helper script
node scripts/generate-icons.js
```

### 2. Configure Environment Variables
```env
# .env.production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key_here
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com
```

### 3. Update Manifest
Edit `public/manifest.json`:
- Update `name` and `short_name`
- Verify `start_url`
- Update `theme_color` and `background_color`
- Add your domain to `scope`

### 4. Build and Test
```bash
# Build production bundle
npm run build

# Test production build locally
npm run start

# Run Lighthouse audit
npx lighthouse http://localhost:3000 --view
```

## Deployment Platforms

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Configure headers in vercel.json
```

**vercel.json**:
```json
{
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        },
        {
          "key": "Service-Worker-Allowed",
          "value": "/"
        }
      ]
    }
  ]
}
```

### Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

**netlify.toml**:
```toml
[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
    Service-Worker-Allowed = "/"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
```

### Docker
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

## Post-Deployment

### 1. Verify PWA Installation
- Open site in Chrome
- Check for install prompt
- Install app
- Verify standalone mode
- Test app shortcuts

### 2. Test Service Worker
- Open DevTools > Application > Service Workers
- Verify registration
- Test offline mode
- Check cache storage
- Verify updates work

### 3. Test Push Notifications
- Request notification permission
- Subscribe to push
- Send test notification
- Verify click-to-navigate
- Test unsubscribe

### 4. Performance Audit
```bash
# Run Lighthouse
npx lighthouse https://yourdomain.com --view

# Target scores:
# - PWA: 100
# - Performance: 90+
# - Accessibility: 95+
# - Best Practices: 95+
```

### 5. Mobile Testing
Test on real devices:
- iPhone (Safari)
- Android (Chrome)
- iPad (Safari)
- Android Tablet (Chrome)

### 6. Monitor
Set up monitoring:
- Google Analytics
- Sentry (error tracking)
- Web Vitals
- Service Worker analytics

## SSL/HTTPS Setup

PWA requires HTTPS. Most platforms provide this automatically:

### Vercel/Netlify
- Automatic SSL with Let's Encrypt
- Custom domain SSL included

### Custom Server
```bash
# Using Certbot
sudo certbot --nginx -d yourdomain.com
```

## CDN Configuration

### Cloudflare
```javascript
// Cache rules
- Cache Level: Standard
- Browser Cache TTL: Respect Existing Headers
- Always Online: On

// Page Rules
/sw.js
- Cache Level: Bypass
- Service Worker: Allowed
```

## Troubleshooting

### Service Worker Not Updating
```javascript
// Force update
navigator.serviceWorker.getRegistration().then(reg => {
  reg.update()
})

// Clear caches
caches.keys().then(names => {
  names.forEach(name => caches.delete(name))
})
```

### PWA Not Installing
- Verify HTTPS
- Check manifest.json is valid
- Ensure service worker registers
- Check browser console for errors
- Verify icons exist

### Push Notifications Not Working
- Verify VAPID keys
- Check HTTPS
- Ensure permission granted
- Test with browser console
- Check backend endpoint

## Performance Optimization

### Image Optimization
```bash
# Install sharp
npm install sharp

# Optimize images
npx sharp -i input.png -o output.webp
```

### Bundle Analysis
```bash
# Analyze bundle
npm run build
npx @next/bundle-analyzer
```

### Caching Strategy
```javascript
// Service worker cache strategy
- Static assets: Cache-first
- API calls: Network-first
- Images: Cache-first with expiration
- HTML: Network-first
```

## Monitoring & Analytics

### Google Analytics
```javascript
// Add to layout.tsx
<Script
  src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
  strategy="afterInteractive"
/>
```

### Web Vitals
```javascript
// pages/_app.tsx
export function reportWebVitals(metric) {
  console.log(metric)
  // Send to analytics
}
```

### Sentry
```bash
npm install @sentry/nextjs

# Initialize
npx @sentry/wizard -i nextjs
```

## Rollback Plan

### Quick Rollback
```bash
# Vercel
vercel rollback

# Netlify
netlify rollback

# Manual
git revert HEAD
git push
```

### Service Worker Rollback
```javascript
// Unregister service worker
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister())
})
```

## Maintenance

### Regular Tasks
- [ ] Update dependencies monthly
- [ ] Run security audits
- [ ] Check performance metrics
- [ ] Review error logs
- [ ] Test on new devices
- [ ] Update service worker
- [ ] Clear old caches

### Updates
```bash
# Update dependencies
npm update

# Check for outdated
npm outdated

# Security audit
npm audit fix
```

## Support

### Resources
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Web Vitals](https://web.dev/vitals/)

### Common Issues
- Service worker not updating → Clear cache
- PWA not installing → Check HTTPS and manifest
- Offline mode not working → Verify cache strategy
- Push notifications failing → Check VAPID keys
