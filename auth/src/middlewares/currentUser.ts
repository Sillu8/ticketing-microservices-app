import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface UserPayLoad {
 id: string,
 email: string
}

//If you want to add a property to an existing object, this is how you do it. Tell TS, find the interface request and add the property there.
declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayLoad;
    }
  }
}

export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  if (!req.session?.jwt) {
    return next();
  }

  try {
    const payload = jwt.verify(req.session.jwt, process.env.JWT_KEY!) as UserPayLoad;
    req.currentUser = payload;
  } catch (err) {
  } finally {
    next()
  }

};