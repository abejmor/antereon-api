import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsObject,
  IsDateString,
} from 'class-validator';

export class CreateIOCAnalysisResultDto {
  @ApiProperty({ description: 'IOC value to analyze' })
  @IsString()
  iocValue: string;

  @ApiProperty({
    description: 'Type of IOC',
    enum: ['ip', 'domain', 'hash', 'url'],
  })
  @IsEnum(['ip', 'domain', 'hash', 'url'])
  iocType: 'ip' | 'domain' | 'hash' | 'url';

  @ApiProperty({ description: 'Provider used for analysis' })
  @IsString()
  provider: string;

  @ApiProperty({ description: 'Raw analysis result data from provider' })
  @IsObject()
  data: Record<string, any>;

  @ApiPropertyOptional({ description: 'Error message if analysis failed' })
  @IsOptional()
  @IsString()
  error?: string;

  @ApiProperty({ description: 'Timestamp when analysis was performed' })
  @IsDateString()
  analysisTimestamp: string;
}

export class IOCAnalysisResultResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  iocValue: string;

  @ApiProperty()
  iocType: 'ip' | 'domain' | 'hash' | 'url';

  @ApiProperty()
  provider: string;

  @ApiProperty({
    description: 'Analysis status',
    enum: ['success', 'error', 'pending'],
  })
  status: 'success' | 'error' | 'pending';

  @ApiProperty({ description: 'Raw analysis result data from provider' })
  apiData: Record<string, any>;

  @ApiPropertyOptional()
  error?: string;

  @ApiProperty()
  analysisTimestamp: Date;

  @ApiProperty()
  userId: string;
}


export class GetIOCAnalysisResultsQueryDto {
  @ApiPropertyOptional({ description: 'Filter by IOC type' })
  @IsOptional()
  @IsEnum(['ip', 'domain', 'hash', 'url'])
  iocType?: 'ip' | 'domain' | 'hash' | 'url';

  @ApiPropertyOptional({ description: 'Filter by provider' })
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiPropertyOptional({ description: 'Filter by IOC value' })
  @IsOptional()
  @IsString()
  iocValue?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    default: 1,
  })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page for pagination',
    default: 20,
  })
  @IsOptional()
  limit?: number;
}
