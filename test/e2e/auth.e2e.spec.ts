import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';

import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '@/user/entities/user.entity';
import { Repository } from 'typeorm';
import { AppModule } from '../../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

  const testUser = {
    email: 'test-e2e@example.com',
    password: 'password123',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
  });

  afterEach(async () => {
    await userRepository.delete({ email: testUser.email });
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/register (POST) - should register a user and return it', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.email).toEqual(testUser.email);
        expect(res.body).not.toHaveProperty('password');
      });
  });

  it('/auth/register (POST) - should fail if email already exists', async () => {
    await request(app.getHttpServer()).post('/auth/register').send(testUser);

    return request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(409);
  });

  it('/auth/login (POST) - should login a user and return an access token', async () => {
    await request(app.getHttpServer()).post('/auth/register').send(testUser);

    return request(app.getHttpServer())
      .post('/auth/login')
      .send(testUser)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('accessToken');
        expect(typeof res.body.accessToken).toBe('string');
      });
  });

  it('/auth/login (POST) - should fail with invalid credentials', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testUser.email, password: 'wrongpassword' })
      .expect(401);
  });
});
