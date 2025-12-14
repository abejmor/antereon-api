import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '@/modules/user/domain/user.entity';

@Entity('ioc_analysis_results')
@Index(['userId', 'iocValue', 'iocType'])
export class IOCAnalysisResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 500 })
  iocValue: string;

  @Column({ type: 'varchar', length: 50 })
  iocType: 'ip' | 'domain' | 'hash' | 'url';

  @Column({ type: 'varchar', length: 50 })
  provider: string;

  @Column({ type: 'varchar', length: 20 })
  status: 'success' | 'error' | 'pending';

  @Column({ type: 'json' })
  data: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  error?: string;

  @Column({ type: 'timestamp' })
  analysisTimestamp: Date;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
