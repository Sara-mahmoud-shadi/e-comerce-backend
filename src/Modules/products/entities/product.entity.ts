import { CategoryEntity } from '../../categories/entities/category.entity';
import { currentTimestamp } from '../../../utilies/constant';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('products')
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: '' })
  name_en: string;

  @Column({ default: '' })
  name_ar: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price_discount?: string;

  @Column({ default: true })
  instock: boolean;

  @Column({ nullable: true })
  slug?: string;

  @ManyToOne(() => CategoryEntity, (category) => category.products, {
    onDelete: 'CASCADE',
    eager: true,
  })
  category: CategoryEntity;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column({ nullable: true })
  tax?: number;

  @CreateDateColumn({ type: 'timestamp', default: () => currentTimestamp })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => currentTimestamp,
    onUpdate: currentTimestamp,
  })
  updatedAt: Date;
}
