export abstract class CustomError extends Error {
  //says that if you are gonna extend customError abstract class, you must have a statusCode which is a num.
  abstract statusCode: number;

  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this,CustomError.prototype);
  }


  abstract serializeErrors(): {
    message: string,
    field?: string
  }[];
}