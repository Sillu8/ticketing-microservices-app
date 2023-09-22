import { OrderCancelledEvent, Publisher, subjects } from '@srticketsapp/common';


export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = subjects.OrderCancelled
}