import { ExpirationCompleteEvent, Publisher, subjects } from '@srticketsapp/common';


export class ExpirationCompletedPublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = subjects.ExpirationComplete;
}