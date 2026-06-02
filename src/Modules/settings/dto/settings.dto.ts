import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const phoneRegex = /^\+?[0-9\s\-()\u0600-\u06FF]{7,20}$/;
const urlSchema = z
  .string()
  .url('common.VALIDATION.INVALID_URL')
  .or(z.literal(''));

export const CreateSettingsSchema = z.object({
  // ── General ────────────────────────────────────────────────────────────
  site_name: z
    .string()
    .min(1, 'common.VALIDATION.SITE_NAME_REQUIRED')
    .max(100, 'common.VALIDATION.SITE_NAME_REQUIRED'),

  site_description: z
    .string()
    .min(1, 'common.VALIDATION.SITE_DESCRIPTION_REQUIRED')
    .max(500, 'common.VALIDATION.SITE_DESCRIPTION_REQUIRED'),

  default_language: z
    .string()
    .min(2, 'common.VALIDATION.LANGUAGE_REQUIRED')
    .max(10, 'common.VALIDATION.LANGUAGE_REQUIRED'),

  // ── Media (file paths – actual uploads handled by multer) ──────────────
  logo: z.string().optional().default(''),
  favicon: z.string().optional().default(''),

  // ── Contact ────────────────────────────────────────────────────────────
  store_email: z
    .string()
    .min(1, 'common.VALIDATION.STORE_EMAIL_REQUIRED')
    .email('common.VALIDATION.INVALID_EMAIL'),

  store_phone: z
    .string()
    .min(1, 'common.VALIDATION.STORE_PHONE_REQUIRED')
    .regex(phoneRegex, 'common.VALIDATION.INVALID_PHONE'),

  store_address: z
    .string()
    .min(1, 'common.VALIDATION.STORE_ADDRESS_REQUIRED')
    .max(300, 'common.VALIDATION.STORE_ADDRESS_REQUIRED'),

  support_email: z
    .string()
    .min(1, 'common.VALIDATION.SUPPORT_EMAIL_REQUIRED')
    .email('common.VALIDATION.INVALID_EMAIL'),

  // ── SEO ────────────────────────────────────────────────────────────────
  meta_title: z
    .string()
    .min(1, 'common.VALIDATION.META_TITLE_REQUIRED')
    .max(160, 'common.VALIDATION.META_TITLE_REQUIRED'),

  meta_description: z
    .string()
    .min(1, 'common.VALIDATION.META_DESCRIPTION_REQUIRED')
    .max(500, 'common.VALIDATION.META_DESCRIPTION_REQUIRED'),

  keywords: z
    .string()
    .min(1, 'common.VALIDATION.KEYWORDS_REQUIRED')
    .max(500, 'common.VALIDATION.KEYWORDS_REQUIRED'),

  // ── Social Media ───────────────────────────────────────────────────────
  facebook_url: urlSchema.optional().default('https://facebook.com/store'),
  instagram_url: urlSchema.optional().default('https://instagram.com/store'),
  twitter_url: urlSchema.optional().default('https://twitter.com/store'),
});

export class CreateSettingsDto extends createZodDto(CreateSettingsSchema) {}

export const UpdateSettingsSchema = CreateSettingsSchema.partial();

export class UpdateSettingsDto extends createZodDto(UpdateSettingsSchema) {}
