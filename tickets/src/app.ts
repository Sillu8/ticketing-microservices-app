import express, { json } from 'express';
import 'express-async-errors'
import morgan from 'morgan';
import { currentUser, errorHandler,NotFoundError } from '@srticketsapp/common';



import cookieSession from 'cookie-session';
import { createTicketRouter } from './routes/new-ticket';
import { showTicketRouter } from './routes/show-ticket';
import { indexTicketRouter } from './routes';
import { updateTicketRouter } from './routes/update-ticket';

const app = express();
app.set('trust proxy', true); //For express to know req comes through a nginx proxy and it's ok.
app.use(json());
app.use(
  cookieSession({
    signed: false,  //Disable encryption because we are passing jwt
    secure: process.env.NODE_ENV !== 'test'    //use only for https .. it should be false in test env, or supertest can't send cookies
  })
)
app.use(currentUser);
app.use(express.urlencoded({ extended: false, limit: '50mb' }))
app.use(morgan('dev'));

app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(indexTicketRouter);
app.use(updateTicketRouter);


app.all('*', () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };