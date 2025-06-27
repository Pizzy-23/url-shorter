import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from '../../src/app.module';
import { Url } from '../../src/urls/entities/url.entity';

describe('RedirectController (e2e)', () => {
  let app: INestApplication;
  let urlRepository: Repository<Url>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    urlRepository = moduleFixture.get<Repository<Url>>(getRepositoryToken(Url));
  });

  afterEach(async () => {
    await urlRepository.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /:shortCode should redirect to the original URL and increment clicks', async () => {
    const originalUrl = 'https://google.com/';
    const testUrl = await urlRepository.save({
      originalUrl,
      shortCode: 'g00gle',
      clicks: 0,
    });

    expect(testUrl.clicks).toBe(0);

    const response = await request(app.getHttpServer())
      .get(`/${testUrl.shortCode}`)
      .redirects(0);

    expect(response.status).toBe(301);
    expect(response.headers.location).toBe(originalUrl);

    const updatedUrlInDb = await urlRepository.findOneBy({ id: testUrl.id });
    expect(updatedUrlInDb).toBeDefined();
    expect(updatedUrlInDb?.clicks).toBe(1);
  });

  it('GET /:shortCode should return 404 for a non-existent short code', () => {
    return request(app.getHttpServer())
      .get('/this-code-does-not-exist')
      .expect(404);
  });

  it('GET /:shortCode should return 404 for a soft-deleted URL', async () => {
    const deletedUrl = await urlRepository.save({
      originalUrl: 'https://deleted-url.com',
      shortCode: 'deletd',
      clicks: 10,
    });
    await urlRepository.softDelete({ id: deletedUrl.id });

    await request(app.getHttpServer()).get('/del3ted').expect(404);

    const urlInDb = await urlRepository.findOne({
      where: { id: deletedUrl.id },
      withDeleted: true,
    });
    expect(urlInDb?.clicks).toBe(10);
  });
});
