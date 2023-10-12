import { BadRequestError, NotAuthorizedError, NotFoundError, OrderStatus, requireAuth, validateRequest } from '@srticketsapp/common';
import express, { Request, Response, response } from 'express';
import { body } from 'express-validator';
import { Order } from '../models/order';
import { razorpay } from '../razorpay';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { natsWrapper } from '../nats-wrapper';



const router = express.Router();

router.post('/api/payments',
  requireAuth,
  [
    body('orderId')
      .not()
      .isEmpty()
  ],
  validateRequest,
  async (req: Request, res: Response) => {

    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('Cannot pay for an cancelled order!');
    }

    try {
      const response = await razorpay.orders.create({
        amount: order.price * 100, //paise into rs conversion
        currency: "INR",
        receipt: orderId,
      })
      
      const payment = Payment.build({
        orderId,
        razorpayId: response.id
      });
      await payment.save();

      new PaymentCreatedPublisher(natsWrapper.client).publish({
        id: payment.id,
        orderId: payment.orderId,
      })
      
    } catch (error) {
      console.log(error);
      throw new BadRequestError('Could not reach razorpay!')
    }

    res.status(201).send({ success: true });
  })

export { router as createChargeRouter };