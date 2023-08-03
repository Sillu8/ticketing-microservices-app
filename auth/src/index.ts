import express, { json } from 'express';
import morgan from 'morgan';
import { currentUserRouter } from './routes/current-user';
import { signInRouter } from './routes/signin';
import { signUpRouter } from './routes/signup';
import { signOutRouter } from './routes/signout';
import { errorHandler } from './middlewares/errorHandler';

const app = express();
app.use(json());
app.use(express.urlencoded({ extended: false, limit:'50mb' }))
app.use(morgan('dev'));

app.use(currentUserRouter);
app.use(signInRouter);
app.use(signOutRouter);
app.use(signUpRouter);

app.use(errorHandler);

app.listen(3000, () => console.log('Auth listening at 3000!'))