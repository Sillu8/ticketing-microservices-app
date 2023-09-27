import { OrderCreatedEvent, OrderStatus } from '@srticketsapp/common';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCreatedListener } from '../order-created-listener';
import mongoose from 'mongoose';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  // Create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client)

  // Create and save a ticket
  const ticket = Ticket.build({
    title: 'Coldplay',
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  })
  await ticket.save();

  // Create a fake data event
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
    expiresAt: 'hklh',
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

it('sets the user id of the ticket', async () => {
  const { listener, data, ticket, msg } = await setup();
  
  // Call the onMessage fn with data obj and msg object
  await listener.onMessage(data,msg)

  // Assertion to make sure ticket was created.
  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket).toBeDefined();
  expect(updatedTicket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data,msg)
  
  // Assertion to make sure ack fn is called
  expect(msg.ack).toHaveBeenCalled();
});


it('publishes a ticket updated event', async () => {
  const { listener, data, msg, ticket } = await setup();

  await listener.onMessage(data,msg)
  expect(natsWrapper.client.publish).toHaveBeenCalled()

  const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])
  
  expect(data.id).toEqual(ticketUpdatedData.orderId)
});