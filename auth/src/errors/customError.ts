export abstract class CustomError extends Error {
  //says that if you are gonna extend customError abstract class, you must have a statusCode which is a num.
  // We can do this with interface but interface doesn't exist in js so we can't use it in 'instanceof' checks.

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