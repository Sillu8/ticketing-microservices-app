import { OrderCancelledEvent } from '@srticketsapp/common';
import { natsWrapper } from '../../../nats-wrapper';
import mongoose from 'mongoose';
import { Ticket } from '../../../models/ticket';
import { OrderCancelledListener } from '../order-cancelled-listener';

const setup = async () => {
  // Create an instance of the listener
  const listener = new OrderCancelledListener(natsWrapper.client)

  const orderId = new mongoose.Types.ObjectId().toHexString();

  // Create and save a ticket
  const ticket = Ticket.build({
    title: 'Coldplay',
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  })
  ticket.set({ orderId })
  await ticket.save();

  // Create a fake data event
  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  }

  // Create a fake message object
  // @ts-ignore 
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, data, msg, ticket, orderId };
}

it('updates the ticket, publishes an event and acks the message', async () => {
  const { listener, data, ticket, msg } = await setup();

  // Call the onMessage fn with data obj and msg object
  await listener.onMessage(data, msg)

  // Assertion to make sure ticket was created.
  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket).toBeDefined();
  expect(updatedTicket!.orderId).not.toBeDefined();
  expect(msg.ack).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalled()

});

