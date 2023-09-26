import { TicketUpdatedEvent } from '@srticketsapp/common';
import { natsWrapper } from '../../../nats-wrapper';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';
import { TicketUpdatedListener } from '../ticket-updated-listener';

const setup = async () => {
  // Create an instance of the listener
  const listener = new TicketUpdatedListener(natsWrapper.client)

  // Create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Colplay',
    price: 20
  })
  await ticket.save();

  // Create a fake data obj
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: 'Imagine Dragons',
    price: 19,
    userId: new mongoose.Types.ObjectId().toHexString(),
  }

  // Create a fake message object
  // We use ts-ignore because we don't want to implement all the properties inside message.
  // @ts-ignore 
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, data, msg, ticket };
}

it('finds, updates and saves a ticket', async () => {
  const { listener, data, msg, ticket } = await setup();

  // Call the onMessage fn with data obj and msg object
  await listener.onMessage(data, msg)

  // Assertion to make sure ticket was created.
  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  // Call the onMessage fn with data obj and msg object
  await listener.onMessage(data, msg)

  // Assertion to make sure ack fn is called
  expect(msg.ack).toHaveBeenCalled();
});



it('doesn\'t acks if event has skipped version num', async () => {
  const { listener, data, msg } = await setup();
  data.version = 10;

  // Call the onMessage fn with data obj and msg object
  try {
    await listener.onMessage(data, msg)
  } catch (error) {}

  // Assertion to make sure ack fn is called
  expect(msg.ack).not.toHaveBeenCalled();
});