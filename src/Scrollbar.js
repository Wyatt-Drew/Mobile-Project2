import React, { useRef, useEffect } from 'react';
import { Animated, PanResponder, StyleSheet } from 'react-native';

const Scrollbar = ({ scrollPosition, totalHeight, visibleHeight, onScroll }) => {
  const scrollbarVisibleHeight = visibleHeight * 0.9; // Only 80% of the visible height
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
    const maxScrollPosition = totalHeight - scrollbarVisibleHeight;
    if (!totalHeight || !scrollbarVisibleHeight || maxScrollPosition <= 0) return;

    const scrollbarPosition = (scrollPosition / maxScrollPosition) * (scrollbarVisibleHeight - scrollbarHeight);
    if (!isNaN(scrollbarPosition)) {
      Animated.timing(pan, {
        toValue: scrollbarPosition,
        duration: 0,
        useNativeDriver: false,
      }).start();
    }
  }, [scrollPosition, totalHeight, scrollbarVisibleHeight]);

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[styles.scrollbar, { height: scrollbarHeight, top: 0, transform: [{ translateY: pan }] }]}
    />
  );
};

export default Scrollbar;

const styles = StyleSheet.create({
  scrollbar: {
    position: 'absolute',
    right: 10,
    width: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 5,
  },
});