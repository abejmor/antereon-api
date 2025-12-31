import { INestApplication } from '@nestjs/common';
import { testsAppModule } from '../../../test.app.module';
import request from 'supertest';
import { AuthResponseDto } from '../../../../src/modules/auth/infrastructure/auth.dto';
import { UserService } from '../../../../src/modules/user/domain/services/user.service';

describe('POST /auth/login', () => {
  let app: INestApplication;
  let userService: UserService;

  beforeAll(async () => {
    const { app: testApp, nestModule } = await testsAppModule();
    app = testApp;
    userService = nestModule.get<UserService>(UserService);
  }, 10000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('yellow brick road', () => {
    it('should login successfully with valid credentials', async () => {
      const password = 'password123';
      const userData = {
        name: 'Login User',
        email: `login-${Date.now()}@example.com`,
        password,
      };

      const user = await userService.createUser(
        userData.name,
        userData.email,
        password,
      );

      const loginData = {
        email: user.email,
        password: password,
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      const expected = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isActive: true,
          theme: 'antereonDark',
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
        accessToken: expect.any(String) as string,
      };

      expect(response.body).toEqual(expected);
      expect((response.body as AuthResponseDto).accessToken).toBeTruthy();
    });
  });

  describe('error cases', () => {
    it('should return 401 when user does not exist', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect((response.body as { message: string }).message).toBe(
        'Invalid credentials',
      );
    });

    it('should return 401 when password is incorrect', async () => {
      const password = 'correctPassword123';
      const userData = {
        name: 'Login Fail User',
        email: `login-fail-${Date.now()}@example.com`,
        password,
      };

      const user = await userService.createUser(
        userData.name,
        userData.email,
        password,
      );

      const loginData = {
        email: user.email,
        password: 'wrongPassword',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect((response.body as { message: string }).message).toBe(
        'Invalid credentials',
      );
    });

    it('should return 400 when email is missing', async () => {
      const loginData = {
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(400);

      expect((response.body as { message: string[] }).message).toContain(
        'email cannot be empty',
      );
    });

    it('should return 400 when password is missing', async () => {
      const loginData = {
        email: 'test@example.com',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(400);

      expect((response.body as { message: string[] }).message).toContain(
        'password cannot be empty',
      );
    });
  });
});
