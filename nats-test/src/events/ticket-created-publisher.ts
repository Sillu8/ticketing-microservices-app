import { Publisher } from './base-publisher';
import { subjects } from './subjects';
import { TicketCreatedEvent } from './ticket-created-event';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {

  readonly subject = subjects.TicketCreated;
  
}