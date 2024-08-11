import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';

import { AuthDto } from 'src/auth/dto';
import { AuthService } from '../auth/auth.service';
import { UserService } from './user.service';
import { JwtGuard } from 'src/auth/guard';

@ApiTags('users')
@Controller('user')
export class UserController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @UseGuards(JwtGuard)
  @Get('/:id')
  userInfo(@Param('id') userId: string) {
    return this.userService.getUser(userId);
  }

  @Post('signup')
  @ApiResponse({
    status: 201,
    description:
      'The user has been successfully signed up.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden. You can not sign up from a place not in Egypt.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request. Email address is already in use.',
  })
  @ApiBody({
    type: AuthDto,
    description:
      'Json structure for user signup object',
  })
  signup(@Body() dto: AuthDto) {
    return this.authService.signup(dto);
  }
}
