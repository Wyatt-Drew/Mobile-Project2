// messageHandler.js
export const createMessageHandler = (handlers) => (event) => {
    try {
      const message = JSON.parse(event.data);
      const handler = handlers[message.type];
      if (handler) {
        handler(message.payload); // Pass the payload to the handler
      } else {
        console.warn(`No handler for message type: ${message.type}`);
      }
    } catch (error) {
      console.error("Failed to process WebSocket message:", error);
    }
  };
  