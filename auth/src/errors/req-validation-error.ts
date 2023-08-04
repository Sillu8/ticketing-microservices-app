// The reason that we are importing this is that when we start to build the subclass at some point in time
// we're going to have to receive a list of validation errors like in other words, the actual reasons
// that the request failed validation.
// So we are importing this type to make sure that we can describe the requirements or the errors that
// are going to be assigned to our subclass.
import { ValidationError } from 'express-validator';
import { CustomError } from './customError';



export class RequestValidationError extends CustomError {
  statusCode = 400;
  //
  constructor(public errors: ValidationError[]) {
    super('Invalid request!');

    //Only because we are extending a built-in class for ts.
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  serializeErrors() {
    return this.errors.map(error => {
      if (error.type === 'field') {
        return { message: error.msg, field: error.path };
      }
      return { message: error.msg };
    })
  }

}