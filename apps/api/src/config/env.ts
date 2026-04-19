import dotenv from 'dotenv';
import path from 'path';

// Load environment variables BEFORE anything else
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Also try loading from root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

console.log('[ENV] DATABASE_URL loaded:', !!process.env.DATABASE_URL);
console.log('[ENV] DIRECT_URL loaded:', !!process.env.DIRECT_URL);
