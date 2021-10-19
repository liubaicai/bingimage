import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  Logger,
  Render,
} from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';
import * as fs from 'fs';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) { }

  @Get()
  @Render('index')
  async index() {
    const size = 12;
    const count = await this.appService.getImageCount();
    const images = await this.appService.getImageList(0, size);
    return {
      count: count,
      images: images,
      prev: null,
      next: '/pages/2',
    };
  }

  @Get('pages/:page')
  @Render('index')
  async page(@Param('page') page: string) {
    const size = 12;
    const currentPage: number = parseInt(page, 10) || 1;
    const count = await this.appService.getImageCount();
    const images = await this.appService.getImageList(currentPage - 1, size);
    const hasNext = count - size * (currentPage - 1) > 0;
    const d = {
      count: count,
      images: images,
      prev: currentPage === 1 ? null : `/pages/${currentPage - 1}`,
      next: hasNext ? `/pages/${currentPage + 1}` : null,
    };
    return d;
  }

  @Get('today')
  async today(@Res() res: Response) {
    const images = await this.appService.getImageList(0, 1);
    const image = images[0];
    if (!image) {
      return {
        statusCode: 404,
        message: 'Cannot GET Image',
        error: 'Not Found',
      };
    } else {
      const rootPath = './public/data';
      const bingName = `${image.urlBase
        .split('/')
      [image.urlBase.split('/').length - 1].replace('th?id=', '')}_UHD.jpg`;
      const bingPath = `${rootPath}/image/${bingName}`;
      fs.createReadStream(bingPath).pipe(res);
    }
  }

  @Get('download')
  async download(@Query('id') id: string, @Res() res: Response) {
    const tid = parseInt(id, 10) || 1;
    const image = await this.appService.getImage(tid);
    if (!image) {
      return {
        statusCode: 404,
        message: 'Cannot GET Image',
        error: 'Not Found',
      };
    } else {
      image.downloadCount++;
      await this.appService.saveImage(image);
      const rootPath = './public/data';
      const bingName = `${image.urlBase
        .split('/')
      [image.urlBase.split('/').length - 1].replace('th?id=', '')}_UHD.jpg`;
      const bingName2 = `${image.urlBase
        .split('/')
      [image.urlBase.split('/').length - 1].replace('th?id=', '')}_1920x1080.jpg`;
      const bingPath = `${rootPath}/image/${bingName}`;
      const bingPath2 = `${rootPath}/image/${bingName2}`;

      if (fs.existsSync(bingPath)) {
        res.download(bingPath, bingName);
      } else {
        res.download(bingPath2, bingName2);
      }
    }
  }
}
