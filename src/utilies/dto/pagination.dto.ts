import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const PaginationSchema = z.object({
  page: z.preprocess((val) => Number(val), z.number().min(1).default(1)),
  limit: z.preprocess((val) => Number(val), z.number().min(1).max(100).default(10)),
  search: z.string().optional(),
});

export class PaginationDto extends createZodDto(PaginationSchema) {}
