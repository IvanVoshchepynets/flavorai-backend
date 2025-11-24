import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateRecipeDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @MinLength(10)
  ingredients: string;

  @IsString()
  @MinLength(10)
  instructions: string;

  @IsOptional()
  @IsString()
  cuisine?: string;
}
