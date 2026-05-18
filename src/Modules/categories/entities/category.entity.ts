import { ProductEntity } from 'src/Modules/products/entities/product.entity';
import { currentTimestamp } from 'src/utilies/constant';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('categories')
export class CategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name_en: string;

  @Column()
  name_ar: string;

  @Column({ nullable: true })
  slug?: string;

  @Column({ type: 'text', nullable: true })
  image: string;

  @OneToMany(() => ProductEntity, (product) => product.category, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  products: ProductEntity[];

  @CreateDateColumn({ type: 'timestamp', default: () => currentTimestamp })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => currentTimestamp,
    onUpdate: currentTimestamp,
  })
  updatedAt: Date;
}
