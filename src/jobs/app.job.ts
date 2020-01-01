import { CronJob } from 'cron';
import { AppModule } from 'src/app.module';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { async } from 'rxjs/internal/scheduler/async';

let app = null;

NestFactory.create<NestExpressApplication>(AppModule).then(result => {
  app = result;
});

let jobInstance = null;

const jobFunc = async () => {
  const service = app.get('ImageService');
  await service.insert();
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
