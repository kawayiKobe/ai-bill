import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiService } from './ai.service';
import { BillService } from '../bill/bill.service';
import { ParseBillDto, SuggestCategoryDto, MonthlyReportDto } from './dto/parse-bill.dto';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly billService: BillService,
  ) {}

  @Post('parse-bill')
  parseBill(@Body() dto: ParseBillDto) {
    const today = new Date().toISOString().split('T')[0];
    return this.aiService.parseBill(dto.text, today);
  }

  @Post('suggest-category')
  suggestCategory(@Body() dto: SuggestCategoryDto) {
    return this.aiService.suggestCategories(dto.note, dto.history || []);
  }

  @Post('monthly-report')
  async monthlyReport(@Request() req: any, @Body() dto: MonthlyReportDto) {
    const stats = await this.billService.getStats(req.user.id, dto.year, dto.month);

    // Get previous month stats for comparison
    let previousMonth;
    const prevMonth = dto.month === 1 ? 12 : dto.month - 1;
    const prevYear = dto.month === 1 ? dto.year - 1 : dto.year;
    try {
      const prevStats = await this.billService.getStats(req.user.id, prevYear, prevMonth);
      previousMonth = {
        totalExpense: prevStats.totalExpense,
        totalIncome: prevStats.totalIncome,
      };
    } catch {
      // no previous data
    }

    const report = await this.aiService.generateMonthlyReport({
      year: dto.year,
      month: dto.month,
      totalExpense: stats.totalExpense,
      totalIncome: stats.totalIncome,
      byCategory: stats.byCategory,
      billCount: stats.byCategory.reduce((sum, c) => sum + 1, 0),
      previousMonth,
    });

    return { report, stats };
  }
}
