import { Listener, OrderStatus, PaymentCreatedEvent, subjects } from '@srticketsapp/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent>{
  readonly subject = subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId);

    if(!order){
      throw new Error('Order not found');
    }

    order.set({
      status: OrderStatus.Complete
    })

    msg.ack();
    // We are not going to update the order anymore. So we do not have to publish the order to change the version of the orders.
  }
}