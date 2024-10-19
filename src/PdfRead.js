import { View, StyleSheet, Dimensions, StatusBar, Platform, Animated, PanResponder } from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import Pdf from '../libraries/react-native-pdf';

// Scrollbar component
const Scrollbar = ({ scrollPosition, totalHeight, visibleHeight, onScroll }) => {
  const scrollbarHeight = totalHeight > visibleHeight
    ? (visibleHeight * (visibleHeight / totalHeight))
    : visibleHeight;

  const pan = useRef(new Animated.Value(0)).current;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (e, gestureState) => {
      const maxScrollPosition = totalHeight - visibleHeight;

      if (!totalHeight || !visibleHeight) return;

      const dragProportion = gestureState.moveY / visibleHeight;
      const newScrollPosition = Math.max(
        0,
        Math.min(dragProportion * maxScrollPosition, maxScrollPosition)
      );

      onScroll(newScrollPosition);
    },
  });

  useEffect(() => {
    const maxScrollPosition = totalHeight - visibleHeight;
    const scrollbarPosition = (scrollPosition / maxScrollPosition) * (visibleHeight - scrollbarHeight);

    if (!isNaN(scrollbarPosition)) {
      Animated.timing(pan, {
        toValue: scrollbarPosition,
        duration: 0,
        useNativeDriver: false,
      }).start();
    }
  }, [scrollPosition, totalHeight, visibleHeight]);

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.scrollbar,
        { height: scrollbarHeight, transform: [{ translateY: pan }] }
      ]}
    />
  );
};

// Main PdfRead component
const PdfRead = ({ route }) => {
  const { pdfUri } = route.params;
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
      setMaxScrollY(normalizedScrollY);
    }
  };

  // Capture max Y position by scrolling to bottom and then back to top
  const captureMaxScrollY = () => {
    if (pdfRef.current) {
      // First, scroll to the bottom
      pdfRef.current.moveTo(0, -99999, 1); // A large negative Y value to simulate scrolling to the bottom

      setTimeout(() => {
        // Scroll back to the top after capturing the maximum Y
        pdfRef.current.moveTo(0, 0, 1);
        setIsMaxScrollCaptured(true);
      }, 1000); // Give enough time to capture the max scroll
    }
  };

  // Handle load completion to trigger the scroll-to-bottom process
  const onLoadComplete = () => {
    captureMaxScrollY(); // Start the process to capture max scroll
  };

  // Handle scrollbar scrolling - move the PDF based on scrollbar drag
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
      <View style={styles.container}>
        <Pdf
          ref={pdfRef}
          source={{ uri: pdfUri, cache: true }}
          style={styles.pdf}
          onLoadComplete={onLoadComplete}
          onError={(error) => console.log(`PDF Error: ${error}`)}
          onScroll={(x, y) => handleScroll(x, y)}
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
      <Scrollbar
        scrollPosition={scrollPosition.y}
        totalHeight={maxScrollY}
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
    width: Dimensions.get('window').width - 20,
    backgroundColor: '#f0f0f0',
  },
  scrollbar: {
    width: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 5,
    position: 'absolute',
    right: 0,
  },
});
