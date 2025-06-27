import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';

// Mock data for terminal vehicles
const mockTerminalVehicles = [
  {
    id: 't1',
    terminal: 'Megenagna Terminal',
    vehicles: [
      { id: 'v1', type: 'Minibus', route: 'Megenagna to Bole', departure: '10:00 AM', capacity: 12, available: 8 },
      { id: 'v2', type: 'Minibus', route: 'Megenagna to Mexico', departure: '10:15 AM', capacity: 12, available: 5 },
      { id: 'v3', type: 'Minibus', route: 'Megenagna to CMC', departure: '10:30 AM', capacity: 12, available: 12 },
    ]
  },
  {
    id: 't2',
    terminal: 'Meskel Square Terminal',
    vehicles: [
      { id: 'v4', type: 'Bus', route: 'Meskel to Bole', departure: '10:10 AM', capacity: 32, available: 15 },
      { id: 'v5', type: 'Bus', route: 'Meskel to Kality', departure: '10:25 AM', capacity: 32, available: 10 },
    ]
  }
];

interface TerminalVehiclesProps {
  onVehicleSelect?: (vehicle: any) => void;
  onViewAll?: () => void;
}

export default function TerminalVehicles({ onVehicleSelect, onViewAll }: TerminalVehiclesProps) {
  const handleVehiclePress = (vehicle: any) => {
    if (onVehicleSelect) {
      onVehicleSelect(vehicle);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Vehicles at Terminals</Text>
        {onViewAll && (
          <TouchableOpacity onPress={onViewAll}>
            <Text style={styles.seeAll}>View All</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {mockTerminalVehicles.map((terminal) => (
          <View key={terminal.id} style={styles.terminalCard}>
            <View style={styles.terminalHeader}>
              <Ionicons name="bus" size={20} color={Colors.primary} />
              <Text style={styles.terminalName}>{terminal.terminal}</Text>
            </View>
            
            <View style={styles.vehiclesContainer}>
              {terminal.vehicles.map((vehicle) => (
                <TouchableOpacity 
                  key={vehicle.id} 
                  style={styles.vehicleCard}
                  onPress={() => handleVehiclePress(vehicle)}
                >
                  <View style={styles.vehicleHeader}>
                    <Text style={styles.vehicleType}>{vehicle.type}</Text>
                    <Text style={styles.vehicleRoute}>{vehicle.route}</Text>
                  </View>
                  
                  <View style={styles.vehicleDetails}>
                    <View style={styles.detailRow}>
                      <Ionicons name="time" size={14} color={Colors.textLight} />
                      <Text style={styles.detailText}>{vehicle.departure}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="people" size={14} color={Colors.textLight} />
                      <Text style={styles.detailText}>
                        {vehicle.available}/{vehicle.capacity} seats
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.viewButton}>
                    <Text style={styles.viewButtonText}>View</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  seeAll: {
    color: Colors.primary,
    fontWeight: '500',
  },
  scrollContent: {
    paddingRight: 16,
  },
  terminalCard: {
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  terminalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  terminalName: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  vehiclesContainer: {
    gap: 12,
  },
  vehicleCard: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
  },
  vehicleHeader: {
    marginBottom: 8,
  },
  vehicleType: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 2,
  },
  vehicleRoute: {
    fontSize: 14,
    color: Colors.text,
  },
  vehicleDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    marginLeft: 6,
    fontSize: 13,
    color: Colors.textLight,
  },
  viewButton: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  viewButtonText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '500',
  },
});
