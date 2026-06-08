import { IsString, IsOptional, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class ParseBillDto {
  @IsString()
  text: string;
}

class HistoryCategory {
  @IsString()
  note: string;

  @IsString()
  category: string;
}

export class SuggestCategoryDto {
  @IsString()
  note: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HistoryCategory)
  history?: HistoryCategory[];
}

export class MonthlyReportDto {
  @IsNumber()
  year: number;

  @IsNumber()
  month: number;
}
