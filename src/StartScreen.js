import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';

const StartScreen = ({ navigation }) => {
  const [selectedPdf, setSelectedPdf] = useState('');
  const [selectedLandmarkType, setSelectedLandmarkType] = useState('');

  const pdfOptions = [
    { label: 'a Page Test', value: 'https://www.uregina.ca/oir/assets/budget/comprehensive/2024-25-cbp.pdf' },
    { label: '2 Page Test', value: 'https://www.uregina.ca/financial-services/assets/budget-assets/2024-25-budget-docs/2024-03-22-budget-town-hall.pdf' },
    { label: '25 Page Test', value: 'https://drive.google.com/file/d/1U6fprZIV3bEj4GL8NytG4n_u3yuCSjCk/view?usp=sharing' },
    { label: '44 Page Test', value: 'https://drive.google.com/file/d/1ZjBk0-Dy3TdvV-Vosfrps4gWovQLAVIX/view?usp=sharing' },

  ];

  const landmarkTypes = [
    { label: 'Numbers (1-10)', value: 'Numbers' },
    { label: 'Letters (A-J)', value: 'Letters' },
    { label: 'Icons (Default)', value: 'Icons' },
    { label: 'Color Icons', value: 'ColorIcons' },
    { label: 'No Icons', value: 'None' },
  ];

  const beginReading = () => {
    if (selectedPdf && selectedLandmarkType) {
      navigation.navigate('PdfRead', { pdfUri: selectedPdf, landmarkType: selectedLandmarkType });
    } else {
      alert('Please select both a PDF and a landmark type');
    }
  };

  const renderButton = (options, selectedValue, onSelect) => {
    return options.map((option) => (
      <TouchableOpacity
        key={option.value}
        onPress={() => onSelect(option.value)}
        style={[
          styles.optionButton,
          selectedValue === option.value && styles.selectedOption,
        ]}
      >
        <Text
          style={[
            styles.optionText,
            selectedValue === option.value && styles.selectedOptionText,
          ]}
        >
          {option.label}
        </Text>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a PDF and Landmark Type</Text>

      {/* PDF Selection */}
      <Text style={styles.label}>Choose a PDF:</Text>
      <View style={styles.optionsContainer}>
        {renderButton(pdfOptions, selectedPdf, setSelectedPdf)}
      </View>

      {/* Landmark Type Selection */}
      <Text style={styles.label}>Choose a Landmark Type:</Text>
      <View style={styles.optionsContainer}>
        {renderButton(landmarkTypes, selectedLandmarkType, setSelectedLandmarkType)}
      </View>

      <TouchableOpacity onPress={beginReading} style={styles.beginButton}>
        <Text style={styles.beginButtonText}>Begin</Text>
      </TouchableOpacity>
    </View>
  );
};

export default StartScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionButton: {
    padding: 15,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#007AFF',
  },
  optionText: {
    fontSize: 16,
    color: '#007AFF',
  },
  selectedOptionText: {
    color: '#fff',
  },
  beginButton: {
    padding: 15,
    backgroundColor: '#28a745',
    borderRadius: 5,
    alignItems: 'center',
  },
  beginButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});
