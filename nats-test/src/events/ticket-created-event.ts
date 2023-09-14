import { subjects } from './subjects';

export interface TicketCreatedEvent {
  subject: subjects.TicketCreated;
  data: {
    id: string;
    title: string;
    price: number;
  };
}