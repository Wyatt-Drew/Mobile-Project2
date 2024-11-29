import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const BeginScreen = ({ onBegin }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Connected! Ready to Begin.</Text>
    <TouchableOpacity style={styles.beginButton} onPress={onBegin}>
      <Text style={styles.beginButtonText}>Start</Text>
    </TouchableOpacity>
  </View>
);

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
