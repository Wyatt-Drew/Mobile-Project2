import React, { useRef, useEffect } from 'react';
import { Animated, PanResponder, StyleSheet, View } from 'react-native';

const Scrollbar = ({ scrollPosition, totalHeight, visibleHeight, onScroll }) => {
  const scrollbarVisibleHeight = visibleHeight * 0.8; // Only 80% of the visible height
  const scrollbarHeight = totalHeight > scrollbarVisibleHeight
    ? (scrollbarVisibleHeight * (scrollbarVisibleHeight / totalHeight))  // Proportional height
    : scrollbarVisibleHeight;

  const pan = useRef(new Animated.Value(0)).current;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (e, gestureState) => {
      const maxScrollPosition = totalHeight - scrollbarVisibleHeight;
      if (!totalHeight || !scrollbarVisibleHeight || maxScrollPosition <= 0) return;

      const dragProportion = (gestureState.moveY - gestureState.y0) / scrollbarVisibleHeight;
      const newScrollPosition = Math.max(0, Math.min(dragProportion * maxScrollPosition, maxScrollPosition));

      onScroll(newScrollPosition);
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
    right: 5, // Adjust as needed to align visually
    width: 40, // Expanded touchable area width
    backgroundColor: 'transparent', // Keep it invisible
    zIndex: 1, // Ensure it's on top
  },
  scrollbar: {
    position: 'absolute',
    right: 10,
    width: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 5,
  },
});
