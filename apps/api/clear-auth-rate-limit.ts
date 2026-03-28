import { cache } from './src/utils/simpleCache';

async function clearAuthRateLimit() {
    try {
        // Clear rate limit for the IP (assuming localhost)
        const keys = [
            'rate_limit:::1',
            'rate_limit:::ffff:127.0.0.1',
            'rate_limit:127.0.0.1',
            'rate_limit:localhost',
            'rate_limit:unknown',
            // Auth-specific rate limit keys
            'auth_rate_limit:::1',
            'auth_rate_limit:::ffff:127.0.0.1',
            'auth_rate_limit:127.0.0.1',
            'auth_rate_limit:localhost',
            'auth_rate_limit:unknown'
        ];

        for (const key of keys) {
            await cache.delete(key);
            console.log(`✓ Cleared rate limit for key: ${key}`);
        }

        console.log('\n✅ Rate limit cleared successfully!');
        console.log('You can now log in again.');

    } catch (error) {
        console.error('Error:', error);
    }
}

clearAuthRateLimit();
