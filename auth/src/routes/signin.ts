import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import { validateRequest, BadRequestError } from '@srticketsapp/common';

import { User } from '../models/user';
import { Password } from '../services/password';
const router = express.Router();

router.post('/api/users/signin',
  [
    body('email')
      .isEmail()
      .withMessage('Email is invalid!'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('Please enter a password!')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if(!existingUser) {
      throw new BadRequestError('Invalid credentials!');
    }

    const passwordsMatch = await Password.compare(existingUser.password, password);

    if(!passwordsMatch) {
      throw new BadRequestError('Invalid credentials!');
    }


    //Generate JWT
    const userJwt = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email
      }, process.env.JWT_KEY! //exclamation mark indicates that the check for the env has been already done before the start of the db connection, so we don't have to check again here right before the code.
    );

    // Store it on session object, cookie-session library will serialize it and send it to the client browser
    // req.session.jwt = userJwt; This throws an error because ts doesn't want to assume there already exists an object.
    req.session = {
      jwt: userJwt //converted to json and then to base 64. First we have to decode to utf 8, get the jwt.
    }

    res.status(200).send(existingUser);
  }
);


export { router as signInRouter };