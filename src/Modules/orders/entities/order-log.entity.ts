import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { OrderEntity } from './order.entity';
import { OrderStatus } from '../../../utilies/enums/order-status.enum';

@Entity('order_logs')
export class OrderLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    nullable: true,
  })
  old_status?: OrderStatus;

  @Column({
    type: 'enum',
    enum: OrderStatus,
  })
  new_status: OrderStatus;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => OrderEntity, (order) => order.logs,{onDelete:'CASCADE',eager: true})
  order: OrderEntity;
}
