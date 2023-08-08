import { scrypt, randomBytes } from 'crypto';
import { promisify } from "util";

//scrypt is callback based and we would like to have promise based implemetation which we can use with async await, so promisify returns a promisified version.
const scryptAsync = promisify(scrypt);

export class Password {
  //static functions do not need instance to access methods.
  static async toHash(password: string) {
    const salt = randomBytes(8).toString('hex');
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;

    return `${buf.toString('hex')}.${salt}`;

  }

  static async compare(storedPassword: string, suppliedPassword: string) {
    //We get the same salt as the one stored in the db.
    const [hashedPassword, salt] = storedPassword.split('.');
    const buf = (await scryptAsync(suppliedPassword,salt,64)) as Buffer;

    return buf.toString('hex') === hashedPassword;
  }


}