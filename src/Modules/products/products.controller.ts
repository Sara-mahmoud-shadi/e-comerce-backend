import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseInterceptors,
  UploadedFiles,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { ProductEntity } from './entities/product.entity';
import { PaginationDto } from 'src/utilies/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('images'))
  @ApiOperation({ summary: 'Create a new product' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'description', 'price'],
      properties: {
        name: { type: 'string', example: 'iPhone 15' },
        description: { type: 'string', example: 'Latest Apple smartphone' },
        price: { type: 'number', example: 999.99 },
        price_discount: { type: 'number', example: 899.99 },
        instock: { type: 'boolean', example: true },
        categoryId: { type: 'number', example: 1 },
        tax: { type: 'number', example: 15 },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Upload one or more product images',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'The product has been successfully created.', type: ProductEntity })
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.productsService.create(createProductDto, files);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'Return all products.', type: [ProductEntity] })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.productsService.findAll(paginationDto);
  }

  @Get('filter')
  @ApiOperation({ summary: 'Get products with pagination and array filters' })
  async getProductsWithFilters(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: string,
    @Query('priceRanges') priceRanges?: string | string[],
    @Query('categories') categories?: string | string[],
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    
    let ranges: string[] = [];
    if (priceRanges) {
      ranges = Array.isArray(priceRanges) ? priceRanges : [priceRanges];
    }

    let categoryIds: string[] = [];
    if (categories) {
      categoryIds = Array.isArray(categories) ? categories : [categories];
    }
    
    return this.productsService.getProductsWithFilters(
      pageNumber,
      limitNumber,
      sort,
      ranges,
      categoryIds
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by id' })
  @ApiResponse({ status: 200, description: 'Return the product.', type: ProductEntity })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('images'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'iPhone 15' },
        description: { type: 'string', example: 'Latest Apple iPhone' },
        price: { type: 'string', example: '999.99' },
        price_discount: { type: 'string', example: '899.99' },
        instock: { type: 'boolean', example: true },
        categoryId: { type: 'number', example: 1 },
        tax: { type: 'number', example: 14 },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Upload multiple product images',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({ status: 200, description: 'The product has been successfully updated.', type: ProductEntity })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.productsService.update(id, updateProductDto, files);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({ status: 200, description: 'The product has been successfully deleted.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
