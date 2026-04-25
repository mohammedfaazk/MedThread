import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
  database: {
    url: string;
  };
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };
}

const getConfig = (): Config => {
  const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'];
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missingEnvVars.length > 0 && process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  }

  const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-in-production';
  console.log('[CONFIG] JWT_SECRET loaded:', jwtSecret.substring(0, 30) + '...');
  console.log('[CONFIG] JWT_SECRET length:', jwtSecret.length);

  return {
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: jwtSecret,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    },
    database: {
      url: process.env.DATABASE_URL || '',
    },
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
      apiKey: process.env.CLOUDINARY_API_KEY || '',
      apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    },
  };
};

export const config = getConfig();
