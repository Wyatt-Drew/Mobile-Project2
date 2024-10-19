import { View, StyleSheet, Dimensions, StatusBar, Platform, Animated, PanResponder, TouchableOpacity } from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import Pdf from '../libraries/react-native-pdf';
import { renderLandmark } from './LandmarkRenderer'; // Ensure this import is correct

const PdfRead = ({ route }) => {
  const { pdfUri, landmarkType } = route.params; // Getting landmarkType
  const pdfRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  const [maxScrollY, setMaxScrollY] = useState(0);
  const [isMaxScrollCaptured, setIsMaxScrollCaptured] = useState(false);

  const windowHeight = Dimensions.get('window').height;
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 20;
  const usableHeight = windowHeight - statusBarHeight;

  // Handle scroll position change in PDF
  const handleScroll = (x, y) => {
    const normalizedScrollY = Math.max(0, Math.abs(y));
    setScrollPosition({ x, y: normalizedScrollY });

    if (!isMaxScrollCaptured) {
      setMaxScrollY(normalizedScrollY);  // Capture max scrollY when scrolling to the bottom
    }
  };

  const captureMaxScrollY = () => {
    if (pdfRef.current) {
      pdfRef.current.moveTo(0, -99999, 1); // Scroll to the bottom to capture the max Y
      setTimeout(() => {
        if (pdfRef.current) {
          pdfRef.current.moveTo(0, 0, 1); // Scroll back to the top
        }
        setIsMaxScrollCaptured(true);
      }, 1000);
    }
  };

  const onLoadComplete = () => {
    captureMaxScrollY();
  };

  const scrollToSection = (index) => {
    if (!isMaxScrollCaptured || !maxScrollY) return;
    const sectionHeight = maxScrollY / 10;
    const targetScrollY = index * sectionHeight;
    if (pdfRef.current) {
      pdfRef.current.moveTo(0, -targetScrollY, 1); // Scroll to the section
    }
  };

  const getIconOpacity = (index) => {
    const sectionHeight = maxScrollY / 10;
    const activeSection = scrollPosition.y / sectionHeight;
    const opacity = Math.abs(activeSection - index) < 0.5 ? 1 : 0.3; // Adjust opacity based on proximity
    return opacity;
  };

  if (!isMaxScrollCaptured) {
    return (
      <View style={styles.container}>
        <Pdf
          ref={pdfRef}
          source={{ uri: pdfUri, cache: true }}
          style={styles.pdf}
          onLoadComplete={onLoadComplete}
          onError={(error) => console.log(`PDF Error: ${error}`)}
          onScroll={(x, y) => handleScroll(x, y)}  // Handle the onScroll Y values
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pdf
        ref={pdfRef}
        source={{ uri: pdfUri, cache: true }}
        style={styles.pdf}
        onLoadComplete={onLoadComplete}
        onError={(error) => console.log(`PDF Error: ${error}`)}
        onScroll={(x, y) => handleScroll(x, y)}
      />

      {/* Landmarks Container */}
      <View style={styles.landmarkContainer}>
        {[...Array(10)].map((_, index) => (
          <TouchableOpacity key={index} onPress={() => scrollToSection(index)}>
            {renderLandmark(landmarkType, index, getIconOpacity(index))}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default PdfRead;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width - 20,
    backgroundColor: '#f0f0f0',
  },
  landmarkContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    justifyContent: 'space-around',
    height: Dimensions.get('window').height,
    padding: 10,
  },
});
