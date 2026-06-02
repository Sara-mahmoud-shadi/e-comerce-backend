import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderStatus } from '../../../utilies/enums/order-status.enum';
import { OrderItemEntity } from './order-item.entity';
import { OrderLogEntity } from './order-log.entity';
import { currentTimestamp } from '../../../utilies/constant';

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  address: string;

  @Column({ unique: true })
  order_number: string;

  @Column()
  phone: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status_order: OrderStatus;

  @OneToMany(() => OrderItemEntity, (item) => item.order, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  items: OrderItemEntity[];

  @OneToMany(() => OrderLogEntity, (log) => log.order, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  logs: OrderLogEntity[];

  @CreateDateColumn({ type: 'timestamp', default: () => currentTimestamp })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => currentTimestamp,
    onUpdate: currentTimestamp,
  })
  updatedAt: Date;
}
