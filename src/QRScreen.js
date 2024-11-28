import React from "react";
import { View, Text, StyleSheet } from "react-native";
import QRScanner from "./QRScanner";

const QRScreen = ({ onWebSocketSetup }) => {
  const handleQRCodeScan = (scannedData) => {
    const url = new URL(scannedData);
    const sessionId = url.searchParams.get("session");

    if (sessionId) {
      const ws = new WebSocket(`wss://mobile-backend-74th.onrender.com/?session=${sessionId}`);
      onWebSocketSetup(ws);
    } else {
      console.error("Invalid QR Code: No session ID found.");
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
