import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BillService } from './bill.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { QueryBillDto } from './dto/query-bill.dto';

@Controller('bills')
@UseGuards(JwtAuthGuard)
export class BillController {
  constructor(private readonly billService: BillService) {}

  @Post()
  create(@Request() req: any, @Body() dto: CreateBillDto) {
    return this.billService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Request() req: any, @Query() query: QueryBillDto) {
    return this.billService.findAll(req.user.id, query);
  }

  @Put(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateBillDto) {
    return this.billService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.billService.remove(id, req.user.id);
  }

  @Get('stats')
  getStats(
    @Request() req: any,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const now = new Date();
    return this.billService.getStats(
      req.user.id,
      year ? parseInt(year, 10) : now.getFullYear(),
      month ? parseInt(month, 10) : now.getMonth() + 1,
    );
  }
}
