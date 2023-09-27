import Queue from 'bull';
import { ExpirationCompletedPublisher } from '../events/publishers/expiration-completed-publisher';
import { natsWrapper } from '../nats-wrapper';

interface Payload {
  orderId: string;
}

// Payload is what kind of data will pass through the expirationQueue
export const expirationQueue = new Queue<Payload>('order:expiration',{
  redis: {
    host: process.env.REDIS_HOST
  }
});

// Will be exectured after the delay.
expirationQueue.process(async (job) => {
  console.log('Publish an event for orderId', job.data.orderId);
  new ExpirationCompletedPublisher(natsWrapper.client).publish({
    orderId: job.data.orderId,
  })
})