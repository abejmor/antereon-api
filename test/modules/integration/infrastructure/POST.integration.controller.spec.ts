import { INestApplication } from '@nestjs/common';
import { testsAppModule } from '../../../test.app.module';
import request from 'supertest';
import { UserService } from '../../../../src/modules/user/domain/services/user.service';
import { JwtService } from '@nestjs/jwt';

describe('POST /integrations', () => {
  let app: INestApplication;
  let userService: UserService;
  let jwtService: JwtService;

  beforeAll(async () => {
    const appModule = await testsAppModule();
    app = appModule.app;
    userService = appModule.nestModule.get(UserService);
    jwtService = appModule.nestModule.get(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('yellow brick road', () => {
    it('should create integration successfully', async () => {
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

      const createIntegrationData = {
        provider: 'virustotal',
        name: 'My VirusTotal API',
        apiKey: 'test-api-key-virustotal-123',
        isDefault: true,
        configuration: {
          maxRequests: 1000,
          timeout: 30,
        },
      };

      const response = await request(app.getHttpServer())
        .post('/integrations')
        .set('Authorization', `Bearer ${token}`)
        .send(createIntegrationData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        provider: 'virustotal',
        name: 'My VirusTotal API',
        isActive: true,
        isDefault: true,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });

      expect(response.body).not.toHaveProperty('apiKey');
      expect(response.body).not.toHaveProperty('encryptedApiKey');
    });

    it('should create integration with minimal data', async () => {
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

      const createIntegrationData = {
        provider: 'abuseipdb',
        name: 'AbuseIPDB Integration',
        apiKey: 'test-api-key-abuseipdb-456',
      };

      const response = await request(app.getHttpServer())
        .post('/integrations')
        .set('Authorization', `Bearer ${token}`)
        .send(createIntegrationData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        provider: 'abuseipdb',
        name: 'AbuseIPDB Integration',
        isActive: true,
        isDefault: false,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });
  });

  describe('error cases', () => {
    it('should return 401 when no token is provided', async () => {
      const createIntegrationData = {
        provider: 'virustotal',
        name: 'My VirusTotal API',
        apiKey: 'test-api-key',
      };

      const response = await request(app.getHttpServer())
        .post('/integrations')
        .send(createIntegrationData)
        .expect(401);

      expect((response.body as { message: string }).message).toBe(
        'Unauthorized',
      );
    });

    it('should return 400 when provider is missing', async () => {
      const password = 'testPassword123';
      const userData = {
        name: 'Integration Fail User',
        email: `int-fail-${Date.now()}@example.com`,
        password,
      };

      const user = await userService.createUser(
        userData.name,
        userData.email,
        password,
      );

      const token = jwtService.sign({ sub: user.id, email: user.email });

      const createIntegrationData = {
        name: 'My Integration',
        apiKey: 'test-api-key',
      };

      const response = await request(app.getHttpServer())
        .post('/integrations')
        .set('Authorization', `Bearer ${token}`)
        .send(createIntegrationData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 when name is missing', async () => {
      const password = 'testPassword123';
      const userData = {
        name: 'Integration Fail User 2',
        email: `int-fail2-${Date.now()}@example.com`,
        password,
      };

      const user = await userService.createUser(
        userData.name,
        userData.email,
        password,
      );

      const token = jwtService.sign({ sub: user.id, email: user.email });

      const createIntegrationData = {
        provider: 'virustotal',
        apiKey: 'test-api-key',
      };

      const response = await request(app.getHttpServer())
        .post('/integrations')
        .set('Authorization', `Bearer ${token}`)
        .send(createIntegrationData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 when apiKey is missing', async () => {
      const password = 'testPassword123';
      const userData = {
        name: 'Integration Fail User 3',
        email: `int-fail3-${Date.now()}@example.com`,
        password,
      };

      const user = await userService.createUser(
        userData.name,
        userData.email,
        password,
      );

      const token = jwtService.sign({ sub: user.id, email: user.email });

      const createIntegrationData = {
        provider: 'virustotal',
        name: 'My Integration',
      };

      const response = await request(app.getHttpServer())
        .post('/integrations')
        .set('Authorization', `Bearer ${token}`)
        .send(createIntegrationData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 when provider name is too long', async () => {
      const password = 'testPassword123';
      const userData = {
        name: 'Integration Fail User 4',
        email: `int-fail4-${Date.now()}@example.com`,
        password,
      };

      const user = await userService.createUser(
        userData.name,
        userData.email,
        password,
      );

      const token = jwtService.sign({ sub: user.id, email: user.email });

      const createIntegrationData = {
        provider: 'a'.repeat(101),
        name: 'My Integration',
        apiKey: 'test-api-key',
      };

      const response = await request(app.getHttpServer())
        .post('/integrations')
        .set('Authorization', `Bearer ${token}`)
        .send(createIntegrationData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });
});
