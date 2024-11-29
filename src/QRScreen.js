import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import QRScanner from "./QRScanner";

const QRScreen = ({ onWebSocketSetup }) => {
  const [webSocket, setWebSocket] = useState(null); // Track WebSocket creation state

  const handleQRCodeScan = (scannedData) => {
    if (webSocket) {
      console.log("WebSocket already established. Ignoring repeated QR scan.");
      return; // Prevent duplicate WebSocket creation
    }

    try {
      const url = new URL(scannedData);
      const sessionId = url.searchParams.get("session");

      if (sessionId) {
        console.log("Session ID from QR code:", sessionId);

        const ws = new WebSocket(`wss://mobile-backend-74th.onrender.com/?session=${sessionId}`);
        setWebSocket(ws); // Store the WebSocket to prevent multiple connections
        onWebSocketSetup(ws); // Pass the WebSocket to parent component
      } else {
        console.error("Invalid QR Code: No session ID found.");
      }
    } catch (error) {
      console.error("Error parsing QR code:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan QR Code to Connect</Text>
      <QRScanner onScanSuccess={handleQRCodeScan} />
    </View>
  );
};

export default QRScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, textAlign: "center", marginBottom: 20 },
});
