import request from 'supertest';
import { app } from '../../app';
import { signin } from '../../test/setup';
import { Ticket } from '../../models/ticket';


it('has a route handler listening to /api/tickets for post req', async () => {
  const res = await request(app)
    .post('/api/tickets')
    .send({});

  expect(res.status).not.toEqual(404);
})

it('can only be accessed if user is signed in', async () => {

  await request(app)
    .post('/api/tickets')
    .send({})
    .expect(401);
})


it('returns status other than 401 if user is signed in', async () => {

  const res = await request(app)
    .post('/api/tickets')
    .set('Cookie', signin())
    .send({});

  expect(res.status).not.toEqual(401);
})


it('returns error on invalid title', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', signin())
    .send({
      title: '',
      price: 10
    })
    .expect(400);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', signin())
    .send({
      price: 10
    })
    .expect(400);
})



it('returns error on invalid price', async () => {

  await request(app)
    .post('/api/tickets')
    .set('Cookie', signin())
    .send({
      title: 'Coldplay',
      price: -10,
    })
    .expect(400);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', signin())
    .send({
      title: 'Coldplay',
    })
    .expect(400);

})


it('creates a ticket with valid inputs', async () => {

  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', signin())
    .send({
      title: 'asdf',
      price: 20
    })
    .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);  
  expect(tickets[0].price).toEqual(20);  
})
