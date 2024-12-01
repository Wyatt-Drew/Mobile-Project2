import React, { useRef, useEffect } from 'react';
import { Animated, PanResponder, StyleSheet, View } from 'react-native';

const Scrollbar = ({ scrollPosition, totalHeight, visibleHeight, onScroll, onSingleTap }) => {
  const scrollbarVisibleHeight = visibleHeight * 1; 
  const scrollbarHeight = totalHeight > scrollbarVisibleHeight
    ? (scrollbarVisibleHeight * (scrollbarVisibleHeight / totalHeight))  
    : scrollbarVisibleHeight;

  const pan = useRef(new Animated.Value(0)).current;

  const isDragging = useRef(false);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true, // Always start the responder
    onPanResponderGrant: (e, gestureState) => {
      onSingleTap?.();
      // Explicitly set the initial gesture position
      gestureState.y0 = gestureState.moveY;
      isDragging.current = false; // Reset dragging state
    },
    onPanResponderMove: (e, gestureState) => {
      const dragThreshold = 5; // Minimum movement to consider it a drag
      const maxScrollPosition = totalHeight - scrollbarVisibleHeight;
      // Mark dragging as active only after exceeding the threshold
      if (!isDragging.current) {
        console.log("Dragging started");
        isDragging.current = true;
      }
  
      // Adjust dragging logic to ensure smooth scrolling
      if (isDragging.current) {
        // Recalculate the proportion based on current move
        const dragProportion = (gestureState.moveY - gestureState.y0) / scrollbarVisibleHeight;
  
        // Calculate the new scroll position
        const newScrollPosition = Math.max(
          0,
          Math.min(dragProportion * maxScrollPosition, maxScrollPosition)
        );
        // Pass the calculated scroll position
        onScroll(newScrollPosition);
      }
    },
    onPanResponderRelease: () => {
      // Reset the state and end dragging when the gesture is complete
      isDragging.current = false;
    },
  });
  

  useEffect(() => {
    const maxScrollPosition = totalHeight - visibleHeight; // Full scrollable range of the content
    const maxScrollbarMovement = scrollbarVisibleHeight - scrollbarHeight; // Scrollbar movement range
  
    if (!totalHeight || !visibleHeight || maxScrollbarMovement <= 0) return;
  
    // Calculate the scrollbar's position based on the content's scroll position
    const scrollbarPosition =
      (scrollPosition / maxScrollPosition) * maxScrollbarMovement;
  
    if (!isNaN(scrollbarPosition)) {
      Animated.timing(pan, {
        toValue: scrollbarPosition,
        duration: 0,
        useNativeDriver: false,
      }).start();
    }
  }, [scrollPosition, totalHeight, visibleHeight, scrollbarVisibleHeight, scrollbarHeight]);

  return (
    <View
      {...panResponder.panHandlers}
      style={[styles.touchableArea, { height: scrollbarVisibleHeight }]}
    >
      <Animated.View
        style={[styles.scrollbar, { height: scrollbarHeight, transform: [{ translateY: pan }] }]}
      />
    </View>
  );
};

export default Scrollbar;

const styles = StyleSheet.create({
  touchableArea: {
    position: 'absolute',
    right: 5, 
    width: 40, // Expanded touchable area width
    backgroundColor: 'transparent', 
    zIndex: 2, 
  },
  scrollbar: {
    position: 'absolute',
    right: 0,
    width: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 5,
  },
});
