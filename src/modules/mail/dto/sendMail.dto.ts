import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SendMailDto {
  @IsString()
  @IsNotEmpty()
  to: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsOptional()
  @IsNumber()
  delay?: number;

  @IsOptional()
  @IsNumber()
  attempts?: number;
}
