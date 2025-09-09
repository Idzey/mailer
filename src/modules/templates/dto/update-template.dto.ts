import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class updateTemplateDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  html: string;
}
