import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

const BACKEND_WS_URL = "wss://mobile-backend-74th.onrender.com";

export default function Receiver() {
  const [sessionId, setSessionId] = useState("");
  const [status, setStatus] = useState("Disconnected");
  const [messages, setMessages] = useState([]);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const createSession = async () => {
      try {
        const response = await fetch(`${BACKEND_WS_URL.replace("wss", "https")}/generate-session`);
        const data = await response.json();
        setSessionId(data.sessionId);
        setStatus(`Session ID: ${data.sessionId}`);
      } catch (error) {
        console.error("Error generating session:", error);
      }
    };

    createSession();
  }, []);

  useEffect(() => {
    if (!sessionId) return;

    const socket = new WebSocket(BACKEND_WS_URL);

    socket.onopen = () => {
      setWs(socket);
      socket.send(JSON.stringify({ type: "register", sessionId }));
      setStatus("Connected to WebSocket");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, `${data.sender}: ${data.message}`]);
    };

    socket.onclose = () => {
      setWs(null);
      setStatus("WebSocket connection closed.");
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      socket.close();
    };
  }, [sessionId]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Receiver</Text>
      <Text>{status}</Text>
      <FlatList
        data={messages}
        renderItem={({ item }) => <Text>{item}</Text>}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
});
