import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import bcrypt = require('bcrypt');

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column({
    length: 20,
    unique: true,
    nullable: false,
  })
  username: string;

  @Column({
    length: 255,
    unique: true,
    nullable: false,
  })
  email: string;

  @Column({
    length: 255,
    nullable: false,
    transformer: {
      to: (raw: string) => bcrypt.hashSync(raw, 5),
      from: (hashed: string) => hashed,
    },
  })
  password: string;

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

  @Column('datetime', {
    name: 'deleted_at',
    precision: 0,
    default: null,
    nullable: true,
  })
  deletedAt: string | null = null;
}
