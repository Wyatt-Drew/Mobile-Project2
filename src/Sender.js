import React, { useState, useEffect } from "react";
import { View, Text, Button, TextInput, StyleSheet , TouchableOpacity } from "react-native";
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
  BLACKSCREEN:6,
};

const targetHeights = [
    { label: 'target1', value: '2129.71' },
    { label: 'target2', value: '3169.07' },
    { label: 'target3', value: '7757.81' },
    { label: 'target4', value: '14285.68' },
    { label: 'target5', value: '18175.61' },
    { label: 'target6', value: '5276' },
    { label: 'target7', value: '10502.5' },
    { label: 'target8', value: '19584.9' },
    { label: 'target9', value: '24099.74' },
    { label: 'target10', value: '1390.71' },
    { label: 'target11', value: '1864.8' },
    { label: 'target12', value: '8467.43' },
    { label: 'target13', value: '12209.12' },
    { label: 'target14', value: '19096.99' },
    { label: 'target15', value: '22997.72' },
    { label: 'target16', value: '5314.35' },
    { label: 'target17', value: '10798.97' },
    { label: 'target18', value: '13294.29' },
    { label: 'target19', value: '19065.44' },
    { label: 'target20', value: '23368.52' },
    { label: 'target21', value: '15324.61' },
    { label: 'target22', value: '18620.31' },
    { label: 'target23', value: '23332.22' },
    { label: 'target24', value: '4387.78' },
    { label: 'target25', value: '9537.91' },
    { label: 'none', value: 'NULL' },
];


const landmarkTypes = [
    { label: 'No Icons', value: 'None' },
    { label: 'Numbers', value: 'Numbers' },
    { label: 'Letters', value: 'Letters' },
    { label: 'Icons', value: 'Icons' },
    { label: 'ColorIcons', value: 'ColorIcons' },
  ];
  
  const pdfOptions = [
    { label: 'PDF1', value: require('../assets/pdf/PDF1.pdf') },
    { label: 'PDF2', value: require('../assets/pdf/PDF2.pdf') },
    { label: 'PDF3', value: require('../assets/pdf/PDF3.pdf') },
    { label: 'PDF4', value: require('../assets/pdf/PDF4.pdf') },
    { label: 'PDF5', value: require('../assets/pdf/PDF5.pdf') },
  ];

export default function Sender() {
  const [hasPermission, setHasPermission] = useState(null);
  const [sessionId, setSessionId] = useState("");
  const [ws, setWs] = useState(null);
  const [currentScreen, setCurrentScreen] = useState(SCREENS.SCAN_QR);
  const [subjectId, setSubjectId] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // For displaying WebSocket or other errors
  const [messages, setMessages] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState('');
  const [selectedLandmarkType, setSelectedLandmarkType] = useState('');
  const [targetHeight, setTargetHeight] = useState(null);
  const [targetLabel, setTargetLabel] = useState('');
  const [pdfLabel, setPdfLabel] = useState("");



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
          setPdfLabel(message.message)
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
    } else if (message.type === "TARGET") {
        console.log("Updating target with label:", message.message);
        const targetOption = targetHeights.find((option) => option.label === message.message);
        if (targetOption) {
          setTargetHeight(targetOption.value); // Set the height corresponding to the target
          setTargetLabel(message.message)
          console.log("Target height set to:", targetOption.value);
        } else {
          console.warn(`No height found for target: ${message.message}`);
        }
    } else if (message.type === "BLACKSCREEN") {
        setCurrentScreen(SCREENS.BLACKSCREEN)
        console.log("Blackscreen recieved");

    } else if (message.type === "START") {
        setCurrentScreen(SCREENS.PDF)
        console.log("Start recieved");

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
            <>
            <Text style={styles.title}>Scan QR code to pair</Text>
            <BarCodeScanner
                onBarCodeScanned={handleBarCodeScanned}
                style={StyleSheet.absoluteFillObject}
            />
            </>
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
        
        <TouchableOpacity
          style={styles.bigButton}
          onPress={() => {
            sendMessage("Begin", "");
            setCurrentScreen(SCREENS.PDF);
          }}
        >
          <Text style={styles.buttonText}>Begin</Text>
        </TouchableOpacity>
        <Text style={styles.subjectText}>Subject ID: {subjectId}</Text>
      </View>
    );
  }

  if (currentScreen === SCREENS.PDF) {
    return (
        <PdfRead
        sendMessage={sendMessage}
        route={{
            params: {
            pdfUri: selectedPdf,
            landmarkType: selectedLandmarkType,
            targetHeight: targetHeight,
            subjectId: subjectId,
            pdfLabel: pdfLabel,
            targetLabel: targetLabel,
            },
        }}
        setTargetHeight={setTargetHeight}
        />
    );
  }
  if (currentScreen === SCREENS.BLACKSCREEN) {
    return (
        <View style={styles.container}>

      </View>
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
  title: {
    position: "absolute",
    top: 50, // Adjust based on where you want the title
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
  },
  subjectText: {
    fontSize: 16,
    marginBottom: 20,
  },
  bigButton: {
    backgroundColor: "#007bff",
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
    fontSize: 30,
    fontWeight: "bold",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
