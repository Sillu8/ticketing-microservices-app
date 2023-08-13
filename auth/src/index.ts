import { app } from './app';
import { connectDB } from './config/db';

connectDB()
app.listen(3000, () => console.log('Auth listening at 3000!'));