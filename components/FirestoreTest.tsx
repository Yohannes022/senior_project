import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { db } from '../config/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export default function FirestoreTest() {
  const [testData, setTestData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Ready to test');

  const testFirestore = async () => {
    try {
      setLoading(true);
      setStatus('Testing Firestore...');
      
      // Test document data
      const testDoc = {
        message: 'Hello, Firestore!',
        timestamp: serverTimestamp(),
        testNumber: Math.random()
      };

      // Add a test document
      const docRef = doc(db, 'test', 'testDoc');
      await setDoc(docRef, testDoc);
      setStatus('Document written successfully!');
      
      // Read the document back
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setTestData(docSnap.data());
        setStatus('Document read successfully!');
      } else {
        setStatus('No such document!');
      }
    } catch (error: unknown) {
      console.error('Error testing Firestore:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setStatus(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Firestore Connection Test</Text>
      <TouchableOpacity 
        style={[styles.button, loading && { opacity: 0.7 }]} 
        onPress={testFirestore}
        disabled={loading}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Testing...' : 'Test Database Connection'}
        </Text>
      </TouchableOpacity>
      
      <Text style={[
        styles.status, 
        status.includes('Error') && styles.error,
        status.includes('successfully') && styles.success
      ]}>
        {status}
      </Text>
      
      {testData && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Test Document Data:</Text>
          <Text style={styles.resultText}>
            {JSON.stringify(testData, null, 2)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  status: {
    marginTop: 10,
    marginBottom: 15,
    color: '#666',
    textAlign: 'center',
    fontSize: 14,
  },
  resultContainer: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  resultTitle: {
    fontWeight: '600',
    marginBottom: 8,
    color: '#2c3e50',
  },
  resultText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#34495e',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  error: {
    color: '#e74c3c',
    fontWeight: '500',
  },
  success: {
    color: '#27ae60',
    fontWeight: '500',
  },
});
