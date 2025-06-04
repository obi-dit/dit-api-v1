import { Module } from '@nestjs/common';
import { ProgramController } from './program.controller';
import { ProgramService } from './program.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ProgramController],
  providers: [ProgramService, PrismaService],
})
export class ProgramModule {}
