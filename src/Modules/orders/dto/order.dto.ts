import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { OrderStatus } from '../../../utilies/enums/order-status.enum';

export const CreateOrderSchema = z.object({
  name: z.string().min(1, 'common.VALIDATION.NAME_REQUIRED'),
  email: z.string().email('common.VALIDATION.INVALID_EMAIL'),
  address: z.string().min(1, 'common.VALIDATION.ADDRESS_REQUIRED'),
  phone: z.string().min(1, 'common.VALIDATION.PHONE_REQUIRED'),
  items: z
    .array(
      z.object({
        productId: z.number(),
        quantity: z.number().min(1),
      }),
    )
    .min(1, 'common.VALIDATION.ITEMS_REQUIRED'),
});

export class CreateOrderDto extends createZodDto(CreateOrderSchema) {}

export const UpdateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

export class UpdateOrderStatusDto extends createZodDto(
  UpdateOrderStatusSchema,
) {}
