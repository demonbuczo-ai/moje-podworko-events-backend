import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn } from 'typeorm';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'message_id', type: 'varchar', length: 64, unique: true })
  @Index()
  messageId!: string;

  @Column({ name: 'event_id', type: 'varchar', length: 64 })
  @Index()
  eventId!: string;

  @Column({ name: 'user_id', type: 'varchar', length: 64 })
  userId!: string;

  @Column({ name: 'user_name', type: 'varchar', length: 100 })
  userName!: string;

  @Column({ type: 'text' })
  text!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
