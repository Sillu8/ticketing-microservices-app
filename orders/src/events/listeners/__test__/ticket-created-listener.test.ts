import { TicketCreatedEvent } from '@srticketsapp/common';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketCreatedListener } from '../ticket-created-listener';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  // Create an instance of the listener
  const listener = new TicketCreatedListener(natsWrapper.client)

  // Create a fake data event
  const data: TicketCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    title: 'Coldplay',
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  }

  // Create a fake message object
  // We use ts-ignore because we don't want to implement all the properties inside message.
  // @ts-ignore 
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, data, msg };
}

it('creates and saves a ticket', async () => {
  const { listener, data, msg } = await setup();
  
  // Call the onMessage fn with data obj and msg object
  await listener.onMessage(data,msg)

  // Assertion to make sure ticket was created.
  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);

});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  // Call the onMessage fn with data obj and msg object
  await listener.onMessage(data,msg)
  
  // Assertion to make sure ack fn is called
  expect(msg.ack).toHaveBeenCalled();
});