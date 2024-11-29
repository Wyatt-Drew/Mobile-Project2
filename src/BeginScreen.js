import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const BeginScreen = ({ sendMessage }) => {
  const handleSend = () => {
    sendMessage("Hello, desktop peer!");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connected! Ready to Begin.</Text>
      <TouchableOpacity style={styles.beginButton} onPress={handleSend}>
        <Text style={styles.beginButtonText}>Send Test Message</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 24, marginBottom: 20 },
  beginButton: {
    padding: 15,
    backgroundColor: "#28a745",
    borderRadius: 5,
    alignItems: "center",
  },
  beginButtonText: { fontSize: 18, color: "#fff", fontWeight: "bold" },
});

export default BeginScreen;
