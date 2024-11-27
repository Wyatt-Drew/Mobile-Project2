import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";

const QRScanner = ({ onScanSuccess }) => {
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  if (hasPermission === null) {
    return <Text>Requesting camera permission...</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera. Please enable camera permissions.</Text>;
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={({ data }) => {
          console.log("Scanned Data:", data); // Log scanned data
          if (data) {
            onScanSuccess(data); // Pass data to parent
          }
        }}
        style={StyleSheet.absoluteFillObject}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default QRScanner;
