export const natsWrapper = {
  client: {
    // This function will be called when test env call natswrapper client to publish. 
    publish: jest
    .fn()
    .mockImplementation(
      (subject: string, data: string, callback: () => void) => {
        callback();
      }
    )
  }
};