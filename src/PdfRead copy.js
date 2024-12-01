import { View, StyleSheet, Dimensions, StatusBar, Platform, TouchableOpacity } from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import Pdf from '../libraries/react-native-pdf';
import { renderLandmark } from './LandmarkRenderer';
import Scrollbar from './Scrollbar';
import { appendRow } from './components/googleSheetsService';
import { TapGestureHandler } from "react-native-gesture-handler";

const PdfRead = ({ sendMessage, route }) => {
  const { pdfUri, landmarkType, targetHeight, subjectId } = route.params;
  const pdfRef = useRef(null);

  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  const [previousScrollPosition, setPreviousScrollPosition] = useState(0); 
  const [cumulativeDistance, setCumulativeDistance] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  const [signalPosition, setSignalPosition] = useState(0); 
  const [maxScrollY, setMaxScrollY] = useState(0);
  const [isMaxScrollCaptured, setIsMaxScrollCaptured] = useState(false);

  const windowHeight = Dimensions.get('window').height;
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 20;
  const usableHeight = windowHeight - statusBarHeight;

  const source = typeof pdfUri === 'string' ? { uri: pdfUri, cache: true } : pdfUri;
  const handleSingleTap = () => {
    setTapCount((prev) => prev + 1);
    console.log("Screen tapped! Total tap count:", tapCount + 1);
  };

  const handleSubmit = async (sheetName, cumulativeDistance, tapCount) => {
    try {
      const valuesArray = values.split(","); // Assuming values are comma-separated
      await appendRow(sheetName, valuesArray);
      alert("Row appended successfully!");
    } catch (error) {
      alert("Failed to append row.");
    }
  };
  
  useEffect(() => {
    if (targetHeight !== null) {
      const range = 100; // Allowable range in pixels
      if (Math.abs(scrollPosition.y - targetHeight) <= range) {
        console.log("Target height reached! Sending TARGETFOUND message...");
        sendMessage("TARGETFOUND", "Target reached"); // Use sendMessage from Sender
  
        // Append data to the sheet
        handleSubmit();
  
        // Reset counters after submitting
        setTapCount(0);
        setCumulativeDistance(0);
      }
    }
  }, [scrollPosition, targetHeight]);

  const handleScroll = (x, y) => {
    const normalizedScrollY = Math.max(0, Math.abs(y));
    setScrollPosition({ x, y: normalizedScrollY });

    // Update cumulative distance scrolled
    const delta = Math.abs(normalizedScrollY - previousScrollPosition);
    setCumulativeDistance((prev) => prev + delta);

    // Update the previous scroll position for the next delta calculation
    setPreviousScrollPosition(normalizedScrollY);

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

  const scrollToSection = (index) => {
    if (!isMaxScrollCaptured || !maxScrollY) return;
    const sectionHeight = (maxScrollY + usableHeight) / 10;
    const targetScrollY = (index + 0.5) * sectionHeight; 
    if (pdfRef.current) {
      pdfRef.current.moveTo(0, -targetScrollY, 1); 
    }
  };

  const getIconOpacity = (index) => {
    if (!isMaxScrollCaptured || maxScrollY === 0) return 0.3;

    const sectionHeight = (maxScrollY + usableHeight) / 10;
    const sectionMidpoint = index * sectionHeight + sectionHeight / 2;
    const distanceFromMidpoint = Math.abs(scrollPosition.y - sectionMidpoint);

    const fullOpacityThreshold = sectionHeight / 2;

    return distanceFromMidpoint <= fullOpacityThreshold ? 1 : 0.3;
  };

  const handleScrollbarScroll = (newPosition) => {
    if (!isMaxScrollCaptured) return;
    const scrollRatio = newPosition / maxScrollY;
    const newY = Math.ceil(scrollRatio * maxScrollY);

    if (pdfRef.current) {
      pdfRef.current.moveTo(0, -newY, 1);
    }
  };

  if (!isMaxScrollCaptured) {
    return (
      <View style={styles.container} pointerEvents="box-none">
        <Pdf
          trustAllCerts={false}
          ref={pdfRef}
          source={source}
          style={styles.pdf}
          onLoadComplete={onLoadComplete}
          onError={(error) => console.log(`PDF Error: ${error}`)}
          onScroll={(x, y) => handleScroll(x, y)}
        />
  
        {/* Invisible overlay to block interactions */}
        <View style={styles.invisibleLayer} pointerEvents="box-only" />
      </View>
    );
  }
  
  return (
    <TapGestureHandler onActivated={handleSingleTap}>
      <View style={styles.container} pointerEvents="box-none">
        <Pdf
          ref={pdfRef}
          source={source}
          style={styles.pdf}
          onLoadComplete={onLoadComplete}
          onError={(error) => console.log(`PDF Error: ${error}`)}
          onScroll={(x, y) => handleScroll(x, y)}
        />

        {/* Invisible overlay to block interactions */}
        <View style={styles.invisibleLayer} pointerEvents="box-only" />

        <View style={styles.landmarkContainer}>
          {[...Array(10)].map((_, index) => (
            <TouchableOpacity key={index} onPress={() => scrollToSection(index)}>
              {renderLandmark(landmarkType, index, getIconOpacity(index))}
            </TouchableOpacity>
          ))}
        </View>

        <Scrollbar
          scrollPosition={scrollPosition.y}
          totalHeight={maxScrollY + usableHeight}
          visibleHeight={usableHeight}
          onScroll={handleScrollbarScroll}
        />
      </View>
    </TapGestureHandler>
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
    width: Dimensions.get('window').width - 40,
    backgroundColor: '#f0f0f0',
  },
  landmarkContainer: {
    position: 'absolute',
    top: 0,
    right: 30,
    justifyContent: 'space-around',
    height: Dimensions.get('window').height * 1,
    padding: 0,
    zIndex: 2,
  },
  invisibleLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1, 
    backgroundColor: 'transparent', 
  },
});