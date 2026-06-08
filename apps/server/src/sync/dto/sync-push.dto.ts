import { IsArray, ValidateNested, IsString, IsNumber, IsOptional, IsIn, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class SyncBillDto {
  @IsString()
  id: string;

  @IsNumber()
  amount: number;

  @IsIn(['income', 'expense'])
  type: 'income' | 'expense';

  @IsString()
  categoryId: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsString()
  date: string;

  @IsString()
  createdAt: string;

  @IsString()
  updatedAt: string;

  @IsOptional()
  @IsString()
  deletedAt?: string | null;
}

export class SyncPushDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncBillDto)
  bills: SyncBillDto[];
}

export class SyncPullDto {
  @IsOptional()
  @IsString()
  lastSyncAt?: string;
}
