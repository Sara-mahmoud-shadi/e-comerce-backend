import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm'; 
import { CartItemEntity } from './cart-item.entity';
import { currentTimestamp } from 'src/utilies/constant';

@Entity('carts')
export class CartEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  userId?: number;

  @OneToMany(() => CartItemEntity, (item) => item.cart, { cascade: true,onDelete:'CASCADE' })
  CartItems: CartItemEntity[];

  @CreateDateColumn({ type: 'timestamp', default: () => currentTimestamp })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => currentTimestamp, onUpdate: currentTimestamp })
  updatedAt: Date;
}
