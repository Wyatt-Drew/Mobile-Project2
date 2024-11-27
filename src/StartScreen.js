import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import QRScanner from "./QRScanner";

const StartScreen = () => {
  const [peerConnection, setPeerConnection] = useState(null);
  const [currentInstruction, setCurrentInstruction] = useState("");

  const handleQRCodeScan = (scannedData) => {
    try {
      const url = new URL(scannedData); // Parse scanned URL
      const sessionId = url.searchParams.get("session");
      console.log("sessionId");
      console.log(sessionId);

      if (sessionId) {
        const wsUrl = `wss://mobile-backend-74th.onrender.com/?session=${sessionId}`;
        console.log("Connecting WebSocket with URL:", wsUrl);
        const ws = new WebSocket(wsUrl);
  
        ws.onopen = () => {
          console.log("WebSocket connected for session:", sessionId);
          ws.send(JSON.stringify({ type: "join", sessionId })); // Notify backend of join request
        };
  
        ws.onmessage = (event) => {
          const message = JSON.parse(event.data);
          if (message.type === "offer") {
            const pc = new RTCPeerConnection({
              iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
            });
  
            pc.onicecandidate = (e) => {
              if (e.candidate) {
                ws.send(JSON.stringify({ type: "candidate", candidate: e.candidate }));
              }
            };
  
            pc.ondatachannel = (e) => {
              const dataChannel = e.channel;
              dataChannel.onopen = () => console.log("Data channel open");
              dataChannel.onmessage = (e) => setCurrentInstruction(e.data);
            };
  
            pc.setRemoteDescription(new RTCSessionDescription(message.offer))
              .then(() => pc.createAnswer())
              .then((answer) => {
                pc.setLocalDescription(answer);
                ws.send(JSON.stringify({ type: "answer", answer }));
              })
              .catch((err) => Alert.alert("Error", "WebRTC setup failed"));
  
            setPeerConnection(pc);
          }
        };
  
        ws.onerror = (err) => Alert.alert("WebSocket Error", "Unable to connect to the server.");
        ws.onclose = (e) => console.log(`WebSocket closed: code=${e.code}, reason=${e.reason}`);
      } else {
        Alert.alert("Invalid QR Code", "No valid session ID found.");
      }
    } catch (error) {
      Alert.alert("Error", "Invalid QR code scanned.");
    }
  };

  return (
    <View style={styles.container}>
      {!peerConnection ? (
        <>
          <Text style={styles.title}>Scan QR Code to Connect</Text>
          <QRScanner onScanSuccess={handleQRCodeScan} />
        </>
      ) : (
        <>
          <Text style={styles.title}>Real-Time Instructions</Text>
          <Text style={styles.instructionText}>{currentInstruction || "Waiting for instructions..."}</Text>
          <TouchableOpacity
            style={styles.disconnectButton}
            onPress={() => {
              peerConnection.close();
              setPeerConnection(null);
              setCurrentInstruction("");
            }}
          >
            <Text style={styles.disconnectButtonText}>Disconnect</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default StartScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, textAlign: "center", marginBottom: 20 },
  instructionText: { fontSize: 18, textAlign: "center", marginVertical: 15 },
  disconnectButton: {
    padding: 15,
    backgroundColor: "#dc3545",
    borderRadius: 5,
    alignItems: "center",
  },
  disconnectButtonText: { fontSize: 18, color: "#fff", fontWeight: "bold" },
});
