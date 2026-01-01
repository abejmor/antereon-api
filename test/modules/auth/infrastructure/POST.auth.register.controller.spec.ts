import { INestApplication } from '@nestjs/common';
import { testsAppModule } from '../../../test.app.module';
import request from 'supertest';
import { AuthResponseDto } from '../../../../src/modules/auth/infrastructure/auth.dto';

describe('POST /auth/register', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const appModule = await testsAppModule();
    app = appModule.app;
  }, 10000);

  afterAll(async () => {
    await app.close();
  });

  describe('yellow brick road', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Register User',
        email: `register-${Date.now()}@example.com`,
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData)
        .expect(201);

      const expected: AuthResponseDto = {
        user: {
          id: expect.any(String),
          name: userData.name,
          email: userData.email,
          isActive: true,
          theme: 'antereonDark',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
        accessToken: expect.any(String),
      };

      expect(response.body).toEqual(expected);
      expect((response.body as AuthResponseDto).accessToken).toBeTruthy();
    });
  });

  describe('error cases', () => {
    it('should return 400 when email is invalid', async () => {
      const userData = {
        name: 'Invalid Email User',
        email: 'invalid-email',
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect((response.body as { message: string }).message).toContain(
        'email format is invalid',
      );
    });

    it('should return 400 when name is missing', async () => {
      const userData: any = {
        email: `no-name-${Date.now()}@example.com`,
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect((response.body as { message: string }).message).toContain(
        'name cannot be empty',
      );
    });

    it('should return 400 when password is missing', async () => {
      const userData: any = {
        name: 'No Password User',
        email: `no-pass-${Date.now()}@example.com`,
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect((response.body as { message: string }).message).toContain(
        'password cannot be empty',
      );
    });

    it('should return 409 when email already exists', async () => {
      const userData = {
        name: 'Existing User',
        email: `existing-${Date.now()}@example.com`,
        password: 'password123',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData)
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData)
        .expect(409);

      expect((response.body as { message: string }).message).toContain(
        'email already exists',
      );
    });
  });
});
