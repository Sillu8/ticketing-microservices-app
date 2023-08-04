import express, {Request, Response} from 'express';
import { DatabaseConnectionError } from '../errors/database-conn-error';
import { RequestValidationError } from '../errors/req-validation-error';
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
    throw new RequestValidationError(errors.array());
  }

  const { email, password } = req.body;

  console.log('Creating a user...');
  throw new DatabaseConnectionError();
  res.send({});
  
});


export { router as signUpRouter };