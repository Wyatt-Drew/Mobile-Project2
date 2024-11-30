import React, { useState, useEffect } from "react";
import { View, Text, Button, TextInput, StyleSheet } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import WaitingScreen from "./pages/WaitingScreen";
import PdfRead from "./PdfRead";


const BACKEND_WS_URL = "wss://mobile-backend-74th.onrender.com";
  
const SCREENS = {
  SCAN_QR: 1,
  WAITING: 2,
  BEGIN: 3,
  PDF: 4,
  BLANK: 5,
};


const landmarkTypes = [
    { label: 'No Icons', value: 'None' },
    { label: 'Numbers', value: 'Numbers' },
    { label: 'Letters', value: 'Letters' },
    { label: 'Icons', value: 'Icons' },
    { label: 'ColorIcons', value: 'ColorIcons' },
  ];
  
  const pdfOptions = [
    { label: 'PDF1', value: require('../assets/pdf/PDF1.pdf') },
  ];

export default function Sender() {
  const [hasPermission, setHasPermission] = useState(null);
  const [sessionId, setSessionId] = useState("");
  const [ws, setWs] = useState(null);
  const [currentScreen, setCurrentScreen] = useState(SCREENS.SCAN_QR);
  const [subjectId, setSubjectId] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // For displaying WebSocket or other errors
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState('');
  const [selectedLandmarkType, setSelectedLandmarkType] = useState('');
  


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
    } else if (message.type === "PDF") {
        console.log("Updating PDF with label:", message.message);
        const pdfOption = pdfOptions.find((option) => option.label === message.message);
        if (pdfOption) {
          setSelectedPdf(pdfOption.value); // Set the value corresponding to the label
        } else {
          console.warn(`No PDF found for label: ${message.message}`);
        }
      } else if (message.type === "LANDMARK") {
        console.log("Updating landmark with label:", message.message);
        const landmarkOption = landmarkTypes.find((option) => option.label === message.message);
        if (landmarkOption) {
          setSelectedLandmarkType(landmarkOption.value); // Set the value corresponding to the label
        } else {
          console.warn(`No landmark found for label: ${message.message}`);
        }
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
        <WaitingScreen></WaitingScreen>
    );
  }

  if (currentScreen === SCREENS.BEGIN) {
    return (
      <View style={styles.container}>
        <Text>Subject ID: {subjectId}</Text>
        <Button title="Begin" onPress={() => {sendMessage("Begin", ""), setCurrentScreen(SCREENS.PDF) 
    }
        } />
      </View>
    );
  }

  if (currentScreen === SCREENS.PDF) {
    return (
      <PdfRead
        route={{
          params: {
            pdfUri: selectedPdf, // The selected PDF URI or path
            landmarkType: selectedLandmarkType, // Selected landmark type
          },
        }}
      />
    );
  }


  if (currentScreen === SCREENS.BLANK) {
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
