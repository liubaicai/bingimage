import { Controller, Get, Render } from '@nestjs/common';
import Job from './jobs/app.job';
import { Connection } from 'typeorm';

@Controller()
export class AppController {
  @Get()
  @Render('index')
  async root() {
    return { message: Job.job().nextDates() };
  }
}
