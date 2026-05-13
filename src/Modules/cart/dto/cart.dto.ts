import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const AddToCartSchema = z.object({
  productId: z.number(),
  quantity: z.number().min(1).default(1),
});

export class AddToCartDto extends createZodDto(AddToCartSchema) {}

export const UpdateCartItemSchema = z.object({
  quantity: z.number().min(1),
});

export class UpdateCartItemDto extends createZodDto(UpdateCartItemSchema) {}
