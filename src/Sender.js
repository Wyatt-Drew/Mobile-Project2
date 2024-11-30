import React, { useState, useEffect } from "react";
import { View, Text, Button, TextInput, StyleSheet } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";

const BACKEND_WS_URL = "wss://mobile-backend-74th.onrender.com";

const SCREENS = {
  SCAN_QR: 1,
  WAITING: 2,
  BEGIN: 3,
};

export default function Sender() {
  const [hasPermission, setHasPermission] = useState(null);
  const [sessionId, setSessionId] = useState("");
  const [ws, setWs] = useState(null);
  const [currentScreen, setCurrentScreen] = useState(SCREENS.SCAN_QR);
  const [subjectId, setSubjectId] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // For displaying WebSocket or other errors
  const [customMessage, setCustomMessage] = useState(""); // For sending custom messages
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState([]);

//setInputMessage
//setInputMessageType
//sendMessage

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = ({ data }) => {
    if (sessionId) {
      console.warn("QR Code already scanned."); // Prevent double scanning
      return;
    }
    console.log("QR Code Scanned:", data);
    setSessionId(data);
    setCurrentScreen(SCREENS.WAITING);
    connectToSession(data);
  };

  const connectToSession = (scannedSessionId) => {
    console.log("Connecting to session:", scannedSessionId);

    // Avoid duplicate WebSocket connections
    if (ws) {
      console.warn("WebSocket already exists.");
      return;
    }

    const socket = new WebSocket(BACKEND_WS_URL);

    socket.onopen = () => {
      console.log("WebSocket connection opened.");
      setWs(socket);

      // Register with the backend
      const registerMessage = {
        type: "register",
        sessionId: scannedSessionId,
      };
      console.log("Sending register message:", registerMessage);
      socket.send(JSON.stringify(registerMessage));

      // Notify the desktop app of the connection
      const mobileConnectedMessage = {
        type: "mobileConnected",
        sessionId: scannedSessionId,
      };
      console.log("Sending mobileConnected message:", mobileConnectedMessage);
      socket.send(JSON.stringify(mobileConnectedMessage));
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("Message received:", message);

      if (message.type === "subjectId") {
        console.log("Subject ID received:", message.message);
        setSubjectId(message.message); // Save Subject ID
        setCurrentScreen(SCREENS.BEGIN); // Transition to BEGIN screen
      } else {
        console.log("Unhandled message type:", message.type);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed.");
      setErrorMessage("WebSocket connection closed.");
      setWs(null); // Reset WebSocket reference
      setCurrentScreen(SCREENS.SCAN_QR); // Reset to scanning
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
      setErrorMessage("WebSocket error. Please retry.");
      setWs(null); // Reset WebSocket reference
    };
  };
  const sendMessage = (type, message) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const payload = {
        type,
        sessionId,
        sender: "Sender",
        message,
      };
      ws.send(JSON.stringify(payload));
      console.log("Sent message:", payload);
      setMessages((prev) => [...prev, `Self: ${type} - ${message}`]);
    } else {
      console.error("WebSocket is not connected or open.");
    }
  };
  

  // Render screens based on current state
  if (currentScreen === SCREENS.SCAN_QR) {
    return (
      <View style={styles.container}>
        {hasPermission === null && <Text>Requesting camera permission...</Text>}
        {hasPermission === false && <Text>No access to camera.</Text>}
        {hasPermission === true && (
          <BarCodeScanner
            onBarCodeScanned={handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        )}
      </View>
    );
  }

  if (currentScreen === SCREENS.WAITING) {
    return (
        
      <View style={styles.container}>
          <TextInput
            style={styles.input}
            placeholder="Enter a message..."
            value={inputMessage}
            onChangeText={setInputMessage}
          />
          <Button title="Send" onPress={() => sendMessage("custom", inputMessage)} />
          
        <Text>Awaiting Subject ID...</Text>
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      </View>
    );
  }

  if (currentScreen === SCREENS.BEGIN) {
    return (
      <View style={styles.container}>
        <Text>Subject ID: {subjectId}</Text>
        <Button title="Begin" onPress={() => console.log("Begin Study")} />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  error: { color: "red", marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    width: "80%",
  },
});
