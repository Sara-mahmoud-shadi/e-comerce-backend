import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateCategorySchema = z.object({
  name_en: z.string().min(1, 'name_en is required'),
  name_ar: z.string().min(1, 'name_ar is required'),
  image : z.any().optional(),
});

export class CreateCategoryDto extends createZodDto(CreateCategorySchema) {}

export const UpdateCategorySchema = CreateCategorySchema.partial();

export class UpdateCategoryDto extends createZodDto(UpdateCategorySchema) {}
