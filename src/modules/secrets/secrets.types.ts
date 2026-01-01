export interface DatabaseConfig {
  host: string;
  port: string | number;
  username: string;
  password: string;
  name: string;
  synchronize?: boolean;
  logging?: boolean;
  dropSchema?: boolean;
}

export interface SecurityConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  encryptionKey: string;
}

export interface ServerConfig {
  port: string | number;
  corsOrigin: string | string[];
}

export interface Config {
  database: DatabaseConfig;
  security: SecurityConfig;
  server: ServerConfig;
}
