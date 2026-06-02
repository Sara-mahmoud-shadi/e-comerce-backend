import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { SettingsService } from './settings.service';
import { CreateSettingsDto, UpdateSettingsDto } from './dto/settings.dto';
import { SettingsEntity } from './entities/settings.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // ─────────────────────────── GET /settings ──────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Get site settings (public)' })
  @ApiResponse({
    status: 200,
    description: 'Returns the current site settings.',
    type: SettingsEntity,
  })
  getSettings() {
    return this.settingsService.getSettings();
  }

  // ─────────────────────────── POST /settings ─────────────────────────────

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logo', maxCount: 1 },
      { name: 'favicon', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: [
        'siteName',
        'siteDescription',
        'defaultLanguage',
        'storeEmail',
        'storePhone',
        'storeAddress',
        'supportEmail',
        'metaTitle',
        'metaDescription',
        'keywords',
      ],
      properties: {
        siteName: { type: 'string', example: 'My Store' },
        siteDescription: {
          type: 'string',
          example: 'Best online shopping store',
        },
        defaultLanguage: { type: 'string', example: 'en' },
        logo: { type: 'string', format: 'binary', description: 'Logo image' },
        favicon: {
          type: 'string',
          format: 'binary',
          description: 'Favicon image',
        },
        storeEmail: { type: 'string', example: 'info@store.com' },
        storePhone: { type: 'string', example: '+966500000000' },
        storeAddress: { type: 'string', example: 'Riyadh, Saudi Arabia' },
        supportEmail: { type: 'string', example: 'support@store.com' },
        metaTitle: { type: 'string', example: 'Best E-Commerce Store' },
        metaDescription: {
          type: 'string',
          example: 'Online shopping website',
        },
        keywords: { type: 'string', example: 'shop, ecommerce, store' },
        facebookUrl: {
          type: 'string',
          example: 'https://facebook.com/store',
        },
        instagramUrl: {
          type: 'string',
          example: 'https://instagram.com/store',
        },
        twitterUrl: { type: 'string', example: 'https://twitter.com/store' },
      },
    },
  })
  @ApiOperation({ summary: 'Create site settings (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Settings created successfully.',
    type: SettingsEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Settings already exist.',
  })
  createSettings(
    @Body() createSettingsDto: CreateSettingsDto,
    @UploadedFiles()
    files?: {
      logo?: Express.Multer.File[];
      favicon?: Express.Multer.File[];
    },
  ) {
    const logoFile = files?.logo?.[0];
    const faviconFile = files?.favicon?.[0];
    return this.settingsService.createSettings(
      createSettingsDto,
      logoFile,
      faviconFile,
    );
  }

  // ─────────────────────────── PUT /settings ──────────────────────────────

  @Put()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logo', maxCount: 1 },
      { name: 'favicon', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        siteName: { type: 'string', example: 'My Store' },
        siteDescription: {
          type: 'string',
          example: 'Best online shopping store',
        },
        defaultLanguage: { type: 'string', example: 'en' },
        logo: { type: 'string', format: 'binary', description: 'Logo image' },
        favicon: {
          type: 'string',
          format: 'binary',
          description: 'Favicon image',
        },
        storeEmail: { type: 'string', example: 'info@store.com' },
        storePhone: { type: 'string', example: '+966500000000' },
        storeAddress: { type: 'string', example: 'Riyadh, Saudi Arabia' },
        supportEmail: { type: 'string', example: 'support@store.com' },
        metaTitle: { type: 'string', example: 'Best E-Commerce Store' },
        metaDescription: {
          type: 'string',
          example: 'Online shopping website',
        },
        keywords: { type: 'string', example: 'shop, ecommerce, store' },
        facebookUrl: {
          type: 'string',
          example: 'https://facebook.com/store',
        },
        instagramUrl: {
          type: 'string',
          example: 'https://instagram.com/store',
        },
        twitterUrl: { type: 'string', example: 'https://twitter.com/store' },
      },
    },
  })
  @ApiOperation({ summary: 'Update site settings (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Settings updated successfully.',
    type: SettingsEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Settings not found.',
  })
  updateSettings(
    @Body() updateSettingsDto: UpdateSettingsDto,
    @UploadedFiles()
    files?: {
      logo?: Express.Multer.File[];
      favicon?: Express.Multer.File[];
    },
  ) {
    const logoFile = files?.logo?.[0];
    const faviconFile = files?.favicon?.[0];
    return this.settingsService.updateSettings(
      updateSettingsDto,
      logoFile,
      faviconFile,
    );
  }
}
