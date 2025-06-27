import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from '../../src/app.module';
import { Url } from '../../src/urls/entities/url.entity';
import { User } from '../../src/user/entities/user.entity';

describe('UrlController (e2e)', () => {
  let app: INestApplication;
  let urlRepository: Repository<Url>;
  let userRepository: Repository<User>;
  let accessToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    urlRepository = moduleFixture.get<Repository<Url>>(getRepositoryToken(Url));
    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );

    const userRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'url-test-user@example.com', password: 'password123' });

    userId = userRes.body.id;

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'url-test-user@example.com', password: 'password123' });

    accessToken = loginRes.body.accessToken;
  });

  afterEach(async () => {
    await urlRepository.delete({ userId: userId });
  });

  afterAll(async () => {
    await userRepository.delete({ id: userId });
    await app.close();
  });

  it('POST /urls/shorten -> should create a short URL for an authenticated user', () => {
    return request(app.getHttpServer())
      .post('/urls/shorten')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ originalUrl: 'https://docs.nestjs.com/' })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('shortUrl');
        expect(res.body.shortUrl).toContain('http://localhost:3000/');
      });
  });

  it('GET /urls -> should list URLs for the authenticated user', async () => {
    await urlRepository.save({
      originalUrl: 'https://test-list.com',
      shortCode: 'list01',
      userId: userId,
    });

    const response = await request(app.getHttpServer())
      .get('/urls')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
    expect(response.body[0].shortCode).toBe('list01');
    expect(response.body[0]).toHaveProperty('clicks');
  });

  it('PATCH /urls/:shortCode -> should update the original URL', async () => {
    const url = await urlRepository.save({
      originalUrl: 'https://before-update.com',
      shortCode: 'upd4t',
      userId: userId,
    });
    const newDestination = 'https://after-update.com';

    await request(app.getHttpServer())
      .patch(`/urls/${url.shortCode}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ originalUrl: newDestination })
      .expect(200);

    const updatedUrlInDb = await urlRepository.findOneBy({ id: url.id });
    expect(updatedUrlInDb?.originalUrl).toBe(newDestination);
  });

  it('DELETE /urls/:shortCode -> should soft-delete the URL', async () => {
    const url = await urlRepository.save({
      originalUrl: 'https://to-be-deleted.com',
      shortCode: 'deletd',
      userId: userId,
    });

    await request(app.getHttpServer())
      .delete(`/urls/${url.shortCode}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);

    const deletedUrl = await urlRepository.findOneBy({ id: url.id });
    expect(deletedUrl).toBeNull();

    const deletedUrlWithFlag = await urlRepository.findOne({
      where: { id: url.id },
      withDeleted: true,
    });
    expect(deletedUrlWithFlag).toBeDefined();
    expect(deletedUrlWithFlag?.deletedAt).not.toBeNull();
  });
});
