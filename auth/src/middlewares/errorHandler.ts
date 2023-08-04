import { Request, Response, NextFunction } from 'express';
import { RequestValidationError } from '../errors/req-validation-error';
import { DatabaseConnectionError } from '../errors/database-conn-error';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {


  if (err instanceof RequestValidationError) {
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }


  if (err instanceof DatabaseConnectionError) {
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }

  res.status(400).send({
    errors: [
      { message: 'Something unknown has occurred!' }
    ]
  })

};