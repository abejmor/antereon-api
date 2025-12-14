import type { Config } from '../secrets.types';

export const mainConfig: Config = {
  database: {
    host: 'awssecret:database.host',
    port: 'awssecret:database.port',
    username: 'awssecret:database.username',
    password: 'awssecret:database.password',
    name: 'awssecret:database.name',
    synchronize: false,
    logging: false,
  },
  security: {
    jwtSecret: 'awssecret:security.jwtSecret',
    jwtExpiresIn: 'awssecret:security.jwtExpiresIn',
    encryptionKey: 'awssecret:security.encryptionKey',
  },
  server: {
    port: 'awssecret:server.port',
    corsOrigin: 'awssecret:server.corsOrigin',
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

export type ConfigKey = keyof typeof mainConfig;
