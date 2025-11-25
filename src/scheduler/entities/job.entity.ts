import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type JobType = 'oneoff' | 'recurring';

export type JobStatus = 'scheduled' | 'running' | 'failed' | 'completed' | 'paused';

@Entity('jobs')
export class JobEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  type: JobType;

  @Column({ type: 'varchar' })
  target_url: string;

  @Column({ type: 'varchar' })
  target_method: string;

  @Column({ type: 'json', nullable: true })
  headers: Record<string, string> | null;

  @Column({ type: 'json', nullable: true })
  params: Record<string, any> | null;

  @Column({ type: 'json', nullable: true })
  payload: any | null;

  @Column({ type: 'json', nullable: true })
  body: any | null;

  @Column({ type: 'json', nullable: true })
  scheduling: any | null;

  @Column({ type: 'json', nullable: true })
  retries: any | null;

  @Column({ type: 'varchar', default: 'scheduled' })
  status: JobStatus;

  @Column({ type: 'int', default: 0 })
  attempt_count: number;

  @Column({ type: 'text', nullable: true })
  last_error: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
