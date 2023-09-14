import { Message } from 'node-nats-streaming';
import { Listener } from './base-listener';
import { TicketCreatedEvent } from './ticket-created-event';
import { subjects } from './subjects';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {

  //Provide type annotation here so that ts knows that you won't change the value to even subjects.OrderCreated
  // subject: subjects.TicketCreated = subjects.TicketCreated; 

  // We can use readonly to enable this feature too.
  
  readonly subject = subjects.TicketCreated; // Works same as final in java.
  queueGroupName = 'payments-service'

  onMessage(data: TicketCreatedEvent['data'], msg: Message): void {
    console.log('Event data!', data);
    
    msg.ack();
  }
}