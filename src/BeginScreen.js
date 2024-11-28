import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const BeginScreen = ({ onBegin }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the Study</Text>
      <TouchableOpacity style={styles.beginButton} onPress={onBegin}>
        <Text style={styles.beginButtonText}>Begin</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BeginScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, textAlign: "center", marginBottom: 20 },
  beginButton: {
    padding: 15,
    backgroundColor: "#28a745",
    borderRadius: 5,
    alignItems: "center",
  },
  beginButtonText: { fontSize: 18, color: "#fff", fontWeight: "bold" },
});
