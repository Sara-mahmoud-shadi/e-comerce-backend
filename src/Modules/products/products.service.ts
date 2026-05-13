import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { ProductEntity } from './entities/product.entity';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import * as fs from 'fs';
import * as path from 'path';
import { PaginationDto } from 'src/utilies/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';
import {  baseUrlLocale } from 'src/utilies/constant';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    private readonly configService: ConfigService,
  ) { }

  async create(createProductDto: CreateProductDto, files?: Express.Multer.File[]): Promise<ProductEntity> {
    const { categoryId, images: imageUrls, ...productData } = createProductDto;

    const productImages: string[] = imageUrls || [];

    if (files && files.length > 0) {
      const uploadPath = path.join(process.cwd(), 'uploads', 'products');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      const baseUrl = this.configService.get<string>('BASE_URL') || baseUrlLocale;
      for (const file of files) {
        const fileName = `${Date.now()}-${file.originalname}`;
        const filePath = path.join(uploadPath, fileName);
        fs.writeFileSync(filePath, file.buffer);
        productImages.push(`${baseUrl}/uploads/products/${fileName}`);
      }
    }

    // Auto-generate slug (supports Arabic and special characters)
    const slug = productData.name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/[^\w\u0600-\u06FF-]+/g, '') // Remove non-word characters except hyphens and Arabic
      .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+/, '') // Trim hyphens from start
      .replace(/-+$/, ''); // Trim hyphens from end

    const product = this.productRepository.create({
      ...productData,
      price: productData.price.replace(/,/g, ''),
      price_discount: productData.price_discount?.replace(/,/g, ''),
      tax: productData.tax ?? 0,
      slug,
      images: productImages,
    });

    if (categoryId) {
      product.category = { id: categoryId } as any;
    }

    return await this.productRepository.save(product);
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit, search } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.productRepository.findAndCount({
      where: search ? { name: ILike(`%${search}%`) } : {},
      skip,
      take: limit,
      order: { createdAt: 'ASC' },
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

  async findOne(id: number): Promise<ProductEntity> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto, files?: Express.Multer.File[]): Promise<ProductEntity> {
    const product = await this.findOne(id);
    const { categoryId, images: imageUrls, ...productData } = updateProductDto;

    Object.assign(product, productData);

    if (files && files.length > 0) {
      const uploadPath = path.join(process.cwd(), 'uploads', 'products');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      const baseUrl = this.configService.get<string>('BASE_URL') || baseUrlLocale;
      const productImages: string[] = [];
      for (const file of files) {
        const fileName = `${Date.now()}-${file.originalname}`;
        const filePath = path.join(uploadPath, fileName);
        fs.writeFileSync(filePath, file.buffer);
        productImages.push(`${baseUrl}/uploads/products/${fileName}`);
      }
      product.images = productImages;
    } else if (imageUrls) {
      product.images = imageUrls;
    }

    if (productData.name) {
      product.slug = productData.name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\u0600-\u06FF-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
    }

    if (productData.price) {
      product.price = productData.price.replace(/,/g, '');
    }

    if (productData.price_discount) {
      product.price_discount = productData.price_discount.replace(/,/g, '');
    }

    if (categoryId) {
      product.category = { id: categoryId } as any;
    }

    return await this.productRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }
}
