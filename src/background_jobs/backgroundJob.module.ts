import { Module } from '@nestjs/common';
import { BackgroundJobService } from './backgroundJob.service';
import { EnrollmentService } from 'src/enrollment/enrollment.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { AuthModule } from 'src/auth/auth.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [
    BackgroundJobService,
    EnrollmentService,
    PrismaService,
    AuthService,
    JwtService,
  ],
})
export class BackgroundJobModule {}
