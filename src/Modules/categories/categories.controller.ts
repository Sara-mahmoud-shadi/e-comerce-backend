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
  UploadedFile,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { CategoryEntity } from './entities/category.entity'; 
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { PaginationDto } from 'src/utilies/dto/pagination.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Create a new category' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name_en', 'name_ar'],
      properties: {
        name_en: { type: 'string', example: 'Electronics' },
        name_ar: { type: 'string', example: 'الإلكترونيات' },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Upload a single category image',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'The category has been successfully created.', type: CategoryEntity })
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.categoriesService.create(createCategoryDto, file ? [file] : []);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200, description: 'Return all categories.', type: [CategoryEntity] })
  findAll( ) {
    return this.categoriesService.findAll();
  }

  @Get('pagination')
  @ApiOperation({ summary: 'Get all categories with pagination' })
  @ApiResponse({ status: 200, description: 'Return paginated categories.' })
  findAllWithPagination(@Query() paginationDto: PaginationDto) {
    return this.categoriesService.findAllPagination(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a category by id' })
  @ApiResponse({ status: 200, description: 'Return the category.', type: CategoryEntity })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get products for a category with pagination and filtering' })
  async getCategoryProducts(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: string,
    @Query('priceRanges') priceRanges?: string | string[],
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    
    let ranges: string[] = [];
    if (priceRanges) {
      ranges = Array.isArray(priceRanges) ? priceRanges : [priceRanges];
    }
    
    return this.categoriesService.getCategoryProducts(
      id,
      pageNumber,
      limitNumber,
      sort,
      ranges
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name_en: { type: 'string', example: 'Electronics' },
        name_ar: { type: 'string', example: 'الإلكترونيات' },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Upload a single category image',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Update a category' })
  @ApiResponse({ status: 200, description: 'The category has been successfully updated.', type: CategoryEntity })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.categoriesService.update(id, updateCategoryDto, file ? [file] : []);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a category' })
  @ApiResponse({ status: 200, description: 'The category has been successfully deleted.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }
}
