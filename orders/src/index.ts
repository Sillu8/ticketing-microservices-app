import { app } from './app';
import mongoose from 'mongoose';
import { natsWrapper } from './nats-wrapper';
import { TicketCreatedListener } from './events/listeners/ticket-created-listener';
import { TicketUpdatedListener } from './events/listeners/ticket-updated-listener';
import { ExpirationCompletedListener } from './events/listeners/expiration-completed-listener';
import { PaymentCreatedListener } from './events/listeners/payment-created-listener';


const connectDB = (async () => {

  if(!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined!')
  }

  if(!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined!')
  }

  if(!process.env.NATS_URL){
    throw new Error('NATS_URL must be defined!')
  }

  if(!process.env.NATS_CLUSTER_ID){
    throw new Error('NATS_CLUSTER_ID must be defined!')
  }

  if(!process.env.NATS_CLIENT_ID){
    throw new Error('NATS_CLIENT_ID must be defined!')
  }

  try {
    // The first id ticketing is the cluster id which has been mentioned in the nats-depl args.  
    await natsWrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID, process.env.NATS_URL);
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed');
      process.exit();
    })
    
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    new TicketCreatedListener(natsWrapper.client).listen();
    new TicketUpdatedListener(natsWrapper.client).listen();
    new ExpirationCompletedListener(natsWrapper.client).listen();
    new PaymentCreatedListener(natsWrapper.client).listen();


    await mongoose.connect(process.env.MONGO_URI);
    console.log('Orders connected to  DB!')
  } catch (error) {
    console.error(error);
  }
  app.listen(3000, () => console.log('Orders listening at 3000!'));
});

connectDB();
