import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CartEntity } from './cart.entity';
import { ProductEntity } from '../../products/entities/product.entity';
import { currentTimestamp } from 'src/utilies/constant';

@Entity('cart_items')
export class CartItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CartEntity, (cart) => cart.CartItems , { onDelete:'CASCADE'})
  cart: CartEntity;

  @ManyToOne(() => ProductEntity, {onDelete:'CASCADE'})
  product: ProductEntity;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ default: 1 })
  quantity: number;

    @CreateDateColumn({ type: 'timestamp', default: () => currentTimestamp })
    createdAt: Date;
  
    @UpdateDateColumn({ type: 'timestamp', default: () => currentTimestamp, onUpdate: currentTimestamp })
    updatedAt: Date;
}
