import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn } from 'typeorm';

@Entity('availabilities')
export class Availability {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'event_id', type: 'varchar', length: 64 })
  @Index()
  eventId!: string;

  @Column({ name: 'user_id', type: 'varchar', length: 64 })
  @Index()
  userId!: string;

  @Column({ name: 'user_name', type: 'varchar', length: 100 })
  userName!: string;

  // Format slotu: "YYYY-MM-DD_HH:MM" np. "2026-09-20_19:00"
  @Column({ name: 'slot', type: 'varchar', length: 20 })
  @Index()
  slot!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
