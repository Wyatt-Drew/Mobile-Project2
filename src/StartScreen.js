import React, { useState, useEffect } from "react";
import QRScreen from "./QRScreen";
import WaitingScreen from "./WaitingScreen";
import BeginScreen from "./BeginScreen";
import communicationService from "./communicationService";

const StartScreen = () => {
  const [peerId, setPeerId] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [connection, setConnection] = useState(null);

  const handleQRCodeScan = async (scannedPeerId) => {
    console.log("Scanned Peer ID:", scannedPeerId);

    try {
      const conn = await communicationService.connectToPeer(scannedPeerId);
      setConnection(conn); // Save the connection object
      setIsConnected(true); // Update state to indicate active connection

      communicationService.onDataReceived((data) => {
        console.log("Received from peer:", data);
        // Handle incoming data here
      });
    } catch (error) {
      console.error("Error connecting to peer:", error.message);
    }
  };

  const sendMessage = (message) => {
    communicationService.sendMessage(message);
  };

  useEffect(() => {
    // Initialize the PeerJS instance when the component mounts
    communicationService.initialize().then(setPeerId);

    return () => {
      // Cleanup the PeerJS instance when the component unmounts
      communicationService.destroy();
    };
  }, []);

  if (!isConnected) {
    return <QRScreen onScanSuccess={handleQRCodeScan} />;
  }

  return <BeginScreen sendMessage={sendMessage} />;
};

export default StartScreen;
