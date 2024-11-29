import React, { useState } from "react";
import { View, Text, TextInput, Button, FlatList, StyleSheet } from "react-native";

const BACKEND_WS_URL = "wss://mobile-backend-74th.onrender.com";

export default function Sender() {
  const [sessionId, setSessionId] = useState("");
  const [inputSessionId, setInputSessionId] = useState("");
  const [status, setStatus] = useState("Enter a session code to connect.");
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [ws, setWs] = useState(null);

  const connectToSession = () => {
    if (!inputSessionId) {
      setStatus("Please enter a valid session code.");
      return;
    }

    const socket = new WebSocket(BACKEND_WS_URL);

    socket.onopen = () => {
      setWs(socket);
      setSessionId(inputSessionId); // Use the session code entered by the user
      setStatus(`Connected to session: ${inputSessionId}`);
      socket.send(
        JSON.stringify({
          type: "register",
          sessionId: inputSessionId,
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
          sender: "Sender",
          message: inputMessage,
        })
      );
      setMessages((prev) => [...prev, `Self: ${inputMessage}`]);
      setInputMessage("");
    } else {
      console.error("WebSocket is not connected.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Sender</Text>
      {sessionId ? (
        <>
          <Text>Status: {status}</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter a message..."
            value={inputMessage}
            onChangeText={setInputMessage}
          />
          <Button title="Send" onPress={sendMessage} />
        </>
      ) : (
        <>
          <Text>{status}</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Session Code"
            value={inputSessionId}
            onChangeText={setInputSessionId}
          />
          <Button title="Connect" onPress={connectToSession} />
        </>
      )}
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
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginVertical: 10, borderRadius: 5 },
});
