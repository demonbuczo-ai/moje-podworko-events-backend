import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'event_id', type: 'varchar', length: 64, unique: true })
  @Index()
  eventId!: string;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text', default: '' })
  description!: string;

  @Column({ name: 'owner_id', type: 'varchar', length: 64 })
  @Index()
  ownerId!: string;

  @Column({ name: 'owner_name', type: 'varchar', length: 100, default: '' })
  ownerName!: string;

  // 'poll' (z ankieta) lub 'quick' (szybkie wyjscie)
  @Column({ type: 'varchar', length: 20, default: 'poll' })
  type!: string;

  // 'collecting' | 'finalized' | 'cancelled'
  @Column({ type: 'varchar', length: 20, default: 'collecting' })
  status!: string;

  // Zakres dni dla ankiety (YYYY-MM-DD)
  @Column({ name: 'date_from', type: 'varchar', length: 10, nullable: true })
  dateFrom!: string | null;

  @Column({ name: 'date_to', type: 'varchar', length: 10, nullable: true })
  dateTo!: string | null;

  // Godziny (HH:MM)
  @Column({ name: 'hour_from', type: 'varchar', length: 5, default: '16:00' })
  hourFrom!: string;

  @Column({ name: 'hour_to', type: 'varchar', length: 5, default: '23:00' })
  hourTo!: string;

  // Deadline odpowiedzi
  @Column({ name: 'deadline', type: 'datetime', nullable: true })
  deadline!: Date | null;

  // Finalny termin (ustalony po zamknieciu)
  @Column({ name: 'final_slot', type: 'varchar', length: 100, nullable: true })
  finalSlot!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
