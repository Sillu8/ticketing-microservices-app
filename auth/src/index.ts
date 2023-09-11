import { app } from './app';
import mongoose from 'mongoose';

const connectDB = (async () => {

  if(!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined!')
  }

  if(!process.env.MONGO_URI){
    throw new Error('MONGO_URI must be defined!');
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Auth connected to DB!')
  } catch (error) {
    console.error(error);
  }
  app.listen(3000, () => console.log('Auth listening at 3000!'));
});

connectDB();
