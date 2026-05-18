import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, ILike } from 'typeorm';
import { CategoryEntity } from './entities/category.entity';
import { ProductEntity } from '../products/entities/product.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { baseUrlLocale } from 'src/utilies/constant';
import { PaginationDto } from 'src/utilies/dto/pagination.dto';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    private readonly configService: ConfigService,
    private readonly i18n: I18nService,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
    files?: Express.Multer.File[],
  ): Promise<CategoryEntity> {
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
      const baseUrl =
        this.configService.get<string>('BASE_URL') || baseUrlLocale;
      savedImage = `${baseUrl}/uploads/categories/${fileName}`;
    }

    const slug = categoryData.name_en
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');

    const category = this.categoryRepository.create({
      ...categoryData,
      slug,
      image: savedImage,
    });

    return await this.categoryRepository.save(category);
  }

  async findAll() {
    return await this.categoryRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findAllPagination(paginationDto: PaginationDto) {
    const { page, limit, search } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.categoryRepository.findAndCount({
      where: search
        ? [{ name_en: ILike(`%${search}%`) }, { name_ar: ILike(`%${search}%`) }]
        : {},
      skip,
      take: limit,
      order: { id: 'DESC' },
      relations: ['products'],
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<CategoryEntity> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['products'],
    });
    if (!category) {
      const lang = I18nContext.current()?.lang || 'ar';
      throw new NotFoundException(
        this.i18n.t('common.CATEGORY.NOT_FOUND', { lang }),
      );
    }
    return category;
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
    files?: Express.Multer.File[],
  ): Promise<CategoryEntity> {
    const category = await this.findOne(id);
    const { image: imageUrls, ...categoryData } = updateCategoryDto;

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
      const baseUrl =
        this.configService.get<string>('BASE_URL') || baseUrlLocale;
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

  async getCategoryProducts(
    slug: string,
    page: number = 1,
    limit: number = 10,
    sort?: string,
    priceRanges: string[] = [],
  ) {
    page = Number(page) > 0 ? Number(page) : 1;
    limit = Number(limit) > 0 ? Number(limit) : 10;

    const query = this.productRepository
      .createQueryBuilder('product')
      .innerJoinAndSelect(
        'product.category',
        'category',
        'category.slug = :slug',
        { slug },
      );

    // Price Filters
    if (priceRanges.length > 0) {
      query.andWhere(
        new Brackets((qb) => {
          priceRanges.forEach((range, index) => {
            let condition = '';
            let params: any = {};

            // 50-200
            if (range.includes('-')) {
              const [min, max] = range.split('-');

              if (!isNaN(Number(min)) && !isNaN(Number(max))) {
                condition = `
                  product.price BETWEEN :min${index}
                  AND :max${index}
                `;

                params = {
                  [`min${index}`]: Number(min),
                  [`max${index}`]: Number(max),
                };
              }
            }

            // lessThan50
            else if (range.startsWith('lessThan')) {
              const max = range.replace('lessThan', '');

              if (!isNaN(Number(max))) {
                condition = `product.price < :max${index}`;

                params = {
                  [`max${index}`]: Number(max),
                };
              }
            }

            // greaterThan500
            else if (range.startsWith('greaterThan')) {
              const min = range.replace('greaterThan', '');

              if (!isNaN(Number(min))) {
                condition = `product.price > :min${index}`;

                params = {
                  [`min${index}`]: Number(min),
                };
              }
            }

            if (condition) {
              if (index === 0) {
                qb.where(condition, params);
              } else {
                qb.orWhere(condition, params);
              }
            }
          });
        }),
      );
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        query.orderBy('product.price', 'ASC');
        break;

      case 'price_desc':
        query.orderBy('product.price', 'DESC');
        break;

      case 'oldest':
        query.orderBy('product.id', 'ASC');
        break;

      default:
        query.orderBy('product.id', 'ASC');
        break;
    }

    // Pagination
    const skip = (page - 1) * limit;

    query.skip(skip).take(limit);

    const [products, total] = await query.getManyAndCount();

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        last_page: Math.ceil(total / limit),
        has_next_page: page < Math.ceil(total / limit),
        has_prev_page: page > 1,
      },
    };
  }
}
