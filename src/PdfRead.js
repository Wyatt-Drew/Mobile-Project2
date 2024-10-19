import { View, StyleSheet, Dimensions, StatusBar, Platform, Animated, PanResponder } from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import Pdf from '../libraries/react-native-pdf';

// Scrollbar component
const Scrollbar = ({ scrollPosition, totalHeight, visibleHeight, onScroll }) => {
  // Calculate scrollbar height based on the proportion of visible content vs total content
  const scrollbarHeight = totalHeight > visibleHeight
    ? (visibleHeight * (visibleHeight / totalHeight))  // Proportional height
    : visibleHeight;

  const pan = useRef(new Animated.Value(0)).current;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (e, gestureState) => {
      const maxScrollPosition = totalHeight - visibleHeight;
      if (!totalHeight || !visibleHeight || maxScrollPosition <= 0) return;

      // Gesture proportion in relation to visible height
      const dragProportion = (gestureState.moveY - gestureState.y0) / visibleHeight;

      // Adjust the proportion to limit the range between 10% and 90%
      const minProportion = 0; // Lower limit (10%)
      const maxProportion = 0.9; // Upper limit (90%)
      const adjustedDragProportion = Math.max(minProportion, Math.min(dragProportion, maxProportion));

      // Calculate the new scroll position based on gesture proportion, ensuring it stays within bounds
      const newScrollPosition = Math.max(
        0,
        Math.min((adjustedDragProportion - minProportion) / (maxProportion - minProportion) * maxScrollPosition, maxScrollPosition)
      );

      onScroll(newScrollPosition);
    },
  });

  // Effect to update scrollbar position based on the PDF scroll position
  useEffect(() => {
    const maxScrollPosition = totalHeight - visibleHeight;

    if (!totalHeight || !visibleHeight || maxScrollPosition <= 0) return;

    // Adjusted scrollbar position to stay within the 10% to 90% range
    const minProportion = 0; // Lower limit (10%)
    const maxProportion = 0.9; // Upper limit (90%)
    const scrollbarPosition = Math.min(
      Math.max((scrollPosition / maxScrollPosition) * (visibleHeight - scrollbarHeight), 0),
      visibleHeight - scrollbarHeight
    );

    // Adjust scrollbar position to fall between 10% and 90% of the available range
    const adjustedScrollbarPosition = minProportion * visibleHeight + scrollbarPosition * (maxProportion - minProportion);

    if (!isNaN(adjustedScrollbarPosition)) {
      Animated.timing(pan, {
        toValue: adjustedScrollbarPosition,
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

  // Handle scroll position change in PDF (PDF scroll Y - "potato scale")
  const handleScroll = (x, y) => {
    const normalizedScrollY = Math.max(0, Math.abs(y)); // Abs Y from onScroll (potato scale)
    setScrollPosition({ x, y: normalizedScrollY });

    if (!isMaxScrollCaptured) {
      setMaxScrollY(normalizedScrollY);  // Capture max scrollY when scrolling to the bottom
    }
  };

  // Scroll to the bottom and then back to the top to capture max Y (document scale)
  const captureMaxScrollY = () => {
    if (pdfRef.current) {
      // Scroll to the bottom to get the maximum Y value (in pdf scale - "potato scale")
      pdfRef.current.moveTo(0, -99999, 1); // Simulate scrolling to the bottom of the document

      setTimeout(() => {
        // After capturing the bottom, scroll back to the top
        if (pdfRef.current) {
          pdfRef.current.moveTo(0, 0, 1); // Scroll back to the top
        }
        setIsMaxScrollCaptured(true);  // We've captured the maximum Y value
      }, 1000); // Allow time for the scroll to bottom
    }
  };

  // On PDF load completion, trigger the scroll capture to get max Y
  const onLoadComplete = () => {
    captureMaxScrollY(); // Start the process of capturing the max scroll Y
  };

  // Handle scrollbar dragging to scroll the PDF
  const handleScrollbarScroll = (newPosition) => {
    if (!isMaxScrollCaptured) return; // Don't scroll if we haven't captured the max Y

    const scrollRatio = newPosition / maxScrollY;
    const newY = Math.ceil(scrollRatio * maxScrollY); // Calculate new Y in pdf's potato scale

    if (pdfRef.current) {
      pdfRef.current.moveTo(0, -newY, 1); // Move to the new Y position in the PDF
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
      <Scrollbar
        scrollPosition={scrollPosition.y}  // PDF scroll Y (potato scale)
        totalHeight={maxScrollY}  // Total scrollable height (document scale)
        visibleHeight={usableHeight}  // Visible height of the document
        onScroll={handleScrollbarScroll}  // Handle the scrollbar drag
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
    width: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 5,
    position: 'absolute',
    right: 1,
  },
});
