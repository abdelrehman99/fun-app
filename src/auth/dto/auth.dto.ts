import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthDto {
  @ApiProperty({
    required: true,
    example: 'test@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    required: true,
    example: 'Ahmed',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    required: true,
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    required: true,
    example: 31.12,
  })
  @IsNumber({ maxDecimalPlaces: 10 })
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({
    required: true,
    example: 31.21,
  })
  @IsNumber({ maxDecimalPlaces: 10 })
  @IsNotEmpty()
  longitude: number;
}
