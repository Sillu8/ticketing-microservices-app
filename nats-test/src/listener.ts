import nats, { Message } from 'node-nats-streaming';
import { randomBytes } from 'crypto';

console.clear()


const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222'
});

stan.on('connect', () => {
  console.log('Listener connected to NATS');

  const options = stan.subscriptionOptions().setManualAckMode(true);

  // Queue group is the second argument
  const subscription = stan.subscribe('ticket:created', 'listener-queue-group', options);


  subscription.on('message', (msg: Message) => {
    const data = msg.getData();
    console.log('Message Received.')

    if (typeof data === 'string') {
      console.log(`Received event #${msg.getSequence()}, with data: ${data}`);
    }
  })
})