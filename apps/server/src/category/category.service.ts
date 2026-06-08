import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';

const PRESET_CATEGORIES = [
  { name: '餐饮', icon: 'restaurant', type: 'expense' as const },
  { name: '交通', icon: 'car', type: 'expense' as const },
  { name: '购物', icon: 'cart', type: 'expense' as const },
  { name: '娱乐', icon: 'game-controller', type: 'expense' as const },
  { name: '居住', icon: 'home', type: 'expense' as const },
  { name: '医疗', icon: 'medkit', type: 'expense' as const },
  { name: '教育', icon: 'school', type: 'expense' as const },
  { name: '通讯', icon: 'call', type: 'expense' as const },
  { name: '日用', icon: 'basket', type: 'expense' as const },
  { name: '工资', icon: 'cash', type: 'income' as const },
  { name: '兼职', icon: 'briefcase', type: 'income' as const },
  { name: '理财', icon: 'trending-up', type: 'income' as const },
  { name: '红包', icon: 'gift', type: 'income' as const },
  { name: '其他收入', icon: 'add-circle', type: 'income' as const },
  { name: '其他支出', icon: 'ellipsis-horizontal-circle', type: 'expense' as const },
];

@Injectable()
export class CategoryService implements OnModuleInit {
  constructor(
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
  ) {}

  async onModuleInit() {
    const count = await this.categoryRepo.count({ where: { isPreset: true } });
    if (count === 0) {
      const presets = PRESET_CATEGORIES.map((c) =>
        this.categoryRepo.create({ ...c, isPreset: true }),
      );
      await this.categoryRepo.save(presets);
    }
  }

  async findAll(userId: string) {
    return this.categoryRepo.find({
      where: [
        { isPreset: true },
        { userId },
      ],
      order: { createdAt: 'ASC' },
    });
  }

  async create(userId: string, dto: CreateCategoryDto): Promise<Category> {
    const category = this.categoryRepo.create({
      ...dto,
      isPreset: false,
      userId,
    });
    return this.categoryRepo.save(category);
  }
}
