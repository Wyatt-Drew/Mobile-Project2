import React, { useState } from "react";
import QRScreen from "./QRScreen";
import WaitingScreen from "./WaitingScreen";
import BeginScreen from "./BeginScreen";

const StartScreen = () => {
  const [webSocket, setWebSocket] = useState(null);
  const [isPaired, setIsPaired] = useState(false);
  const [subjectIDEntered, setSubjectIDEntered] = useState(false);

  const handleWebSocketSetup = (ws) => {
    setWebSocket(ws);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case "paired":
          setIsPaired(true);
          break;
        case "subject-id-entered":
          setSubjectIDEntered(true);
          break;
        default:
          console.warn("Unhandled message type:", message.type);
      }
    };

    ws.onerror = (err) => console.error("WebSocket error:", err);
    ws.onclose = (e) => console.log(`WebSocket closed: code=${e.code}, reason=${e.reason}`);
  };

  const handleBegin = () => {
    if (webSocket) {
      webSocket.send(JSON.stringify({ type: "begin" }));
      console.log("Sent 'begin' signal to desktop");
    }
  };

  if (!isPaired) {
    return <QRScreen onWebSocketSetup={handleWebSocketSetup} />;
  }

  if (!subjectIDEntered) {
    return <WaitingScreen />;
  }

  return <BeginScreen onBegin={handleBegin} />;
};

export default StartScreen;
