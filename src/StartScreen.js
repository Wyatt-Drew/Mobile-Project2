import React, { useState, useEffect } from "react";
import QRScreen from "./QRScreen";
import WaitingScreen from "./WaitingScreen";
import Peer from "react-native-peerjs";

const StartScreen = () => {
  const [peer, setPeer] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connection, setConnection] = useState(null);

  const handleQRCodeScan = (scannedData) => {
    try {
      const desktopPeerId = scannedData; // Scanned QR code contains the desktop's PeerJS ID

      console.log("Attempting to connect to desktop peer with ID:", desktopPeerId);

      // Initialize PeerJS client using the default PeerJS server
      const peerInstance = new Peer(); // Use default PeerJS server

      // Attach event listeners to the Peer instance
      peerInstance.on("open", (id) => {
        console.log("Mobile PeerJS ID:", id);
      });

      peerInstance.on("error", (err) => {
        console.error("PeerJS Error:", err);
      });

      // Connect to the desktop peer using the scanned ID
      const conn = peerInstance.connect(desktopPeerId);

      conn.on("open", () => {
        console.log("Connection successfully established with desktop peer:", desktopPeerId);
        setConnection(conn); // Save the connection object
        setIsConnected(true); // Update the state to indicate the connection is active
      });

      conn.on("data", (data) => {
        console.log("Received data from desktop:", data);
      });

      conn.on("error", (err) => {
        console.error("Connection error:", err);
      });

      conn.on("close", () => {
        console.log("Connection closed with desktop peer.");
        setIsConnected(false); // Reset the connection state
        setConnection(null); // Clear the connection object
      });

      setPeer(peerInstance); // Save the PeerJS instance
    } catch (error) {
      console.error("Error handling QR Code scan:", error.message);
    }
  };

  if (!isConnected) {
    return <QRScreen onScanSuccess={handleQRCodeScan} />; // Show QR scanner if not connected
  }

  return <WaitingScreen />; // Show "Waiting for subject ID" screen if connected
};

export default StartScreen;
