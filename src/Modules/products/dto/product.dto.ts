import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateProductSchema = z.object({
  name_en: z.string().min(1, 'common.VALIDATION.NAME_REQUIRED'),
  name_ar: z.string().min(1, 'common.VALIDATION.NAME_REQUIRED'),
  description: z.string().min(1, 'common.VALIDATION.DESCRIPTION_REQUIRED'),
  price: z.string().min(1, 'common.VALIDATION.PRICE_REQUIRED'),
  price_discount: z
    .preprocess((val) => (val === '' ? undefined : val), z.string().min(0))
    .optional(),
  instock: z
    .preprocess((val) => val === 'true' || val === true, z.boolean())
    .default(true),
  categoryId: z.coerce.number().min(1, 'common.VALIDATION.REQUIRED'),
  images: z.array(z.string()).optional(),
  tax: z
    .preprocess((val) => (val === '' ? undefined : val), z.coerce.number())
    .optional(),
});

export class CreateProductDto extends createZodDto(CreateProductSchema) {}

export const UpdateProductSchema = CreateProductSchema.partial();

export class UpdateProductDto extends createZodDto(UpdateProductSchema) {}
