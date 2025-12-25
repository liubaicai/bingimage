import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Interval, Timeout } from '@nestjs/schedule';
import dateFormat from 'dateformat';
import * as fs from 'fs';
import { firstValueFrom } from 'rxjs';
import { AppService } from '../app.service';

@Injectable()
export class TasksService {
  constructor(
    private readonly appService: AppService,
    private readonly httpService: HttpService,
  ) {}

  private readonly logger = new Logger(TasksService.name);

  bingHost = 'http://www.bing.com';
  bingUrl =
    'http://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN';

  @Timeout(10000)
  async handleTimeout() {
    await this.handle();
    this.logger.log('Called when timeout 10000');
  }
  @Interval(3600000)
  async handleInterval() {
    await this.handle();
    this.logger.log('Called when interval 3600000');
  }

  async handle() {
    const day1 = new Date();
    const today = dateFormat(day1, 'yyyymmdd');
    const image = await this.appService.getImageByDate(today);
    const root = './public';
    let exist = false;
    if (image) {
      const path = `${root}${image.downloadUrl}`;
      exist = fs.existsSync(path);
    }
    if (exist === false) {
      this.logger.log('start download...');
      const resp = await firstValueFrom(this.httpService.get<any>(this.bingUrl));
      const rootObj = resp.data.images[0];

      const rootPath = './public/data';
      const publicRootPath = '/data';
      const bingUrlBase = `${this.bingHost}${rootObj.urlbase}`;
      const bingUrl = `${bingUrlBase}_UHD.jpg`;
      const bingThumbUrl = `${bingUrlBase}_640x360.jpg`;
      const bingName = bingUrl
        .split('/')
        [bingUrl.split('/').length - 1].replace('th?id=', '');
      const bingThumbName = bingThumbUrl
        .split('/')
        [bingThumbUrl.split('/').length - 1].replace('th?id=', '');
      const bingPath = `${rootPath}/image/${bingName}`;
      const bingThumbPath = `${rootPath}/thumb/${bingThumbName}`;

      await this.downloadFile(bingUrl, bingPath);
      await this.downloadFile(bingThumbUrl, bingThumbPath);
      const img: any = {
        startDate: rootObj.startdate,
        fullStartDate: rootObj.fullstartdate,
        endDate: rootObj.enddate,
        url: rootObj.url,
        urlBase: rootObj.urlbase,
        copyright: rootObj.copyright,
        copyrightLink: rootObj.copyrightlink,
        thumbnailUrl: `${publicRootPath}/thumb/${bingThumbName}`,
        downloadUrl: `${publicRootPath}/image/${bingName}`,
        downloadCount: 0,
      };
      if (image) {
        img.id = image.id;
        img.downloadCount = image.downloadCount;
      }
      await this.appService.saveImage(img);
    }
  }

  async downloadFile(url: string, filepath: string) {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
    const writer = fs.createWriteStream(`${filepath}.tmp`, { flags: 'w+' });
    const response = await firstValueFrom(
      this.httpService.get(url, {
        responseType: 'stream',
      })
    );
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
      writer.on('finish', async () => {
        await fs.renameSync(`${filepath}.tmp`, filepath);
        resolve(null);
      });
      writer.on('error', reject);
    });
  }
}
