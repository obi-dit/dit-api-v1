import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { HttpModule, HttpService } from '@nestjs/axios';
@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  providers: [NotificationService],
})
export class NotificationModule {}
