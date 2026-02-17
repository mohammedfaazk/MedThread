/**
 * CDN Utilities for image optimization
 * Cloudinary is already configured as our CDN
 */

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number | 'auto';
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  crop?: 'fill' | 'fit' | 'scale' | 'thumb';
  gravity?: 'auto' | 'face' | 'center';
  blur?: number;
}

/**
 * Transform Cloudinary URL with optimizations
 */
export function transformCloudinaryUrl(
  url: string,
  options: ImageTransformOptions = {}
): string {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    gravity = 'auto',
    blur,
  } = options;

  const transformations: string[] = [];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);
  if (crop) transformations.push(`c_${crop}`);
  if (gravity) transformations.push(`g_${gravity}`);
  if (blur) transformations.push(`e_blur:${blur}`);

  const transformString = transformations.join(',');

  // Replace /upload/ with /upload/{transformations}/
  return url.replace('/upload/', `/upload/${transformString}/`);
}

/**
 * Get responsive image srcset for Cloudinary
 */
export function getResponsiveSrcSet(url: string, widths: number[] = [640, 750, 828, 1080, 1200]): string {
  if (!url || !url.includes('cloudinary.com')) {
    return '';
  }

  return widths
    .map((width) => {
      const transformedUrl = transformCloudinaryUrl(url, { width, quality: 'auto', format: 'auto' });
      return `${transformedUrl} ${width}w`;
    })
    .join(', ');
}

/**
 * Get thumbnail URL
 */
export function getThumbnail(url: string, size: number = 150): string {
  return transformCloudinaryUrl(url, {
    width: size,
    height: size,
    crop: 'thumb',
    gravity: 'face',
    quality: 'auto',
    format: 'auto',
  });
}

/**
 * Get blur placeholder
 */
export function getBlurPlaceholder(url: string): string {
  return transformCloudinaryUrl(url, {
    width: 10,
    quality: 10,
    format: 'auto',
    blur: 1000,
  });
}

/**
 * Preload critical images
 */
export function preloadImage(url: string, options: ImageTransformOptions = {}): void {
  if (typeof window === 'undefined') return;

  const optimizedUrl = transformCloudinaryUrl(url, options);
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = optimizedUrl;
  document.head.appendChild(link);
}

/**
 * CDN configuration
 */
export const CDN_CONFIG = {
  cloudinary: {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dfcuazlhm',
    baseUrl: 'https://res.cloudinary.com',
  },
  defaultQuality: 'auto',
  defaultFormat: 'auto',
  responsiveWidths: [640, 750, 828, 1080, 1200, 1920],
};
