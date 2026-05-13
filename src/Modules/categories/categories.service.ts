import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity } from './entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import * as fs from 'fs';
import * as path from 'path'; 
import { ConfigService } from '@nestjs/config';
import { baseUrlLocale } from 'src/utilies/constant';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    private readonly configService: ConfigService,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, files?: Express.Multer.File[]): Promise<CategoryEntity> {
    const { image: imageUrl, ...categoryData } = createCategoryDto;

    let savedImage: string | undefined = imageUrl || undefined;

    if (files && files.length > 0) {
      const file = files[0];
      const uploadPath = path.join(process.cwd(), 'uploads', 'categories');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      const fileName = `${Date.now()}-${file.originalname}`;
      const filePath = path.join(uploadPath, fileName);
      fs.writeFileSync(filePath, file.buffer);
      const baseUrl = this.configService.get<string>('BASE_URL') || baseUrlLocale;
      savedImage = `${baseUrl}/uploads/categories/${fileName}`;
    }

    const slug = categoryData.name_en.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    const category = this.categoryRepository.create({
      ...categoryData,
      slug,
      image: savedImage,
    });

    return await this.categoryRepository.save(category);
  }

  async findAll() {
    return await this.categoryRepository.find({
      order: { id: 'DESC' },
      relations: ['products'],
    });
  }

  async findOne(id: number): Promise<CategoryEntity> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['products'],
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto, files?: Express.Multer.File[]): Promise<CategoryEntity> {
    const category = await this.findOne(id);
    const { image : imageUrls, ...categoryData } = updateCategoryDto;

    Object.assign(category, categoryData);

    if (files && files.length > 0) {
      const file = files[0];
      const uploadPath = path.join(process.cwd(), 'uploads', 'categories');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      const fileName = `${Date.now()}-${file.originalname}`;
      const filePath = path.join(uploadPath, fileName);
      fs.writeFileSync(filePath, file.buffer);
      const baseUrl = this.configService.get<string>('BASE_URL') || baseUrlLocale;
      category.image = `${baseUrl}/uploads/categories/${fileName}`;
    } else if (imageUrls) {
      category.image = imageUrls;
    }

    if (categoryData.name_en) {
      category.slug = categoryData.name_en
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\u0600-\u06FF-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
    }

    if (imageUrls) {
      category.image = imageUrls;
    }

    return await this.categoryRepository.save(category);
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);
  }
}
