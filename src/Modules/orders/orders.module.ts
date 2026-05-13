import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrderEntity } from './entities/order.entity';
import { OrderItemEntity } from './entities/order-item.entity';
import { OrderLogEntity } from './entities/order-log.entity';
import { ProductEntity } from '../products/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, OrderItemEntity, OrderLogEntity, ProductEntity]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
