import { CronJob } from 'cron';

let jobInstance = null;

const jobFunc = () => {
  console.log('job');
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
