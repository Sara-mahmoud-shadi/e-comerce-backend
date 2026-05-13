import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.string().min(0, 'Price must be positive'),
  price_discount: z.string().min(0).optional(),
  instock: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(true),
  categoryId: z.coerce.number().optional(),
  images: z.array(z.string()).optional(),
  tax: z.coerce.number().optional(),
});

export class CreateProductDto extends createZodDto(CreateProductSchema) {}

export const UpdateProductSchema = CreateProductSchema.partial();

export class UpdateProductDto extends createZodDto(UpdateProductSchema) {}
