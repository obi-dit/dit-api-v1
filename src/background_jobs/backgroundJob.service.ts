import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EnrollmentService } from 'src/enrollment/enrollment.service';
@Injectable()
export class BackgroundJobService {
  private readonly logger = new Logger(BackgroundJobService.name);

  constructor(
    @Inject(EnrollmentService)
    private readonly scheduleService: EnrollmentService,
  ) {}
  @Cron(CronExpression.EVERY_30_SECONDS)
  handleCron() {
    this.scheduleService.backgroundJobServiceForEnrollment();
  }
}
