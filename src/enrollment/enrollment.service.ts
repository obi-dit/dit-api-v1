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

@Injectable()
export class EnrollmentService {
  private stripe: Stripe;
  public constructor(
    public readonly prisma: PrismaService,
    public readonly userService: AuthService,
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

    const userData =
      await this.userService.createDetailsFromEnrollment(createEnrollmentDto);
    //create transaction
    await this.prisma.transaction.create({
      data: {
        entityId: createEnrollmentDto.programId,
        amount: program.installmentalFee,
        reference: session.id,
        paymentMethod: 'card',
        userId: userData.id,
      },
    });

    //create user with email

    return { url: session.url };
  }

  async backgroundJobServiceForEnrollment() {
    const allTransaction = await this.prisma.transaction.findMany();

    for await (let transaction of allTransaction) {
      if (transaction.status === TransactionStatus.UNPAID) {
        const session = await this.stripe.checkout.sessions.retrieve(
          transaction.reference,
        );
        if (session.status === 'complete') {
          await this.prisma.transaction.update({
            where: { id: transaction.id },
            data: {
              status: TransactionStatus.PAID,
            },
          });

          await this.prisma.enrollment.create({
            data: {
              studentId: transaction.userId,
              programId: transaction.entityId,
              status: 'approved',
              price: String(transaction.amount),
              isInstallment: true,
            },
          });
        }

        if (session.status === 'expired') {
          await this.prisma.transaction.update({
            where: { id: transaction.id },
            data: {
              status: TransactionStatus.EXPIRED,
            },
          });
        }
      }
    }
  }
}
