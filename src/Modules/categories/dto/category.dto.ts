import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateCategorySchema = z.object({
  name_en: z.string().min(1, 'common.VALIDATION.NAME_EN_REQUIRED'),
  name_ar: z.string().min(1, 'common.VALIDATION.NAME_AR_REQUIRED'),
  image: z.any().optional(),
});

export class CreateCategoryDto extends createZodDto(CreateCategorySchema) {}

export const UpdateCategorySchema = CreateCategorySchema.partial();

export class UpdateCategoryDto extends createZodDto(UpdateCategorySchema) {}
