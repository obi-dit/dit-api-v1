import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { RegisterDto, VerificationTokenDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';
import { MessageEnum } from 'src/utils/enum';
import { PrismaService } from 'src/prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from '@prisma/client';
import { CreateEnrollmentDto } from '../enrollment/dto/create.enrollment.dto';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {}
  async create(signupDto: RegisterDto) {
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    //check if user exists by email
    const user = await this.prisma.user.findUnique({
      where: { email: signupDto.email },
    });

    console.log('log', user);
    if (user) {
      throw new Error('Email already exists');
    }

    const newPassword = await argon2.hash(signupDto.password);

    signupDto.password = newPassword;

    const currentUser = await this.prisma.user.create({
      data: {
        email: signupDto.email,
        password: signupDto.password,
        firstName: signupDto.firstName,
        lastName: signupDto.lastName,
      },
    });

    const token = this.jwtService.sign(currentUser, { secret: jwtSecret });
    const appName = 'dit';
    this.eventEmitter.emit('verification.sent', {
      name: signupDto.firstName,
      email: signupDto.email,
      appName,
    });
    return {
      message: MessageEnum.NEEDS_TO_VERIFY_EMAIL,
      user: {
        ...currentUser,
        password: undefined,
        createdAt: undefined,
      },
      accessToken: token,
    };
  }

  async verifyToken(body: VerificationTokenDto, user: User) {
    try {
      const tokenExist = await this.prisma.verifyToken.findFirst({
        where: {
          token: body.token,
        },
      });

      if (tokenExist) {
        const now = new Date();

        if (tokenExist.ttl < now) {
          throw new BadRequestException('Token has expired');
        }

        await this.prisma.user.update({
          where: {
            email: user.email,
          },
          data: {
            isVerified: true, // Or any field you're updating
          },
        });

        // Optionally delete the used token
        await this.prisma.verifyToken.delete({
          where: {
            id: tokenExist.id,
          },
        });

        return {
          success: true,
        };
      }

      throw new BadRequestException('Token is not valid');
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('error:', error);
      throw new InternalServerErrorException();
    }
  }

  async getMe(user: User) {
    try {
      const userDetail = await this.prisma.user.findFirst({
        where: {
          id: user.id,
        },
      });

      if (!userDetail) {
        throw new BadRequestException('Not a valid User');
      }

      return {
        ...userDetail,
        password: undefined,
        createdAt: undefined,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('error:', error);
      throw new InternalServerErrorException();
    }
  }

  async requestToken(user: User) {
    const appName = 'DIT';
    this.eventEmitter.emit('verification.sent', {
      name: user.firstName,
      email: user.email,
      appName,
    });

    return {
      success: true,
    };
  }

  async createDetailsFromEnrollment(
    createEnrollmentDto: CreateEnrollmentDto,
  ): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { email: createEnrollmentDto.email },
    });

    console.log('log', user);
    if (user) {
      throw new Error('You are already enrolled');
    }

    const defaultPassword = 'default-password';
    const newPassword = await argon2.hash(defaultPassword);

    const [firstName, lastName] = createEnrollmentDto.name.split(' ');

    const userData = await this.prisma.user.create({
      data: {
        email: createEnrollmentDto.email,
        password: newPassword,
        firstName: firstName ?? '',
        lastName: lastName ?? '',
      },
    });

    return userData;
  }
  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
