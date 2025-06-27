import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const AddVehicleScreen = () => {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    color: '',
    licensePlate: '',
  });

  const handleSubmit = () => {
    // TODO: Implement form submission logic
    console.log('Form submitted:', formData);
    // Navigate back after submission
    router.back();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add New Vehicle</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Make</Text>
        <TextInput
          style={styles.input}
          value={formData.make}
          onChangeText={(text) => setFormData({...formData, make: text})}
          placeholder="e.g., Toyota"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Model</Text>
        <TextInput
          style={styles.input}
          value={formData.model}
          onChangeText={(text) => setFormData({...formData, model: text})}
          placeholder="e.g., Corolla"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Year</Text>
        <TextInput
          style={styles.input}
          value={formData.year}
          onChangeText={(text) => setFormData({...formData, year: text})}
          placeholder="e.g., 2023"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Color</Text>
        <TextInput
          style={styles.input}
          value={formData.color}
          onChangeText={(text) => setFormData({...formData, color: text})}
          placeholder="e.g., Blue"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>License Plate</Text>
        <TextInput
          style={styles.input}
          value={formData.licensePlate}
          onChangeText={(text) => setFormData({...formData, licensePlate: text})}
          placeholder="e.g., ABC123"
        />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Add Vehicle</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddVehicleScreen;
