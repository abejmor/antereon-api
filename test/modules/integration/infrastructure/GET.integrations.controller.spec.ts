import { INestApplication } from '@nestjs/common';
import { testsAppModule } from '../../../test.app.module';
import request from 'supertest';
import { UserService } from '../../../../src/modules/user/domain/user.service';
import { IntegrationService } from '../../../../src/modules/integration/domain/integration.service';
import { JwtService } from '@nestjs/jwt';

describe('GET /integrations', () => {
  let app: INestApplication;
  let userService: UserService;
  let integrationService: IntegrationService;
  let jwtService: JwtService;

  beforeAll(async () => {
    const appModule = await testsAppModule();
    app = appModule.app;
    userService = appModule.nestModule.get(UserService);
    integrationService = appModule.nestModule.get(IntegrationService);
    jwtService = appModule.nestModule.get(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('yellow brick road', () => {
    it('should return all user integrations', async () => {
      const password = 'testPassword123';
      const userData = {
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        password,
      };

      const user = await userService.createUser(
        userData.name,
        userData.email,
        password,
      );

      const token = jwtService.sign({ sub: user.id, email: user.email });

      await integrationService.create(user.id, {
        provider: 'virustotal',
        name: 'VirusTotal API',
        apiKey: 'test-key-1',
        isDefault: true,
      });

      await integrationService.create(user.id, {
        provider: 'abuseipdb',
        name: 'AbuseIPDB API',
        apiKey: 'test-key-2',
        isDefault: false,
      });

      const response = await request(app.getHttpServer())
        .get('/integrations')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);

      expect((response.body as any[])[0]).toMatchObject({
        id: expect.any(String),
        provider: expect.any(String),
        name: expect.any(String),
        isActive: expect.any(Boolean),
        isDefault: expect.any(Boolean),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });

      expect((response.body as any[])[0]).not.toHaveProperty('apiKey');
      expect((response.body as any[])[0]).not.toHaveProperty('encryptedApiKey');
    });

    it('should return empty array when user has no integrations', async () => {
      const password = 'testPassword123';
      const userData = {
        name: 'Test User 2',
        email: `test2-${Date.now()}@example.com`,
        password,
      };

      const user = await userService.createUser(
        userData.name,
        userData.email,
        password,
      );

      const token = jwtService.sign({ sub: user.id, email: user.email });

      const response = await request(app.getHttpServer())
        .get('/integrations')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });
  });

  describe('error cases', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/integrations')
        .expect(401);

      expect((response.body as { message: string }).message).toBe(
        'Unauthorized',
      );
    });

    it('should return 401 when invalid token is provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/integrations')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect((response.body as { message: string }).message).toBe(
        'Unauthorized',
      );
    });

    it('should return 401 when expired token is provided', async () => {
      const expiredToken = jwtService.sign(
        { sub: '123', email: 'test@test.com' },
        { expiresIn: '-1h' },
      );

      const response = await request(app.getHttpServer())
        .get('/integrations')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect((response.body as { message: string }).message).toBe(
        'Unauthorized',
      );
    });
  });
});
