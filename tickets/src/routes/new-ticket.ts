import { requireAuth, validateRequest } from '@srticketsapp/common';
import { body } from 'express-validator';
import { Router, Request, Response } from 'express';
import { Ticket } from '../models/ticket';
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher';
import { natsWrapper } from '../nats-wrapper';


const router = Router();

router.post('/api/tickets',
  requireAuth,
  [
    body('title')
      .not()
      .isEmpty()
      .withMessage('Title is required!'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be greater than 0!')
  ],
  validateRequest,
  async (req: Request, res: Response) => {

    const {title,price} = req.body;

    const ticket = Ticket.build({
      title,
      price,
      userId: req.currentUser!.id
    });

    await ticket.save();

    // We add ticket because we can't be sure if the data that came in the req.body was updated in the db.
    await new TicketCreatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title, 
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version
    })

    res.status(201).send(ticket);
  });

export { router as createTicketRouter } 