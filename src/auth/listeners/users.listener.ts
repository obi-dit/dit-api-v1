import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { addMinutes } from 'date-fns';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  brevoTemplateConfig,
  generateEmailVerificationToken,
} from 'src/utils/helper';

@Injectable()
export class UserListener {
  private readonly logger = new Logger(UserListener.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  @OnEvent('verification.sent')
  async handleVerificationSent(event: {
    name: string;
    email: string;
    appName: string;
  }) {
    // handle and process "OrderCreatedEvent" event
    try {
      console.log('log', this.configService.get('brevo.apiUrl'));
      const verificationToken = generateEmailVerificationToken();
      this.saveVerificationToken(verificationToken);
      console.log('log', verificationToken);
      const brevoPostMessage = {
        sender: {
          name: 'DIT Team',
          email: 'no-reply@dit.com',
        },
        to: [
          {
            name: event.name,
            email: event.email,
          },
        ],
        templateId: brevoTemplateConfig['Dit_Verify_Mail'],
        params: {
          name: event.name,
          appName: event.appName,
          token: verificationToken,
        },
      };
      console.log('log', brevoPostMessage);
      const responseObj = await this.httpService.axiosRef.post(
        `${this.configService.get('brevo.apiUrl')}/smtp/email`,
        brevoPostMessage,
        {
          headers: {
            'api-key': this.configService.get('brevo.apiSecret'),
            'content-type': 'application/json',
            Accept: 'application/json',
          },
        },
      );

      this.logger.log('log response', responseObj.data);
      this.logger.log(`Email Verification sent to ${event.email}`);
    } catch (err) {
      this.logger.error(
        'An error occured while sending verification token',
        err,
      );
    }
  }

  async saveVerificationToken(token: string) {
    const ttl = addMinutes(new Date(), 15); // token expires in 15 minutes

    await this.prisma.verifyToken.create({
      data: {
        token,
        ttl,
      },
    });
  }
}
