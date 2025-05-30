import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, VerificationTokenDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Public } from 'src/decorators/auth.decorator';
import { UserDecorator } from 'src/decorators/user.decorator';
import { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  async create(@Body() createAuthDto: RegisterDto) {
    return await this.authService.create(createAuthDto);
  }

  @Post('verify-token')
  async verifyToken(
    @Body() body: VerificationTokenDto,
    @UserDecorator() user: User,
  ) {
    return await this.authService.verifyToken(body, user);
  }

  @Get('me')
  async getMe(@UserDecorator() user: User) {
    return await this.authService.getMe(user);
  }

  @Get('request-token')
  async requestToken(@UserDecorator() user: User) {
    return await this.authService.requestToken(user);
  }
  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
