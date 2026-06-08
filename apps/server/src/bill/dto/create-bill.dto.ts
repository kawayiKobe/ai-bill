import { IsNumber, IsString, IsIn, IsOptional, IsPositive, IsDateString } from 'class-validator';

export class CreateBillDto {
  @IsNumber()
  @IsPositive({ message: '金额必须为正数' })
  amount: number;

  @IsIn(['income', 'expense'], { message: '类型必须为 income 或 expense' })
  type: 'income' | 'expense';

  @IsString({ message: '分类不能为空' })
  categoryId: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  syncId?: string;
}
