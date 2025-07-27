import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Transaction } from './Transaction';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  READ_ONLY = 'read-only'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;
  
  @Column({ unique: true })
  email!: string;
  
  @Column()
  password!: string;
  
  @Column('varchar', { length: 20, default: 'user' }) // SQLite compatible, but PostgreSQL ENUM ready
  role!: UserRole;
  
  @Column({ nullable: true })
  firstName!: string;
  
  @Column({ nullable: true })
  lastName!: string;
  
  @CreateDateColumn()
  createdAt!: Date;
  
  @UpdateDateColumn()
  updatedAt!: Date;
  
  @OneToMany(() => Transaction, transaction => transaction.user)
  transactions!: Transaction[];
} 