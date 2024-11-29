import React, { useState } from "react";
import QRScreen from "./QRScreen";
import WaitingScreen from "./WaitingScreen";
import BeginScreen from "./BeginScreen";

const StartScreen = () => {
  const [webSocket, setWebSocket] = useState(null);
  const [isPaired, setIsPaired] = useState(false);

  const handleWebSocketSetup = (ws) => {
    setWebSocket(ws);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "paired") {
        setIsPaired(true);
      }
    };

    ws.onerror = (error) => console.error("WebSocket error:", error);
    ws.onclose = () => console.log("WebSocket connection closed.");
  };

  const handleBegin = () => {
    if (webSocket) {
      webSocket.send(JSON.stringify({ type: "begin" }));
      console.log("Sent 'begin' signal to the backend.");
    }
  };

  if (!isPaired) {
    return <QRScreen onWebSocketSetup={handleWebSocketSetup} />;
  }

  return <BeginScreen onBegin={handleBegin} />;
};

export default StartScreen;
