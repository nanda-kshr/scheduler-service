import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
  ArrayNotEmpty,
  IsArray as IsArrayValidator,
} from 'class-validator';

class TargetDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsIn(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
  method: string;
}

class SchedulingOneOffDto {
  @IsString()
  @IsNotEmpty()
  timezone: string;

  @IsDateString()
  execute_at: string;
}

class SchedulingRecurringDto {
  @IsString()
  @IsNotEmpty()
  cron: string; // basic validation only

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsDateString()
  @IsOptional()
  start_time?: string;
}

class RetriesDto {
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @IsInt()
  @IsOptional()
  max_attempts?: number;

  @IsArrayValidator()
  @IsOptional()
  retryable_statuses?: number[];

  @IsString()
  @IsOptional()
  on_failure?: string;
}

export class CreateJobDto {
  @IsIn(['oneoff', 'recurring'])
  type: 'oneoff' | 'recurring';

  @ValidateNested()
  @Type(() => TargetDto)
  target: TargetDto;

  @IsObject()
  @IsOptional()
  headers?: Record<string, string>;

  @IsObject()
  @IsOptional()
  params?: Record<string, any>;

  @IsObject()
  @IsOptional()
  payload?: any;

  @IsObject()
  @IsOptional()
  body?: any;

  // Scheduling can be either a one-off or recurring config depending on `type`.
  // Keep as an optional free-form object to avoid mis-applied nested decorators
  // that previously caused validation metadata to attach to the wrong field.
  @IsOptional()
  scheduling?: any;

  @ValidateNested()
  @Type(() => RetriesDto)
  @IsOptional()
  retries?: RetriesDto;
}
