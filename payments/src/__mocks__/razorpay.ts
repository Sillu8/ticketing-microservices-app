export const razorpay = {
  orders: {
    // Automatically resolves itself with an empty object. We are awaiting the promise in the route handler.
    create: jest.fn().mockResolvedValue({})
  }
}