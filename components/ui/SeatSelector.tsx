import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import theme from '@/constants/theme';
import { ArmchairIcon } from 'lucide-react-native';

interface SeatSelectorProps {
  availableSeats: number;
  onSelectSeat: (seatNumber: string | null) => void;
  selectedSeat: string | null;
}

const SeatSelector: React.FC<SeatSelectorProps> = ({ 
  availableSeats, 
  onSelectSeat,
  selectedSeat 
}) => {
  // Generate seats layout
  const generateSeats = () => {
    const totalSeats = 30; // Total seats in the vehicle
    const seats = [];
    
    // Create a pattern of available/unavailable seats
    for (let i = 1; i <= totalSeats; i++) {
      const row = Math.ceil(i / 4);
      const col = ((i - 1) % 4) + 1;
      const seatNumber = `${String.fromCharCode(64 + row)}${col < 3 ? col : col - 2}`;
      
      // Determine if seat is available (some logic to make some seats unavailable)
      const isAvailable = seats.length < availableSeats && 
        !(row === 2 && col === 2) && // Example of specific unavailable seats
        !(row === 4 && col === 3) &&
        !(row === 6 && col === 1) &&
        !(row === 7 && col === 4);
      
      seats.push({
        id: i,
        number: seatNumber,
        status: isAvailable ? 'available' : 'occupied',
        position: { row, column: col }
      });
    }
    
    return seats;
  };

  const seats = generateSeats();

  const handleSeatPress = (seatNumber: string, status: string) => {
    if (status === 'available') {
      onSelectSeat(selectedSeat === seatNumber ? null : seatNumber);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.busHeader}>
        <View style={styles.driverSeat}>
          <Text style={styles.driverText}>Driver</Text>
        </View>
      </View>
      
      <ScrollView horizontal={false} style={styles.seatsContainer}>
        <View style={styles.seatsGrid}>
          {seats.map((seat) => {
            const isSelected = selectedSeat === seat.number;
            const seatStyle = [
              styles.seat,
              seat.status === 'occupied' && styles.occupiedSeat,
              isSelected && styles.selectedSeat
            ];
            
            const textStyle = [
              styles.seatText,
              seat.status === 'occupied' && styles.occupiedSeatText,
              isSelected && styles.selectedSeatText
            ];
            
            // Add aisle space between seats 2 and 3 in each row
            const isAisleRight = seat.position.column === 2;
            const isAisleLeft = seat.position.column === 3;
            
            return (
              <TouchableOpacity
                key={seat.id}
                style={[
                  seatStyle,
                  isAisleRight && styles.aisleRight,
                  isAisleLeft && styles.aisleLeft
                ]}
                onPress={() => handleSeatPress(seat.number, seat.status)}
                disabled={seat.status === 'occupied'}
              >
                <ArmchairIcon 
                  size={24} 
                  color={
                    isSelected 
                      ? '#FFFFFF' 
                      : seat.status === 'occupied' 
                        ? theme.colors.inactive 
                        : theme.colors.primary
                  } 
                />
                <Text style={textStyle}>{seat.number}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
      
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendSeat, styles.availableLegend]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSeat, styles.selectedLegend]} />
          <Text style={styles.legendText}>Selected</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSeat, styles.occupiedLegend]} />
          <Text style={styles.legendText}>Occupied</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  busHeader: {
    width: '80%',
    height: 50,
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  driverSeat: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverText: {
    fontSize: theme.fontSizes.xs,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  seatsContainer: {
    maxHeight: 300,
  },
  seatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  seat: {
    width: 50,
    height: 50,
    margin: 5,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  occupiedSeat: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
  },
  selectedSeat: {
    backgroundColor: theme.colors.primary,
  },
  seatText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text,
    marginTop: 2,
  },
  occupiedSeatText: {
    color: theme.colors.inactive,
  },
  selectedSeatText: {
    color: '#FFFFFF',
  },
  aisleRight: {
    marginRight: 20,
  },
  aisleLeft: {
    marginLeft: 20,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: theme.spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendSeat: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 6,
  },
  availableLegend: {
    backgroundColor: theme.colors.highlight,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  selectedLegend: {
    backgroundColor: theme.colors.primary,
  },
  occupiedLegend: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  legendText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
  },
});