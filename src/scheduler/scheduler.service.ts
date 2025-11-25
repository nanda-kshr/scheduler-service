import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobEntity } from './entities/job.entity';
import { CreateJobDto } from './dto/create-job.dto';
import { JobRunnerService } from './job-runner.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @InjectRepository(JobEntity)
    private readonly repo: Repository<JobEntity>,
    private readonly runner: JobRunnerService,
  ) {}

  async create(createDto: CreateJobDto): Promise<JobEntity> {
    const entity = this.repo.create({
      type: createDto.type,
      target_url: createDto.target.url,
      target_method: createDto.target.method,
      headers: createDto.headers ?? null,
      params: createDto.params ?? null,
      payload: createDto.payload ?? null,
      body: createDto.body ?? null,
      scheduling: createDto.scheduling ?? null,
      retries: createDto.retries ?? null,
      status: 'scheduled',
      attempt_count: 0,
    });

    const saved = await this.repo.save(entity);
    // immediately schedule the created job in the background runner
    try {
      await this.runner.scheduleNewJob(saved);
    } catch (err) {
      this.logger.warn('Failed scheduling job in runner: ' + String(err));
    }
    this.logger.log(`Job created ${saved.id} type=${saved.type}`);
    return saved;
  }

  async findAll(): Promise<JobEntity[]> {
    return this.repo.find({ order: { created_at: 'DESC' } });
  }

  async findOne(id: string) {
    return this.repo.findOneBy({ id });
  }

  async update(job: JobEntity) {
    return this.repo.save(job);
  }

  async remove(id: string): Promise<void> {
    const job = await this.repo.findOneBy({ id });
    if (!job) return;

    try {
      await this.runner.unscheduleJob(id);
    } catch (err) {
      this.logger.warn('Error unscheduling job in runner: ' + String(err));
    }

    await this.repo.remove(job);
    this.logger.log(`Job ${id} removed from persistence`);
  }

  async removeAll(): Promise<void> {
    // ask runner to unschedule all timers/cron tasks first
    try {
      await this.runner.unscheduleAll();
    } catch (err) {
      this.logger.warn('Error unscheduling all jobs in runner: ' + String(err));
    }

    // delete all job rows
    await this.repo.clear();
    this.logger.log('All jobs removed from persistence');
  }
}
