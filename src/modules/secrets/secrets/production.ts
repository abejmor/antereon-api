import { Config } from '../secrets.types';

export const productionConfig: Partial<Config> = {
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'change-me-in-production',
    name: process.env.DB_NAME || 'antereon',
    synchronize: false,
    logging: false,
  },
  security: {
    jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
    encryptionKey:
      process.env.ENCRYPTION_KEY || 'change-me-in-production-32-chars',
  },
  server: {
    port: parseInt(process.env.PORT || '3000'),
    corsOrigin: process.env.CORS_ORIGIN || 'https://antereon.com',
  },
  providers: {
    virustotal: {
      baseUrl: 'https://www.virustotal.com/vtapi/v2',
      timeout: 15000,
    },
    abuseipdb: {
      baseUrl: 'https://api.abuseipdb.com/api/v2',
      timeout: 15000,
    },
    alienvault: {
      baseUrl: 'https://otx.alienvault.com/api/v1',
      timeout: 15000,
    },
  },
};
