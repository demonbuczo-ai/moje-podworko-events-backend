import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn } from 'typeorm';

@Entity('feedbacks')
export class Feedback {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id', type: 'varchar', length: 64 })
  @Index()
  userId!: string;

  @Column({ name: 'user_name', type: 'varchar', length: 100 })
  userName!: string;

  // 'suggestion' | 'bug' | 'praise' | 'other'
  @Column({ type: 'varchar', length: 30, default: 'suggestion' })
  type!: string;

  @Column({ type: 'text' })
  text!: string;

  // 'new' | 'read' | 'done'
  @Column({ type: 'varchar', length: 20, default: 'new' })
  status!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
