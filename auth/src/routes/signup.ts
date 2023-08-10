import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { RequestValidationError } from '../errors/req-validation-error';
import { body, validationResult } from 'express-validator';
import { User } from '../models/user';
import { BadRequestError } from '../errors/badRequestError';
const router = express.Router();

router.post('/api/users/signup', [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email!'),
  body('password')
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage('Password must be between 4 and 20 characters!')
],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw new RequestValidationError(errors.array());
    }

    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new BadRequestError('User already exists!');
    }

    const user = User.build({ email, password });
    await user.save();
  

    //Generate JWT
    const userJwt = jwt.sign(
      {
        id: user._id,
        email: user.email
      }, process.env.JWT_KEY! //exclamation mark indicates that the check for the env has been already done before the start of the db connection, so we don't have to check again here right before the code.
    );

    // Store it on session object, cookie-session library will serialize it and send it to the client browser
    // req.session.jwt = userJwt; This throws an error because ts doesn't want to assume there already exists an object.
    req.session = {
      jwt: userJwt //converted to json and then to base 64. First we have to decode to utf 8, get the jwt.
    }

    res.status(201).send(user);

  });


export { router as signUpRouter };