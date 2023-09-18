import nats, { Stan } from 'node-nats-streaming'

class NatsWrapper {
  // question mark ? indicates that the property might be undefined for some time.
  // We are not going to give any value to _client through the constructor because it's too early rn.
  // We'll be doing that in index.ts
  private _client?: Stan;


  get client() {
    if(!this._client){
      throw new Error('Cannot access NATS client before connecting.')
    }

    return this._client;
  }

  connect(clusterId: string, clientId: string, url: string) {
    this._client = nats.connect(clusterId, clientId, { url });


    // This is bad design because, in common module we shouldn't exit like this.
    // this._client.on('close', () => {
    //   console.log('NATS connection closed');
    //   process.exit();
    // })
    
    // process.on('SIGINT', () => this.client.close());
    // process.on('SIGTERM', () => this.client.close());

    
    // tS fears that we'll change the value of _client in the promise so it shows a error. Use ! to remove.
    // since we use the getter get client() we can use client
    return new Promise<void>((resolve, reject) => {
      this.client.on('connect', () => {
        console.log('Connected to NATS')
        resolve();
      })

      this._client!.on('error', (err) => {
        reject(err)
      })
    })
  }
}

// Single implementation
export const natsWrapper = new NatsWrapper();