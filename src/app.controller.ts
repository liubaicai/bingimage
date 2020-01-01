import { Controller, Get, Render } from '@nestjs/common';
import Job from './jobs/app.job';
import { ImageService } from './model/image/image.service';

@Controller()
export class AppController {
  constructor(private readonly imageService: ImageService) {}

  @Get()
  @Render('index')
  async root() {
    return { message: (await this.imageService.findAll()).length };
  }
}
