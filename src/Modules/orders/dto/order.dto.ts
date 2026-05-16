import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { OrderStatus } from '../../../utilies/enums/order-status.enum';

export const CreateOrderSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(1, 'Phone is required'),
  items: z.array(z.object({
    productId: z.number(),
    quantity: z.number().min(1),
  })).min(1, 'Order must have at least one item'),
});

export class CreateOrderDto extends createZodDto(CreateOrderSchema) { }

export const UpdateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

export class UpdateOrderStatusDto extends createZodDto(UpdateOrderStatusSchema) { }
