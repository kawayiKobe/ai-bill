import { IsNumber, IsString, IsIn, IsOptional, IsPositive, IsDateString } from 'class-validator';

export class UpdateBillDto {
  @IsOptional()
  @IsNumber()
  @IsPositive({ message: '金额必须为正数' })
  amount?: number;

  @IsOptional()
  @IsIn(['income', 'expense'])
  type?: 'income' | 'expense';

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsDateString()
  date?: string;
}
