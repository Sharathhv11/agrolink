const { Queue } = require('bullmq');
const { getRedisConnection } = require('../config/redis');

const notificationQueueName = 'job-notifications';
let queueInstance = null;

function getNotificationQueue() {
  if (!queueInstance) {
    queueInstance = new Queue(notificationQueueName, {
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: 5,
        removeOnComplete: 1000,
        removeOnFail: 2000,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    });
  }

  return queueInstance;
}

module.exports = {
  notificationQueueName,
  getNotificationQueue,
};
