import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobEntity } from './entities/job.entity';
import { SchedulerController } from './scheduler.controller';
import { SchedulerService } from './scheduler.service';
import { JobRunnerService } from './job-runner.service';

@Module({
  imports: [TypeOrmModule.forFeature([JobEntity])],
  controllers: [SchedulerController],
  providers: [SchedulerService, JobRunnerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
