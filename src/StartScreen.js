import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import QRScanner from './QRScanner';

const StartScreen = ({ navigation }) => {
  const [peerConnection, setPeerConnection] = useState(null);
  const [currentInstruction, setCurrentInstruction] = useState(''); // Display real-time instructions

  const handleQRCodeScan = (scannedData) => {
    try {
      console.log("Scanned Data:", scannedData);
  
      // Attempt to parse as JSON (if it's structured data like an offer)
      let parsedData;
      try {
        parsedData = JSON.parse(scannedData);
      } catch (e) {
        console.warn("Scanned data is not JSON. Treating as plain text.");
        parsedData = scannedData; // Fallback to raw data
      }
  
      // Handle WebRTC offer if the QR code contains an offer
      if (parsedData.type === "offer" && parsedData.sdp) {
        console.log("Received WebRTC Offer:", parsedData);
  
        // Initialize WebRTC PeerConnection
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
  
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            console.log("ICE Candidate from mobile:", event.candidate);
          }
        };
  
        pc.ondatachannel = (event) => {
          const dataChannel = event.channel;
          dataChannel.onopen = () => console.log("Data channel open");
          dataChannel.onmessage = (e) => {
            setCurrentInstruction(e.data); // Update real-time instructions
            console.log("Instruction received:", e.data);
          };
        };
  
        // Set the received offer and create an answer
        pc.setRemoteDescription(new RTCSessionDescription(parsedData))
          .then(() => pc.createAnswer())
          .then((answer) => pc.setLocalDescription(answer))
          .then(() => {
            console.log("Sending WebRTC Answer:", pc.localDescription);
            const dataChannel = pc.createDataChannel("signalChannel");
            dataChannel.onopen = () => {
              dataChannel.send(JSON.stringify(pc.localDescription)); // Send answer back to PC
            };
          })
          .catch((err) => {
            console.error("Error during WebRTC handshake:", err);
            Alert.alert("Error", "Failed to establish WebRTC connection.");
          });
  
        setPeerConnection(pc); // Save the PeerConnection
      } else {
        // Handle simple text values (like "potato")
        Alert.alert("Scanned Value", `Received: ${parsedData}`);
      }
    } catch (error) {
      console.error("Error processing scanned data:", error);
      Alert.alert("Error", "Invalid QR code scanned. Please try again.");
    }
  };
  

  return (
    <View style={styles.container}>
      {!peerConnection ? (
        <>
          <Text style={styles.title}>Scan QR Code to Connect</Text>
          <QRScanner onScanSuccess={handleQRCodeScan} />
        </>
      ) : (
        <>
          <Text style={styles.title}>Real-Time Instructions</Text>
          <Text style={styles.instructionText}>
            {currentInstruction || 'Waiting for instructions...'}
          </Text>
          <TouchableOpacity
            style={styles.disconnectButton}
            onPress={() => {
              peerConnection.close();
              setPeerConnection(null);
              setCurrentInstruction('');
            }}
          >
            <Text style={styles.disconnectButtonText}>Disconnect</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default StartScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 18,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 15,
  },
  disconnectButton: {
    padding: 15,
    backgroundColor: '#dc3545',
    borderRadius: 5,
    alignItems: 'center',
  },
  disconnectButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});
