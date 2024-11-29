import React, { useState } from "react";
import QRScreen from "./QRScreen";
import BeginScreen from "./BeginScreen";
import Peer from "react-native-peerjs";

const StartScreen = () => {
  const [peer, setPeer] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connection, setConnection] = useState(null);

  const handleQRCodeScan = (scannedData) => {
    try {
      const desktopPeerId = scannedData; // Scanned QR code contains the desktop's PeerJS ID

      // Initialize PeerJS client using the default PeerJS server
      const peerInstance = new Peer();

      // Connect to the desktop peer
      const conn = peerInstance.connect(desktopPeerId);

      conn.on("open", () => {
        console.log("Connected to desktop peer:", desktopPeerId);
        setConnection(conn);
        setIsConnected(true);
      });

      conn.on("data", (data) => {
        console.log("Received data from desktop:", data);
      });

      conn.on("error", (err) => {
        console.error("Connection error:", err);
      });

      conn.on("close", () => {
        console.log("Connection closed with desktop peer.");
        setIsConnected(false);
        setConnection(null);
      });

      setPeer(peerInstance);
    } catch (error) {
      console.error("Error handling QR Code scan:", error.message);
    }
  };

  const sendMessage = (message) => {
    if (connection && connection.open) {
      connection.send(message);
      console.log("Message sent to desktop:", message);
    } else {
      console.log("No active connection to send message.");
    }
  };

  if (!isConnected) {
    return <QRScreen onScanSuccess={handleQRCodeScan} />;
  }

  return <BeginScreen sendMessage={sendMessage} />;
};

export default StartScreen;
