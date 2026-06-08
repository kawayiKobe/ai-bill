import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.categoryService.findAll(req.user.id);
  }

  @Post()
  create(@Request() req: any, @Body() dto: CreateCategoryDto) {
    return this.categoryService.create(req.user.id, dto);
  }
}
