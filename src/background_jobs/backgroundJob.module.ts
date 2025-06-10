import { Module } from '@nestjs/common';
import { BackgroundJobService } from './backgroundJob.service';
import { EnrollmentService } from 'src/enrollment/enrollment.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { NotificationService } from 'src/notification/notification.service';
import { HttpModule, HttpService } from '@nestjs/axios';
@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  providers: [
    BackgroundJobService,
    EnrollmentService,
    PrismaService,
    AuthService,
    JwtService,
    NotificationService,
  ],
})
export class BackgroundJobModule {}
