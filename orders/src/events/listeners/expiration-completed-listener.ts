import { ExpirationCompleteEvent, Listener, OrderStatus, subjects } from '@srticketsapp/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';

export class ExpirationCompletedListener extends Listener<ExpirationCompleteEvent> {
  readonly subject = subjects.ExpirationComplete;
  queueGroupName = queueGroupName;

  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
    const { orderId } = data;

    const order = await Order.findById(orderId).populate('ticket');

    if(!order) {
      throw new Error('Order not found!');
    }

    order.set({
      status: OrderStatus.Cancelled,
      // ticket: null, 
      // we don't have to clear out ticket because when we check if the ticket is reserved, we use status
      // Also if we clear it out, we won't be able to associate the cancelled order with which ticket was cancelled to the user.
    });
    await order.save();

    await new OrderCancelledPublisher(this.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
        price: order.ticket.price
      }
    })

    msg.ack();
  }
}