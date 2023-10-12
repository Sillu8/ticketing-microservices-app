import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';


jest.mock('../nats-wrapper')

process.env.STRIPE_KEY = 'sk_test_51NyclZSJ7MPhHjINBV7aKkKnWQ1YkQF0LOyWDTracDbpOjCo2XRCsZjouRm8meeoHQkJLduY3fuZJzpHs7AVKaaH00b50y9Cbm';

let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = 'asdfasdf';

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  // To clear the mock implementation because jest will store the values and the number of times it was called and other info.
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});



// Optional argument id
export const signin = (id?: string) => {
  //Build a JWT payload. {id, email}
  const payload = {
    // If optional id is not present, then create new. 
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com'
  };

  //Create the JWT!
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  //Build session object. {jwt: MY_JWT}
  const session = { jwt: token };

  //turn that session into json
  const sessionJSON = JSON.stringify(session);

  // Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  // Return string thats the cookie with the encoded data
  return [`session=${base64}`];
}