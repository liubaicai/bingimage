import { CronJob } from 'cron';
import * as Path from 'path';
import * as Fs from 'fs';
import { AppModule } from 'src/app.module';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Image } from '../model/image/image.entity';

let app = null;

NestFactory.create<NestExpressApplication>(AppModule).then(result => {
  app = result;
});

let jobInstance = null;

const jobFunc = async () => {
  // const service = app.get('ImageService');
  // const image = new Image();
  // image.name = 'test';
  // image.description = 'test';
  // image.filename = '123';
  // image.views = 456;
  // image.isPublished = false;
  // await service.insert(image);
  const service = app.get('HttpService');
  const host = 'http://www.bing.com';
  const url = `${host}/HPImageArchive.aspx?format=js&idx=-1&n=1`;
  const urlResult = await service.instance.get(url);
  const rootObj = urlResult.data.images[0];
  const bingUrlBase = `${host}${rootObj.urlbase}`;
  const bingUrl = `${bingUrlBase}_1920x1080.jpg`;
  const rootPath = Path.resolve(__dirname, '..', '..', 'public', 'data');
  const bingName = bingUrl
    .split('/')
    [bingUrl.split('/').length - 1].replace('th?id=', '');
  const bingPath = `${rootPath}/image/${bingName}`;

  const imageResult = await service.instance.request({
    url: bingUrl,
    method: 'GET',
    responseType: 'stream',
  });
  const writer = Fs.createWriteStream(bingPath);
  imageResult.data.pipe(writer);
  await new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });

  jobInstance.stop();
};

const job = () => {
  if (!jobInstance) {
    jobInstance = new CronJob('0 * * * * *', jobFunc);
    jobInstance.start();
  }
  return jobInstance;
};

const init = () => {
  jobInstance = new CronJob('0 * * * * *', jobFunc);
  jobInstance.start();
};

export default { job, init };
