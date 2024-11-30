import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { TapGestureHandler } from 'react-native-gesture-handler';

const customIcons = [
  require('../assets/icons/boat.png'),
  require('../assets/icons/diamond.png'),
  require('../assets/icons/clock.png'),
  require('../assets/icons/heart.png'),
  require('../assets/icons/crown.png'),
  require('../assets/icons/liberty.png'),
  require('../assets/icons/rook.png'),
  require('../assets/icons/dolphin.png'),
  require('../assets/icons/idea.png'),
  require('../assets/icons/graduate.png'),
];

const customIconsColor = [
  require('../assets/icons/home.png'),
  require('../assets/icons/blue-screen.png'),
  require('../assets/icons/butterfly.png'),
  require('../assets/icons/sunny.png'),
  require('../assets/icons/star.png'),
  require('../assets/icons/fruit.png'),
  require('../assets/icons/green-energy.png'),
  require('../assets/icons/cabbage.png'),
  require('../assets/icons/dice.png'),
  require('../assets/icons/french-fries.png'),
];

export const LandmarkType = {
  NUMBERS: 'Numbers',
  LETTERS: 'Letters',
  ICONS: 'Icons',
  COLOR_ICONS: 'ColorIcons',
  NONE: 'None',
};

// Function to render a landmark based on type and index, with dynamic opacity
export const renderLandmark = (type, index, opacity, onPress = () => {}) => {
  switch (type) {
    case LandmarkType.NUMBERS:
      return (
        <TapGestureHandler onHandlerStateChange={onPress}>
          <View style={styles.touchArea}>
            <Animated.Text style={[styles.landmarkText, { opacity }]}>
              {index + 1}
            </Animated.Text>
          </View>
        </TapGestureHandler>
      ); // Numbers (1-10)
    case LandmarkType.LETTERS:
      return (
        <TapGestureHandler onHandlerStateChange={onPress}>
          <View style={styles.touchArea}>
            <Animated.Text style={[styles.landmarkText, { opacity }]}>
              {String.fromCharCode(65 + index)}
            </Animated.Text>
          </View>
        </TapGestureHandler>
      ); // Letters (A-J)
    case LandmarkType.ICONS:
      return (
        <TapGestureHandler onHandlerStateChange={onPress}>
          <View style={styles.touchArea}>
            <Animated.Image
              source={customIcons[index]}
              style={[styles.icon, { opacity }]}
            />
          </View>
        </TapGestureHandler>
      ); // Default Icons
    case LandmarkType.COLOR_ICONS:
      return (
        <TapGestureHandler onHandlerStateChange={onPress}>
          <View style={styles.touchArea}>
            <Animated.Image
              source={customIconsColor[index]}
              style={[styles.icon, { opacity }]}
            />
          </View>
        </TapGestureHandler>
      ); // Color Icons
    case LandmarkType.NONE:
      return null; // No icons
    default:
      return null;
  }
};

const styles = StyleSheet.create({
  landmarkText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  icon: {
    width: 30,
    height: 30,
    marginVertical: 10,
  },
  touchArea: {
    padding: 15, // Larger tappable area
    alignItems: 'center',
    justifyContent: 'center',
  },
});
