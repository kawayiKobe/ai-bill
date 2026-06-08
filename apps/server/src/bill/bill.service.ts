import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { Bill } from './entities/bill.entity';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { QueryBillDto } from './dto/query-bill.dto';

@Injectable()
export class BillService {
  constructor(
    @InjectRepository(Bill) private billRepo: Repository<Bill>,
  ) {}

  async create(userId: string, dto: CreateBillDto): Promise<Bill> {
    const bill = this.billRepo.create({
      ...dto,
      date: dto.date || new Date().toISOString().split('T')[0],
      userId,
    });
    return this.billRepo.save(bill);
  }

  async update(id: string, userId: string, dto: UpdateBillDto): Promise<Bill> {
    const bill = await this.billRepo.findOne({ where: { id, userId } });
    if (!bill) throw new NotFoundException('账单不存在');
    Object.assign(bill, dto);
    return this.billRepo.save(bill);
  }

  async remove(id: string, userId: string): Promise<void> {
    const bill = await this.billRepo.findOne({ where: { id, userId } });
    if (!bill) throw new NotFoundException('账单不存在');
    await this.billRepo.softRemove(bill);
  }

  async findAll(userId: string, query: QueryBillDto) {
    const page = query.page || 1;
    const limit = query.limit || 50;

    const where: FindOptionsWhere<Bill> = { userId };
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.type) where.type = query.type;
    if (query.startDate && query.endDate) {
      where.date = Between(query.startDate, query.endDate);
    }

    const [bills, total] = await this.billRepo.findAndCount({
      where,
      order: { date: 'DESC', createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { bills, total, page, limit };
  }

  async getStats(userId: string, year: number, month: number) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const bills = await this.billRepo.find({
      where: {
        userId,
        date: Between(startDate, endDate),
      },
    });

    let totalExpense = 0;
    let totalIncome = 0;
    const categoryMap = new Map<string, { categoryName: string; amount: number }>();

    for (const bill of bills) {
      const amount = Number(bill.amount);
      if (bill.type === 'expense') {
        totalExpense += amount;
      } else {
        totalIncome += amount;
      }

      if (bill.type === 'expense' && bill.category) {
        const existing = categoryMap.get(bill.categoryId);
        if (existing) {
          existing.amount += amount;
        } else {
          categoryMap.set(bill.categoryId, {
            categoryName: bill.category.name,
            amount,
          });
        }
      }
    }

    const byCategory = Array.from(categoryMap.entries()).map(([categoryId, data]) => ({
      categoryId,
      ...data,
    }));

    return {
      totalExpense,
      totalIncome,
      balance: totalIncome - totalExpense,
      byCategory,
    };
  }
}
