import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SettingsEntity } from './entities/settings.entity';
import { CreateSettingsDto, UpdateSettingsDto } from './dto/settings.dto';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { baseUrlLocale } from '../../utilies/constant';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(SettingsEntity)
    private readonly settingsRepository: Repository<SettingsEntity>,
    private readonly configService: ConfigService,
  ) { }

  /**
   * Returns the single settings record. If none exists, initialises one with defaults.
   */
  async getSettings(): Promise<SettingsEntity> {
    let settings = await this.settingsRepository.findOne({ where: {} });
    if (!settings) {
      settings = this.settingsRepository.create();
      settings = await this.settingsRepository.save(settings);
    }
    return settings;
  }

  /**
   * Creates the settings record (only allowed when no record exists yet).
   */
  async createSettings(
    createSettingsDto: CreateSettingsDto,
    logoFile?: Express.Multer.File,
    faviconFile?: Express.Multer.File,
  ): Promise<SettingsEntity> {
    const existing = await this.settingsRepository.findOne({ where: {} });
    if (existing) {
      throw new BadRequestException(
        'Settings already exist. Use the update endpoint (PUT /settings) instead.',
      );
    }

    const logoUrl = logoFile ? this.saveFile(logoFile, 'logo') : '';
    const faviconUrl = faviconFile ? this.saveFile(faviconFile, 'favicon') : '';

    const settings = this.settingsRepository.create({
      ...createSettingsDto,
      logo: logoUrl,
      favicon: faviconUrl,
    });

    return this.settingsRepository.save(settings);
  }

  /**
   * Updates the existing settings record.
   */
  async updateSettings(
    updateSettingsDto: UpdateSettingsDto,
    logoFile?: Express.Multer.File,
    faviconFile?: Express.Multer.File,
  ): Promise<SettingsEntity> {
    let settings = await this.settingsRepository.findOne({ where: {} });
    if (!settings) {
      throw new NotFoundException(
        'Settings not found. Please create settings first via POST /settings.',
      );
    }

    // Update scalar fields
    Object.assign(settings, updateSettingsDto);

    // Handle logo upload
    if (logoFile) {
      this.deleteOldFile(settings.logo);
      settings.logo = this.saveFile(logoFile, 'logo');
    }

    // Handle favicon upload
    if (faviconFile) {
      this.deleteOldFile(settings.favicon);
      settings.favicon = this.saveFile(faviconFile, 'favicon');
    }

    return this.settingsRepository.save(settings);
  }

  // ─────────────────────────── helpers ────────────────────────────────────

  private saveFile(file: Express.Multer.File, folder: string): string {
    const uploadPath = process.env.VERCEL === '1'
      ? path.join('/tmp', 'uploads', 'settings', folder)
      : path.join(process.cwd(), 'uploads', 'settings', folder);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    const ext = path.extname(file.originalname);
    const fileName = `${folder}-${Date.now()}${ext}`;
    const filePath = path.join(uploadPath, fileName);
    fs.writeFileSync(filePath, file.buffer);

    let baseUrl = this.configService.get<string>('BASE_URL');
    if (!baseUrl) {
      baseUrl = process.env.VERCEL === '1' && process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : baseUrlLocale;
    }
    return `${baseUrl.replace(/\/$/, '')}/uploads/settings/${folder}/${fileName}`;
  }

  private deleteOldFile(fileUrl: string): void {
    if (!fileUrl) return;
    try {
      let baseUrl = this.configService.get<string>('BASE_URL');
      if (!baseUrl) {
        baseUrl = process.env.VERCEL === '1' && process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : baseUrlLocale;
      }
      const relativePath = fileUrl.replace(baseUrl.replace(/\/$/, ''), '');
      const absolutePath = process.env.VERCEL === '1'
        ? path.join('/tmp', relativePath)
        : path.join(process.cwd(), relativePath);
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
      }
    } catch {
      // Silently ignore file deletion errors
    }
  }
}
