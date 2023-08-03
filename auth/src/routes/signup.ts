import express, {Request, Response} from 'express';
import { body, validationResult } from 'express-validator';
const router = express.Router();

router.post('/api/users/signup',[
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email!'),
  body('password')
    .trim()
    .isLength({min: 4, max: 20})
    .withMessage('Password must be between 4 and 20 characters!')
],
(req:Request, res:Response) => {
  const errors = validationResult(req);

  if(!errors.isEmpty()){
    throw new Error('')
  }

  const { email, password } = req.body;

  console.log('Creating a user...');
  throw new Error('DB failure')
  res.send({});
  
});


export { router as signUpRouter };