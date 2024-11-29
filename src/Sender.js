import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, FlatList, StyleSheet } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";

const BACKEND_WS_URL = "wss://mobile-backend-74th.onrender.com";

export default function Sender() {
  const [hasPermission, setHasPermission] = useState(null);
  const [sessionId, setSessionId] = useState("");
  const [status, setStatus] = useState("Waiting to scan QR code...");
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [ws, setWs] = useState(null);
  const [isScanned, setIsScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = ({ data }) => {
    if (isScanned) return;

    setIsScanned(true);
    setSessionId(data);
    setStatus(`Scanned session ID: ${data}`);
    connectToSession(data);
  };

  const connectToSession = (scannedSessionId) => {
    const socket = new WebSocket(BACKEND_WS_URL);

    socket.onopen = () => {
      setWs(socket);
      setStatus(`Connected to session: ${scannedSessionId}`);
      socket.send(
        JSON.stringify({
          type: "register",
          sessionId: scannedSessionId,
        })
      );
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, `${data.sender}: ${data.message}`]);
    };

    socket.onclose = () => {
      setWs(null);
      setStatus("Connection closed.");
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setStatus("Failed to connect to session.");
    };
  };

  const sendMessage = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "message",
          sessionId,
          sender: "Mobile Sender",
          message: inputMessage,
        })
      );
      setMessages((prev) => [...prev, `Self: ${inputMessage}`]);
      setInputMessage("");
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting camera permission...</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera. Enable permissions in settings.</Text>;
  }

  return (
    <View style={styles.container}>
      {sessionId ? (
        <>
          <Text>{status}</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter a message..."
            value={inputMessage}
            onChangeText={setInputMessage}
          />
          <Button title="Send" onPress={sendMessage} />
          <FlatList
            data={messages}
            renderItem={({ item }) => <Text>{item}</Text>}
            keyExtractor={(item, index) => index.toString()}
          />
        </>
      ) : (
        <BarCodeScanner
          onBarCodeScanned={handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginVertical: 10, borderRadius: 5 },
});
