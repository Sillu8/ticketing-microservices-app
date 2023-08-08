import mongoose from 'mongoose';

export const connectDB = (async () => {
  try {
    await mongoose.connect('mongodb://auth-mongo-srv:27017/auth');
    console.log('Connected to DB!')
  } catch (error) {
    console.error(error);
  }
});
