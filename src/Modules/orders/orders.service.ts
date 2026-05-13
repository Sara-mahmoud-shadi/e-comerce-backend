import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from './entities/order.entity';
import { OrderItemEntity } from './entities/order-item.entity';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { ProductEntity } from '../products/entities/product.entity';
import { OrderStatus } from '../../utilies/enums/order-status.enum';

import { OrderLogEntity } from './entities/order-log.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
    @InjectRepository(OrderLogEntity)
    private readonly orderLogRepository: Repository<OrderLogEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) { }

  async create(createOrderDto: CreateOrderDto): Promise<OrderEntity> {
    const { name, email, address, items } = createOrderDto;

    const order_number = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create order without relations — TypeORM manages them separately
    const order = this.orderRepository.create({
      name,
      email,
      address,
      order_number,
      status_order: OrderStatus.PENDING,
    });

    const savedOrder = await this.orderRepository.save(order);

    // Initial status log
    const initialLog = this.orderLogRepository.create({
      order: savedOrder,
      new_status: OrderStatus.PENDING,
    });
    await this.orderLogRepository.save(initialLog);

    // Fetch all products in one query
    const productIds = items.map((i) => i.productId);
    const products = await this.productRepository.findByIds(productIds);
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Validate all products exist before saving any item
    for (const item of items) {
      if (!productMap.has(item.productId)) {
        throw new NotFoundException(`Product with ID ${item.productId} not found`);
      }
    }

    // Build and save all order items at once
    const orderItems = items.map((item) => {
      const product = productMap.get(item.productId)!;
      return this.orderItemRepository.create({
        order: savedOrder,
        product,
        quantity: item.quantity,
        price: parseFloat(product.price_discount ?? product.price),
      });
    });

    await this.orderItemRepository.save(orderItems);

    // Return fully loaded order with relations
    return this.findOne(savedOrder.id);
  }

  async findAll(): Promise<OrderEntity[]> {
    return await this.orderRepository.find({order:{id:'DESC'}, relations: ['items', 'items.product'] });
  }

  async findOne(id: number): Promise<OrderEntity> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'items.product'],
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async updateStatus(id: number, updateOrderStatusDto: UpdateOrderStatusDto): Promise<OrderEntity> {
    const order = await this.findOne(id);
    const oldStatus = order.status_order;
    const newStatus = updateOrderStatusDto.status;

    if (oldStatus !== newStatus) {
      order.status_order = newStatus;
      await this.orderRepository.save(order);

      const log = this.orderLogRepository.create({
        order,
        old_status: oldStatus,
        new_status: newStatus,
      });
      await this.orderLogRepository.save(log);
    }

    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const order = await this.findOne(id);
    await this.orderRepository.remove(order);
  }
}
