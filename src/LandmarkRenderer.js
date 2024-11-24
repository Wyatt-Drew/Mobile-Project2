import React from 'react';
import { Animated, StyleSheet, Image } from 'react-native';

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
export const renderLandmark = (type, index, opacity) => {
  switch (type) {
    case LandmarkType.NUMBERS:
      return <Animated.Text style={[styles.landmarkText, { opacity }]}>{index + 1}</Animated.Text>; // Numbers (1-10)
    case LandmarkType.LETTERS:
      return <Animated.Text style={[styles.landmarkText, { opacity }]}>{String.fromCharCode(65 + index)}</Animated.Text>; // Letters (A-J)
    case LandmarkType.ICONS:
      return <Animated.Image source={customIcons[index]} style={[styles.icon, { opacity }]} />; // Default Icons
    case LandmarkType.COLOR_ICONS:
      return <Animated.Image source={customIconsColor[index]} style={[styles.icon, { opacity }]} />; // Color Icons
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
});
