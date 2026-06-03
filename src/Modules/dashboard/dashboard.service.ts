import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../products/entities/product.entity';
import { CategoryEntity } from '../categories/entities/category.entity';
import { OrderEntity } from '../orders/entities/order.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
  ) {}

  async getStats() {
    const [totalProducts, totalCategories, totalOrders] = await Promise.all([
      this.productRepository.count(),
      this.categoryRepository.count(),
      this.orderRepository.count(),
    ]);

    return {
      totalProducts,
      totalCategories,
      totalOrders,
    };
  }
}
