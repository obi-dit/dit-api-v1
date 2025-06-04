import { Controller, Get } from '@nestjs/common';
import { ProgramService } from './program.service';
import { Public } from 'src/decorators/auth.decorator';
@Controller('programs')
export class ProgramController {
  constructor(private readonly programService: ProgramService) {}

  @Get('')
  @Public()
  async getAllPrograms() {
    return await this.programService.getAllPrograms();
  }
}
