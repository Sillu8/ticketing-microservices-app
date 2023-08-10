import mongoose from 'mongoose';
import { Password } from '../services/password';


//Interface for describing properties in the schema.
interface IUser {
  email: string,
  password: string,
};

//Interface that describes properties that a User model has.
interface UserModel extends mongoose.Model<UserDoc> {
  //build function returns data like UserDoc.
  build(attributes: IUser): UserDoc;
}


//Interface that describes the properties a user doc has.
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
  updatedAt: Date;
  createdAt: Date;
}


const userSchema = new mongoose.Schema<IUser>({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
})

//anytime we save a doc in userSchema, this middleware will be called. 
//mongoose doesn't know async await, so after the entire function is done, call done()
//We will get the doc here using this.
//If we use arrow function as callback, the doc in this will be overridden by the context of this file which is user.ts.
userSchema.pre('save', async function(done) {
  
  if(this.isModified('password')){
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }
  done();
  
})


userSchema.statics.build = (attributes: IUser) => {
  return new User(attributes);
}

//Generics arguments that are types. model function will return the data in the type of second argument
const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User }


/*
From github doubt https://github.com/Automattic/mongoose/issues/11148
Unfortunately this is expected behavior for several reasons. await User.create({ foo: 'bar' }); is fine because 
Mongoose doesn't necessarily know at compile time whether bar is required or whether bar has a default. 
Similarly, new User({ name: false, age: 'invalid' }) is OK because we don't know at compile time whether 'invalid' is 
a string that Mongoose can cast to a number. new User({ name: 'test', age: '42' }) is perfectly valid as far 
as Mongoose is concerned.
Also, your createUser() syntax looks a little weird. Shouldn't await User.create(<IUser>{});  be 
await User.create<IUser>({}) ? That should be how you enforce that whatever you pass into create() strictly 
matches IUser.



*/