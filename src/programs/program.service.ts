import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class ProgramService {
  private readonly logger = new Logger(ProgramService.name);
  constructor(private readonly prisma: PrismaService) {}
  async getAllPrograms() {
    try {
      const allPrograms = await this.prisma.program.findMany({});

      return allPrograms;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to get all programs');
    }
  }
}
