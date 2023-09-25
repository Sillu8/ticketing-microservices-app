import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async () => {
  // Create instance of ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 5,
    userId: '123'
  });

  // Save ticket to db
  await ticket.save();

  // Fetch ticket twice
  const ticketOne = await Ticket.findById(ticket.id);
  const ticketTwo = await Ticket.findById(ticket.id);


  // Make 2 separate changes
  ticketOne?.set({ price: 10 });
  ticketTwo?.set({ price: 15 });

  // save the first fetched ticket and expect to work as expected
  await ticketOne?.save();

  // save the second fetched ticket and expect fail because the first fetched ticket changes the version
  try {
    await ticketTwo?.save();
  } catch (err) {
    return;
  }

  throw new Error('Should not reach here');
})

it('implements the version num on multiple saves', async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 5,
    userId: '123'
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);

})