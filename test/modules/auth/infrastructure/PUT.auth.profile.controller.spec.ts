import { INestApplication } from '@nestjs/common';
import { testsAppModule } from '../../../test.app.module';
import request from 'supertest';
import { UserService } from '../../../../src/modules/user/domain/services/user.service';
import { JwtService } from '@nestjs/jwt';

describe('PUT /auth/profile', () => {
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

  describe('yellow brick road', () => {
    it('should update user profile successfully', async () => {
      const password = 'testPassword123';
      const userData = {
        name: 'Profile User',
        email: `profile-${Date.now()}@example.com`,
        password,
      };

      const user = await userService.createUser(
        userData.name,
        userData.email,
        password,
      );
      const token = jwtService.sign({ sub: user.id, email: user.email });

      const updateData = {
        name: 'Updated Name',
        theme: 'antereonLight',
      };

      const response = await request(app.getHttpServer())
        .put('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        id: user.id,
        name: updateData.name,
        email: user.email,
        isActive: true,
        theme: updateData.theme,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('should update only name when provided', async () => {
      const password = 'testPassword123';
      const userData = {
        name: 'Profile User 2',
        email: `profile2-${Date.now()}@example.com`,
        password,
      };

      const user = await userService.createUser(
        userData.name,
        userData.email,
        password,
      );

      const token = jwtService.sign({ sub: user.id, email: user.email });

      const updateData = {
        name: 'Only Name Updated',
      };

      const response = await request(app.getHttpServer())
        .put('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        id: user.id,
        name: updateData.name,
        email: user.email,
        isActive: true,
        theme: 'antereonDark',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });
  });

  describe('error cases', () => {
    it('should return 401 when no token is provided', async () => {
      const updateData = {
        name: 'Updated Name',
      };

      const response = await request(app.getHttpServer())
        .put('/auth/profile')
        .send(updateData)
        .expect(401);

      expect((response.body as { message: string }).message).toBe(
        'Unauthorized',
      );
    });

    it('should return 401 when invalid token is provided', async () => {
      const invalidToken = 'invalid.token.here';
      const updateData = {
        name: 'Updated Name',
      };

      const response = await request(app.getHttpServer())
        .put('/auth/profile')
        .set('Authorization', `Bearer ${invalidToken}`)
        .send(updateData)
        .expect(401);

      expect((response.body as { message: string }).message).toBe(
        'Unauthorized',
      );
    });

    it('should return 400 when email format is invalid', async () => {
      const password = 'testPassword123';
      const userData = {
        name: 'Profile User 3',
        email: `profile3-${Date.now()}@example.com`,
        password,
      };

      const user = await userService.createUser(
        userData.name,
        userData.email,
        password,
      );

      const token = jwtService.sign({ sub: user.id, email: user.email });

      const updateData = {
        email: 'invalid-email-format',
      };

      const response = await request(app.getHttpServer())
        .put('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(400);

      expect((response.body as { message: string[] }).message).toContain(
        'email format is invalid',
      );
    });
  });
});
