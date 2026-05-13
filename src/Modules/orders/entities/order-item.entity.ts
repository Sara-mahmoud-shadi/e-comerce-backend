import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { OrderEntity } from './order.entity';
import { ProductEntity } from '../../products/entities/product.entity';
import { currentTimestamp } from 'src/utilies/constant';

@Entity('order_items')
export class OrderItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ProductEntity, {onDelete:'CASCADE',eager: true})
  product: ProductEntity;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @ManyToOne(() => OrderEntity, (order) => order.items , {onDelete:'CASCADE',eager: true})
  order: OrderEntity;

  @CreateDateColumn({ type: 'timestamp', default: () => currentTimestamp })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => currentTimestamp, onUpdate: currentTimestamp })
  updatedAt: Date;
}
