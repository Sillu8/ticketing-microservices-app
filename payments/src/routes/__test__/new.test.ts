import request from 'supertest';
import { app } from '../../app';
import { signin } from '../../test/setup';
import mongoose from 'mongoose';
import { Order } from '../../models/order';
import { OrderStatus } from '@srticketsapp/common';
import { razorpay } from '../../razorpay';
import { Payment } from '../../models/payment';


const getDateInFormat = () => {
// Create a new Date object to get the current date
const currentDate = new Date();

// Extract the year, month, and day from the current date
const year = currentDate.getFullYear();
const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based, so we add 1 and format to 2 digits.
const day = currentDate.getDate().toString().padStart(2, '0');

// Combine them in the desired format
const formattedDate = year + '-' + month + '-' + day;

return (formattedDate)

}


it('returns a 404 when purchasing an order that does not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', signin())
    .send({
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it('returns a 401 when purchasing an order that doesnt belong to the user', async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 20,
    status: OrderStatus.Created,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', signin())
    .send({
      orderId: order.id,
    })
    .expect(401);
});

it('returns a 400 when purchasing a cancelled order', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price: 20,
    status: OrderStatus.Cancelled,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', signin(userId))
    .send({
      orderId: order.id,
    })
    .expect(400);
});



jest.mock('../../razorpay');

// Not really testing reaching out to stripe api.
it('returns a 201 with valid inputs', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price: 20,
    status: OrderStatus.Created,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', signin(userId))
    .send({
      orderId: order.id,
    })
    .expect(201);

  const chargeOptions = (razorpay.orders.create as jest.Mock).mock.calls[0][0]
  expect(chargeOptions.amount).toEqual(20 * 100);
});


