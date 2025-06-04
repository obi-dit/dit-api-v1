import { Body, Controller, Get, Post } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { Public } from 'src/decorators/auth.decorator';
import { CreateEnrollmentDto } from './dto/create.enrollment.dto';

@Controller('enrollment')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post('')
  @Public()
  async createEnrollment(@Body() createEnrollmentDto: CreateEnrollmentDto) {
    return await this.enrollmentService.createEnrollment(createEnrollmentDto);
  }
}
