import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create.enrollment.dto';
import Stripe from 'stripe';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { TransactionStatus } from '@prisma/client';
import { NotificationService } from 'src/notification/notification.service';
import { brevoTemplateConfig } from 'src/utils/helper';

@Injectable()
export class EnrollmentService {
  private stripe: Stripe;
  public constructor(
    public readonly prisma: PrismaService,
    public readonly userService: AuthService,
    public readonly notificationService: NotificationService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_KEY, {
      apiVersion: '2025-05-28.basil',
    });
  }
  async createEnrollment(createEnrollmentDto: CreateEnrollmentDto) {
    console.log('log', createEnrollmentDto);
    if (!createEnrollmentDto.programId) {
      throw new BadRequestException('ProgramId is required');
    }

    let userData;

    //check if user already exit on the platform
    const user = await this.prisma.user.findFirst({
      where: {
        email: createEnrollmentDto.email,
      },
    });

    if (!user) {
      userData =
        await this.userService.createDetailsFromEnrollment(createEnrollmentDto);
    }

    //check if enrollment exist
    const checkIfEnrollmentExist = await this.prisma.enrollment.findFirst({
      where: {
        studentId: userData.id,
        programId: createEnrollmentDto.programId,
      },
    });

    if (checkIfEnrollmentExist) {
      throw new BadRequestException('Enrollment already Exist');
    }

    //find program by program Id
    const program = await this.prisma.program.findFirst({
      where: {
        id: createEnrollmentDto.programId,
      },
    });

    const amount = program.installmentalFee * 100; // convert to cents
    const session = await this.stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: program.title,
            },
            unit_amount: amount, // amount in cents ($50.00)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.SUCCESS_URL}?course=${program.title}`,
      cancel_url: 'https://yourdomain.com/cancel',
    });

    //Save Transaction to database
    if (!session) {
      throw new BadRequestException('An error occured generating session');
    }
    const userInfo = await this.prisma.user.findFirst({
      where: {
        email: createEnrollmentDto.email,
      },
    });
    //create transaction
    await this.prisma.transaction.create({
      data: {
        entityId: createEnrollmentDto.programId,
        amount: program.installmentalFee,
        reference: session.id,
        paymentMethod: 'card',
        userId: userInfo.id,
      },
    });

    //create user with email

    return { url: session.url };
  }

  async backgroundJobServiceForEnrollment() {
    // 1. Optimization: Only fetch the transactions that actually need processing.
    const unpaidTransactions = await this.prisma.transaction.findMany({
      where: {
        status: TransactionStatus.UNPAID,
      },
      include: {
        user: true,
      },
    });

    // 2. Loop through only the unpaid transactions.
    for (const transaction of unpaidTransactions) {
      try {
        const session = await this.stripe.checkout.sessions.retrieve(
          transaction.reference,
        );

        if (session.status === 'complete') {
          await this.prisma.$transaction(async (prisma) => {
            await prisma.transaction.update({
              where: { id: transaction.id },
              data: { status: TransactionStatus.PAID },
            });

            await prisma.enrollment.create({
              data: {
                studentId: transaction.userId,
                programId: transaction.entityId,
                status: 'approved',
                price: String(transaction.amount),
                isInstallment: true,
              },
            });
          });

          // 5. NOTIFICATION LOGIC MOVED HERE: Only send emails after a successful payment
          //    and enrollment.
          const program = await this.prisma.program.findFirst({
            where: { id: transaction.entityId },
          });

          if (!program) {
            console.error(`Program not found for ID: ${transaction.entityId}`);
            continue;
          }

          await this.notificationService
            .sendNotification(
              brevoTemplateConfig['Comfirmation_After_Enrollment'],
              {
                studentName: `${transaction.user.lastName} ${transaction.user.firstName}`,
                email: transaction.user.email,
                programName: program.title,
                // Using a more readable date format is better for emails than Date.now()
                startDate: new Date().toLocaleDateString('en-US'),
                location: 'Microsoft Teams',
              },
            )
            .then(async () => {
              await this.notificationService.sendNotification(
                brevoTemplateConfig['Notification_for_new_Student'],
                {
                  studentName: `${transaction.user.lastName} ${transaction.user.firstName}`,
                  email: transaction.user.email,
                  course: program.title,
                  enrollmentDate: new Date().toLocaleDateString('en-US'),
                },
              );
            });
        } else if (session.status === 'expired') {
          // If the session is expired, update the status and do nothing else.
          await this.prisma.transaction.update({
            where: { id: transaction.id },
            data: { status: TransactionStatus.EXPIRED },
          });
        }
      } catch (error) {
        console.error(
          `Failed to process transaction ID: ${transaction.id}. Error:`,
          error,
        );
        // Continue to the next transaction in the loop
      }
    }
  }
}
