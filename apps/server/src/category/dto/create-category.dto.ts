import { IsString, IsIn } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsString()
  icon: string;

  @IsIn(['income', 'expense'])
  type: 'income' | 'expense';
}
