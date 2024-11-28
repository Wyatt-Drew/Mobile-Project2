import React from "react";
import { View, Text, StyleSheet } from "react-native";

const WaitingScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Paired successfully, awaiting subject ID...</Text>
    </View>
  );
};

export default WaitingScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, textAlign: "center" },
});
