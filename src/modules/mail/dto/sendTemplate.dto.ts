import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class SendTemplateDto {
  @IsString()
  @IsNotEmpty()
  templateId: string;

  @IsObject()
  data: Record<string, any>;

  @IsString()
  @IsNotEmpty()
  to: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsOptional()
  @IsNumber()
  delay: number;

  @IsOptional()
  @IsNumber()
  attempts: number;
}
