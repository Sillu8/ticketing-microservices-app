import { OrderCreatedEvent, Publisher, subjects } from '@srticketsapp/common';


export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = subjects.OrderCreated;
}