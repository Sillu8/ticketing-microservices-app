import { Listener, OrderCreatedEvent, subjects } from '@srticketsapp/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';
import { natsWrapper } from '../../nats-wrapper';


export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    // Find the ticket that the order is reserving.
    const ticket = await Ticket.findById(data.ticket.id);

    // Throw error, if ticket doesn't exist
    if (!ticket) {
      throw new Error('Ticket not found!');
    }

    // Mark the ticket as being reserved its orderId property
    ticket.set({ orderId: data.id })

    // Save the ticket
    await ticket.save();

    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
      orderId: ticket.orderId,
      version: ticket.version,
    })

    // Ack the message
    msg.ack();
  }
}