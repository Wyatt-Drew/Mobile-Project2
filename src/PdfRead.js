import { View, StyleSheet, Dimensions, StatusBar, Platform, TouchableOpacity } from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import Pdf from '../libraries/react-native-pdf';
import { renderLandmark } from './LandmarkRenderer'; // Ensure this import is correct
import Scrollbar from './Scrollbar'; // Import Scrollbar component

const PdfRead = ({ route }) => {
  const { pdfUri, landmarkType } = route.params;
  const pdfRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  const [maxScrollY, setMaxScrollY] = useState(0);
  const [isMaxScrollCaptured, setIsMaxScrollCaptured] = useState(false);

  const windowHeight = Dimensions.get('window').height;
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 20;
  const usableHeight = windowHeight - statusBarHeight;

  const handleScroll = (x, y) => {
    const normalizedScrollY = Math.max(0, Math.abs(y));
    setScrollPosition({ x, y: normalizedScrollY });

    if (!isMaxScrollCaptured) {
      setMaxScrollY(normalizedScrollY); // Capture max scrollY when scrolling to the bottom
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

  // Refactor scrollToSection to scroll to the center of each section
  const scrollToSection = (index) => {
    if (!isMaxScrollCaptured || !maxScrollY) return;
    const sectionHeight = maxScrollY / 10;
    const targetScrollY = index * sectionHeight + sectionHeight / 2; // Scroll to the midpoint of each section
    if (pdfRef.current) {
      pdfRef.current.moveTo(0, -targetScrollY, 1); // Scroll to the midpoint of the section
    }
  };

  const getIconOpacity = (index) => {
    const sectionHeight = maxScrollY / 10;
    const activeSection = scrollPosition.y / sectionHeight;
    const opacity = Math.abs(activeSection - index) < 0.5 ? 1 : 0.3; // Adjust opacity based on proximity
    return opacity;
  };

  const handleScrollbarScroll = (newPosition) => {
    if (!isMaxScrollCaptured) return;
    const scrollRatio = newPosition / maxScrollY;
    const newY = Math.ceil(scrollRatio * maxScrollY);

    if (pdfRef.current) {
      pdfRef.current.moveTo(0, -newY, 1); // Scroll the PDF based on scrollbar position
    }
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

      {/* Scrollbar */}
      <Scrollbar
        scrollPosition={scrollPosition.y}
        totalHeight={maxScrollY + usableHeight} 
        visibleHeight={usableHeight}
        onScroll={handleScrollbarScroll}
      />
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
    width: Dimensions.get('window').width - 40, // Adjusted to make space for landmarks and scrollbar
    backgroundColor: '#f0f0f0',
  },
  landmarkContainer: {
    position: 'absolute',
    top: 0,
    left: 10,
    justifyContent: 'space-around',
    height: Dimensions.get('window').height * 0.8,
    padding: 10,
  },
});
