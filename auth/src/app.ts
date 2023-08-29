import express, { json } from 'express';
import 'express-async-errors'
import morgan from 'morgan';
import { errorHandler,NotFoundError } from '@srticketsapp/common';


import { currentUserRouter } from './routes/current-user';
import { signInRouter } from './routes/signin';
import { signUpRouter } from './routes/signup';
import { signOutRouter } from './routes/signout';
import cookieSession from 'cookie-session';

const app = express();
app.set('trust proxy', true); //For express to know req comes through a nginx proxy and it's ok.
app.use(json());
app.use(
  cookieSession({
    signed: false,  //Disable encryption because we are passing jwt
    secure: process.env.NODE_ENV !== 'test'    //use only for https .. it should be false in test env, or supertest can't send cookies
  })
)
app.use(express.urlencoded({ extended: false, limit: '50mb' }))
app.use(morgan('dev'));

app.use(currentUserRouter);
app.use(signInRouter);
app.use(signOutRouter);
app.use(signUpRouter);

app.all('*', () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };