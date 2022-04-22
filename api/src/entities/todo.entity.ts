import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Todo {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column({ length: 100 })
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('datetime', { name: 'completed_at', precision: 0, default: null })
  completedAt: string | null = null;

  @Column('datetime', {
    name: 'created_at',
    precision: 0,
    default: null,
    nullable: false,
  })
  createdAt: string | null = null;

  @Column('datetime', {
    name: 'updated_at',
    precision: 0,
    default: null,
    nullable: false,
  })
  updatedAt: string | null = null;
}
