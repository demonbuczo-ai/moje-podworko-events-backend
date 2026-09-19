import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn } from 'typeorm';

@Entity('analytics')
export class Analytics {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id', type: 'varchar', length: 64 })
  @Index()
  userId!: string;

  // 'visit' | 'create_event' | 'join_event' | 'answer_availability' | 'send_message' | 'open_feedback'
  @Column({ name: 'event_type', type: 'varchar', length: 50 })
  @Index()
  eventType!: string;

  @Column({ name: 'event_id', type: 'varchar', length: 64, nullable: true })
  eventId!: string | null;

  @Column({ name: 'metadata', type: 'text', nullable: true })
  metadata!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
