import { Config } from '../secrets.types';

export const developmentConfig: Partial<Config> = {
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'dev_password_123',
    name: process.env.DB_NAME || 'antereon',
    synchronize: true,
    logging: true,
  },
  security: {
    jwtSecret: process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    encryptionKey:
      process.env.ENCRYPTION_KEY || 'dev-encryption-key-32-chars-long',
  },
  server: {
    port: parseInt(process.env.PORT || '3000'),
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  providers: {
    virustotal: {
      baseUrl: 'https://www.virustotal.com/vtapi/v2',
      timeout: 10000,
    },
    abuseipdb: {
      baseUrl: 'https://api.abuseipdb.com/api/v2',
      timeout: 10000,
    },
    alienvault: {
      baseUrl: 'https://otx.alienvault.com/api/v1',
      timeout: 10000,
    },
  },
};
