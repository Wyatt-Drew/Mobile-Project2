import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import QRScanner from "./QRScanner";

const StartScreen = () => {
  const [peerConnection, setPeerConnection] = useState(null);
  const [currentInstruction, setCurrentInstruction] = useState("");
  const [pairingStatus, setPairingStatus] = useState("waiting");
  const [isPaired, setIsPaired] = useState(false);
  const [subjectIDEntered, setSubjectIDEntered] = useState(false); // New state for subject ID
  const [webSocket, setWebSocket] = useState(null);

  const handleQRCodeScan = (scannedData) => {
    try {
      const url = new URL(scannedData); // Parse scanned URL
      const sessionId = url.searchParams.get("session");
      console.log("Scanned Session ID:", sessionId);

      if (sessionId) {
        const wsUrl = `wss://mobile-backend-74th.onrender.com/?session=${sessionId}`;
        console.log("Connecting WebSocket with URL:", wsUrl);
        const ws = new WebSocket(wsUrl);
        setWebSocket(ws);

        ws.onopen = () => {
          console.log("WebSocket connected for session:", sessionId);
          ws.send(JSON.stringify({ type: "join", sessionId })); // Notify backend of join request
          setPairingStatus("waiting");
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log("Message received from WebSocket:", message);

            if (message.type === "paired") {
              console.log("Pairing complete!");
              setPairingStatus("paired");
              setIsPaired(true);
            } else if (message.type === "subject-id-entered") {
              console.log("Subject ID received, enabling Begin button.");
              setSubjectIDEntered(true); // Enable Begin button
            } else if (message.type === "offer") {
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
          } catch (err) {
            console.error("Error processing WebSocket message:", err);
          }
        };

        ws.onerror = (err) => Alert.alert("WebSocket Error", "Unable to connect to the server.");
        ws.onclose = (e) => {
          console.log(`WebSocket closed: code=${e.code}, reason=${e.reason}`);
          setPairingStatus("waiting");
          setIsPaired(false);
        };
      } else {
        Alert.alert("Invalid QR Code", "No valid session ID found.");
      }
    } catch (error) {
      Alert.alert("Error", "Invalid QR code scanned.");
    }
  };

  const handleBegin = () => {
    if (webSocket) {
      webSocket.send(JSON.stringify({ type: "begin" })); // Notify the desktop to start countdown
      console.log("Sent 'begin' signal to desktop");
    } else {
      Alert.alert("Error", "WebSocket connection not established.");
    }
  };

  return (
    <View style={styles.container}>
      {!isPaired ? (
        <>
          <Text style={styles.title}>
            {pairingStatus === "waiting" ? "Scan QR Code to Connect" : "Pairing Complete!"}
          </Text>
          <QRScanner onScanSuccess={handleQRCodeScan} />
        </>
      ) : (
        <>
          {!subjectIDEntered ? (
            <Text style={styles.title}>Paired successfully, awaiting subject ID...</Text>
          ) : (
            <>
              <Text style={styles.title}>Welcome to the Study</Text>
              <TouchableOpacity style={styles.beginButton} onPress={handleBegin}>
                <Text style={styles.beginButtonText}>Begin</Text>
              </TouchableOpacity>
            </>
          )}
        </>
      )}
    </View>
  );
};

export default StartScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, textAlign: "center", marginBottom: 20 },
  beginButton: {
    padding: 15,
    backgroundColor: "#28a745",
    borderRadius: 5,
    alignItems: "center",
  },
  beginButtonText: { fontSize: 18, color: "#fff", fontWeight: "bold" },
});
