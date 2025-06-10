import { Injectable, Logger } from '@nestjs/common';
import {
  BrevoTemplateId,
  TemplatePayloadMap,
  Comfirmation_After_Enrollment_Payload,
  Notification_for_new_Student_Payload,
} from 'src/utils/typings';
import { brevoTemplateConfig } from 'src/utils/helper';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async sendNotification<T extends BrevoTemplateId>(
    templateId: T,
    payload: TemplatePayloadMap[T],
  ) {
    // Now `payload` is typed based on the value of `templateId`
    console.log('Sending template:', templateId, 'with payload:', payload);
    try {
      console.log('log', this.configService.get('brevo.apiUrl'));
      let brevoPostMessage;
      switch (templateId) {
        case brevoTemplateConfig['Comfirmation_After_Enrollment']: {
          const p = payload as Comfirmation_After_Enrollment_Payload;
          brevoPostMessage = {
            sender: {
              name: 'DIT Team',
              email: 'info@diversityintechnology.org',
            },
            to: [
              {
                name: p.studentName,
                email: p.email,
              },
            ],
            templateId: templateId,
            params: {
              studentName: p.studentName,
              programName: p.programName,
              startDate: p.startDate,
              location: p.location,
            },
          };
          break;
        }

        case brevoTemplateConfig['Notification_for_new_Student']: {
          const p = payload as Notification_for_new_Student_Payload;
          brevoPostMessage = {
            sender: {
              name: 'DIT Team',
              email: 'info@diversityintechnology.org',
            },
            to: [
              {
                name: 'DIT ADMIN',
                email: process.env.ADMIN_EMAIL,
              },
            ],
            templateId: templateId,
            params: {
              studentName: p.studentName,
              email: p.email,
              course: p.course,
              enrollmentDate: p.enrollmentDate,
            },
          };

          break;
        }

        default:
          break;
      }

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
    } catch (err) {
      this.logger.error('An error occured while sending notification', err);
    }
  }
}
