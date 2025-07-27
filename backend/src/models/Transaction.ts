import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Category } from './Category';

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense'
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id!: number;
  
  @Column('decimal', { precision: 10, scale: 2 })
  amount!: number;
  
  @Column('varchar', { length: 10 }) // SQLite compatible, but PostgreSQL ENUM ready
  type!: TransactionType;
  
  @Column()
  description!: string;
  
  @Column({ type: 'date' })
  date!: Date;
  
  @ManyToOne(() => User, user => user.transactions) 
  @JoinColumn({ name: 'userId' }) 
  user!: User;
  
  @Column()
  userId!: number;
  
  @ManyToOne(() => Category, category => category.transactions) 
  @JoinColumn({ name: 'categoryId' }) 
  category!: Category;
  
  @Column()
  categoryId!: number;
  
  @CreateDateColumn()
  createdAt!: Date;
  
  @UpdateDateColumn()
  updatedAt!: Date;
} 