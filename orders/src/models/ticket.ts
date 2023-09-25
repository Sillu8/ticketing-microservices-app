import mongoose from 'mongoose';
import { Order, OrderStatus } from './order';

interface TicketAttrs {
  id: string; // The id come as 'id' from order service cause of using toJSON, but we have to save it as _id in db or mongodb will create new id. so alter build method.
  title: string;
  price: number;
}

export interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  isReserved(): Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
}



const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    }
  }
});

ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket({
    _id: attrs.id, 
    title: attrs.title,
    price: attrs.price,
  });
};

// Check all orders. Find if an order has the given ticket and status is not cancelled.
// If found, order is reserved.
ticketSchema.methods.isReserved = async function () {
  // this === ticket doc that we just called isReserved() on. if we use arrow function, we lose the value.
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete
      ]
    }
  })

  return !!existingOrder;
}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };