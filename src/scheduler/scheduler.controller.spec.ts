import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
const request = require('supertest');
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulerModule } from './scheduler.module';
import { JobEntity } from './entities/job.entity';

describe('SchedulerController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [JobEntity],
          synchronize: true,
          logging: false,
        }),
        SchedulerModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  it('/jobs (POST) create oneoff job and list it (GET)', async () => {
    const body = {
      type: 'oneoff',
      target: { url: 'https://example.invalid/ingest', method: 'POST' },
      headers: { 'Content-Type': 'application/json' },
      params: {},
      payload: { foo: 'bar' },
      scheduling: { timezone: 'UTC', execute_at: '2099-01-01T00:00:00Z' },
      retries: { enabled: true, max_attempts: 3, retryable_statuses: [429, 500] },
    };

    const res = await request(app.getHttpServer()).post('/jobs').send(body).expect(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.status).toBe('scheduled');

    const list = await request(app.getHttpServer()).get('/jobs').expect(200);
    expect(Array.isArray(list.body)).toBe(true);
    expect(list.body.length).toBeGreaterThanOrEqual(1);
  });

  it('/jobs (POST) create recurring job', async () => {
    const body = {
      type: 'recurring',
      target: { url: 'https://example.invalid/run', method: 'GET' },
      headers: {},
      payload: {},
      body: {},
      scheduling: { cron: '0 0 * * *', timezone: 'UTC', start_time: '2099-01-01T00:00:00Z' },
      retries: { enabled: true, max_attempts: 2 },
    };

    const res = await request(app.getHttpServer()).post('/jobs').send(body).expect(201);
    expect(res.body.id).toBeDefined();
  });
});
