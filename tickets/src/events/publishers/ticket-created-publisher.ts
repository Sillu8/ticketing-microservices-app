import { Publisher, TicketCreatedEvent, subjects } from '@srticketsapp/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {

  readonly subject = subjects.TicketCreated;
  
}