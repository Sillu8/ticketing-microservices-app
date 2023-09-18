import { Stan } from 'node-nats-streaming';
import { subjects } from './subjects';


interface Event {
  subject: subjects;
  data: any;
}

export abstract class Publisher<T extends Event> {
  abstract subject: T['subject'];
  private client: Stan;

  constructor(client: Stan) {
    this.client = client;
  }

  publish(data: T['data']): Promise<void> {
    //Make it promise to await publish.
    return new Promise((resolve, reject) => {

      this.client.publish(this.subject, JSON.stringify(data), (err) => {
        if (err) {
          return reject(err);
        }
        console.log('Event published to subject', this.subject)
        resolve();
        
      })

    })
  }
}