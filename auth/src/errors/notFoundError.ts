import { CustomError } from './customError';

export class NotFoundError extends CustomError {
  statusCode = 404;

  constructor(){
    super('Route not found error!');

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  serializeErrors(): { message: string; field?: string | undefined; }[] {
    return [
      {message: 'Route not found!'}
    ]
  }
}