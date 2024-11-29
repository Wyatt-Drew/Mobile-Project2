import Peer from "react-native-peerjs";

class CommunicationService {
  constructor() {
    this.peer = null; // PeerJS instance
    this.connection = null; // Current connection
    this.onDataReceivedCallback = null;
  }

  async initialize() {
    return new Promise((resolve, reject) => {
      try {
        this.peer = new Peer(); // Use the default PeerJS server

        this.peer.on("open", (id) => {
          console.log("Mobile PeerJS ID:", id);
          resolve(id); // Resolve with the Peer ID
        });

        this.peer.on("error", (err) => {
          console.error("PeerJS Error:", err);
          reject(err);
        });
      } catch (error) {
        console.error("Error initializing PeerJS:", error.message);
        reject(error);
      }
    });
  }

  connectToPeer(peerId) {
    return new Promise((resolve, reject) => {
      if (!this.peer) {
        reject(new Error("Peer instance is not initialized."));
        return;
      }

      const conn = this.peer.connect(peerId); // Connect to the desktop peer

      conn.on("open", () => {
        console.log("Connection successfully established with desktop peer:", peerId);
        this.connection = conn;
        resolve(conn);
      });

      conn.on("data", (data) => {
        console.log("Received data:", data);
        if (this.onDataReceivedCallback) {
          this.onDataReceivedCallback(data);
        }
      });

      conn.on("error", (err) => {
        console.error("Connection error:", err);
        reject(err);
      });

      conn.on("close", () => {
        console.log("Connection closed.");
        this.connection = null;
      });
    });
  }

  sendMessage(message) {
    if (this.connection && this.connection.open) {
      this.connection.send(message);
      console.log("Sent message:", message);
    } else {
      console.error("Cannot send message. No active connection.");
    }
  }

  onDataReceived(callback) {
    this.onDataReceivedCallback = callback; // Set a callback to handle received data
  }

  destroy() {
    if (this.connection) {
      this.connection.close();
      this.connection = null;
    }
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
  }
}

const communicationService = new CommunicationService();
export default communicationService;
