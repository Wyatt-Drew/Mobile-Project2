import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import Peer from 'react-native-peerjs';

export default function Sender() {
  const [peer, setPeer] = useState(null);
  const [conn, setConn] = useState(null);
  const [receiverId, setReceiverId] = useState('');
  const [status, setStatus] = useState('Disconnected');
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const newPeer = new Peer(null, { debug: 2 });
    setPeer(newPeer);
    return () => newPeer.destroy();
  }, []);

  const connect = () => {
    const connection = peer.connect(receiverId);
    connection.on('open', () => {
      setConn(connection);
      setStatus(`Connected to ${receiverId}`);
    });

    connection.on('data', (data) => {
      // Directly use the received string
      setMessages((prev) => [...prev, `Peer: ${data}`]);
    });
  };

  const sendMessage = () => {
    if (conn && conn.open) {
      conn.send(inputMessage); // Send the raw string
      setMessages((prev) => [...prev, `Self: ${inputMessage}`]);
      setInputMessage('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Sender</Text>
      <TextInput
        style={styles.input}
        placeholder="Receiver ID"
        value={receiverId}
        onChangeText={setReceiverId}
      />
      <Button title="Connect" onPress={connect} />
      <Text>Status: {status}</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginVertical: 10, borderRadius: 5 },
});
