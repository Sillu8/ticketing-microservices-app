import { Publisher, TicketUpdatedEvent, subjects } from '@srticketsapp/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {

  readonly subject = subjects.TicketUpdated;
  
}