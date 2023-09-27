import { Listener, OrderCreatedEvent, OrderStatus, subjects } from '@srticketsapp/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { expirationQueue } from '../../queues/expiration-queue';


export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const expiresAtDate = new Date(data.expiresAt).getTime();
    const currentTime = new Date().getTime();
    const delay = expiresAtDate - currentTime;

    console.log('Executed after',delay);

    // Adding a job to the queue.
    await expirationQueue.add({
      orderId: data.id
    }, {
      // The expirationQueue.process will be processed after this delay time.
      delay
    });

    msg.ack();
  }
}