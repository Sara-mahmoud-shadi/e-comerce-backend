import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { ProductEntity } from '../products/entities/product.entity';
import { CategoryEntity } from '../categories/entities/category.entity';
import { OrderEntity } from '../orders/entities/order.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity, CategoryEntity, OrderEntity])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
