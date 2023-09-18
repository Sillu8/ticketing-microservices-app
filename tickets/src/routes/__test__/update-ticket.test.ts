import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { signin } from '../../test/setup';
import { natsWrapper } from '../../nats-wrapper';

const title = 'Coldplay';
const price = 20;

it('returns a 404 if the provided id does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', signin())
    .send({
      title, price
    })
    .expect(404)
})


it('returns a 401 if the user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title, price
    })
    .expect(401)
})

it('returns a 401 if the user does not own the ticket', async () => {
  const res = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', signin())
    .send({
      title, price
    })

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', signin())
    .send({
      title: 'Batman', price: 15
    })
    .expect(401);


})


it('returns a 400 if the user provides an invalid title or price', async () => {
  const cookie = signin();

  const res = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', cookie)
    .send({
      title, price
    })

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: '',
      price
    })
    .expect(400)

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', cookie)
    .send({
      title,
      price: -10,
    })
    .expect(400)
})


it('updates the ticket if valid inputs are provided', async () => {
  const cookie = signin();

  const res = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', cookie)
    .send({
      title, price
    })

    await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'New title',
      price: 100
    })
    .expect(200);

  const ticketRes = await request(app)
  .get(`/api/tickets/${res.body.id}`)
  .send();

  expect(ticketRes.body.title).toEqual('New title')
  expect(ticketRes.body.price).toEqual(100)
})


it('publishes an event', async () => {
  const cookie = signin();

  const res = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', cookie)
    .send({
      title, price
    })

    await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'New title',
      price: 100
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
})
