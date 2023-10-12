import { app } from './app';
import mongoose from 'mongoose';
import { natsWrapper } from './nats-wrapper';
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener';
import { OrderCreatedListener } from './events/listeners/order-created-listener';


const connectDB = (async () => {

  if(!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined!')
  }

  if(!process.env.RAZORPAY_ID) {
    throw new Error('RAZORPAY_ID must be defined!')
  }

  if(!process.env.RAZORPAY_SECRET) {
    throw new Error('RAZORPAY_SECRET must be defined!')
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

    new OrderCancelledListener(natsWrapper.client).listen();
    new OrderCreatedListener(natsWrapper.client).listen();

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Payments connected to  DB!')
  } catch (error) {
    console.error(error);
  }
  app.listen(3000, () => console.log('Payments listening at 3000!'));
});

connectDB();
