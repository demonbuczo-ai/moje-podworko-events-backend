import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn } from 'typeorm';

@Entity('participants')
export class Participant {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'participant_id', type: 'varchar', length: 64, unique: true })
  @Index()
  participantId!: string;

  @Column({ name: 'event_id', type: 'varchar', length: 64 })
  @Index()
  eventId!: string;

  // Identyfikator uzytkownika (na razie dowolny string - np. z localStorage)
  @Column({ name: 'user_id', type: 'varchar', length: 64 })
  @Index()
  userId!: string;

  // Imie/nick wyswietlany
  @Column({ name: 'user_name', type: 'varchar', length: 100 })
  userName!: string;

  // 'invited' | 'joined' | 'declined'
  @Column({ type: 'varchar', length: 20, default: 'joined' })
  status!: string;

  // Czy to organizator
  @Column({ name: 'is_owner', type: 'boolean', default: false })
  isOwner!: boolean;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt!: Date;
}
