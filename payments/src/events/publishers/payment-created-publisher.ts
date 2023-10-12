import { PaymentCreatedEvent, Publisher, subjects } from '@srticketsapp/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = subjects.PaymentCreated;
}