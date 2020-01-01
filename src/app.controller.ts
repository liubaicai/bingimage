import { Controller, Get, Render } from '@nestjs/common';
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
