import { Module } from '@nestjs/common';
import { EnrollmentController } from './enrollment.controller';
import { EnrollmentService } from './enrollment.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
@Module({
  controllers: [EnrollmentController],
  providers: [EnrollmentService, PrismaService, AuthService, JwtService],
})
export class EnrollmentModule {}
