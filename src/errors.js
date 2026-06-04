// Thrown by the domain layer (store.add) on invalid input.
// Identified by the entrypoint (Story 1.4); the domain never prints.
export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}
