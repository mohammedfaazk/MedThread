import { cache } from './src/utils/simpleCache';

async function clearAuthRateLimit() {
  console.log('🧹 Clearing authentication rate limits...');
  
  try {
    // Clear all rate limit entries
    // The cache is in-memory, so we need to access it through the cache instance
    
    // Since we can't iterate over the cache directly, we'll clear common patterns
    const commonIPs = [
      '::1', // localhost IPv6
      '127.0.0.1', // localhost IPv4
      'localhost',
      '::ffff:127.0.0.1' // IPv4-mapped IPv6
    ];

    for (const ip of commonIPs) {
      await cache.delete(`rate_limit:${ip}`);
      console.log(`✅ Cleared rate limit for ${ip}`);
    }

    console.log('\n✅ Rate limits cleared successfully!');
    console.log('You can now try logging in again.');
    
  } catch (error: any) {
    console.error('❌ Error clearing rate limits:', error.message);
    process.exit(1);
  }
}

clearAuthRateLimit();
