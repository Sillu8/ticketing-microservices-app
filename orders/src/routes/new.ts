import { BadRequestError, NotFoundError, OrderStatus, requireAuth, validateRequest } from '@srticketsapp/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 10 * 60;

router.post(
  '/api/orders',
  requireAuth,
  [
    body('ticketId')
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))  // This creates a coupling b/w services bcoz we are assuming the id will always be from a mongodb.
      .withMessage('TicketId must be provided!')
  ],
  validateRequest,
  async (req: Request, res: Response) => {

    const { ticketId } = req.body;
    // Find the ticket the user is trying to order from the db.
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      throw new NotFoundError();
    }


    // Make sure this ticket is not reserved. 
    const isReserved = await ticket.isReserved();
    if (isReserved) {
      throw new BadRequestError('Ticket already reserved!')
    }

    // Calculate an expiration date.
    const expiration = new Date();
    // Setting the time 10mins ahead.
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS)

    // Create order and save it to the db.
    const order = Order.build({
      userId: req.currentUser!.id,
      ticket: ticket,
      status: OrderStatus.Created,
      expiresAt: expiration,
    });
    await order.save();

    // Publish an order:created event.
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      status: order.status,
      version: order.version,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
    });

    res.status(201).send(order);
  });

export { router as newOrderRouter };