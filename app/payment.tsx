import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CreditCard, Check, Plus, ArmchairIcon } from 'lucide-react-native';
import theme from '@/constants/theme';
import useAppStore from '@/store/useAppStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const TICKET_TYPES = [
  { id: 'single', name: 'Single Ride', price: 25, description: 'Valid for one trip' },
  { id: 'day', name: 'Day Pass', price: 50, description: 'Unlimited rides for 24 hours' },
  { id: 'week', name: 'Weekly Pass', price: 250, description: 'Unlimited rides for 7 days' },
  { id: 'month', name: 'Monthly Pass', price: 750, description: 'Unlimited rides for 30 days' },
];

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user, addTicket } = useAppStore();
  
  const [selectedTicketType, setSelectedTicketType] = useState(TICKET_TYPES[0]);
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const seatNumber = params.seatNumber as string;

  const handleQuantityChange = (value: number) => {
    if (value >= 1 && value <= 10) {
      setQuantity(value);
    }
  };

  const handlePayment = () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      const now = new Date();
      let validUntil;
      
      switch (selectedTicketType.id) {
        case 'day':
          validUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          break;
        case 'week':
          validUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          validUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          break;
        default: // single
          validUntil = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      }
      
      const newTicket = {
        id: `ticket-${Date.now()}`,
        type: selectedTicketType.id,
        validFrom: now.toISOString(),
        validUntil: validUntil.toISOString(),
        routes: ['route1', 'route2', 'route3', 'route4', 'route5'],
        price: selectedTicketType.price * quantity,
        isActive: true,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TICKET-${Date.now()}`,
        seatNumber: seatNumber || undefined
      };
      
      addTicket(newTicket);
      setIsProcessing(false);
      
      Alert.alert(
        "Payment Successful",
        seatNumber 
          ? `Your seat ${seatNumber} has been reserved successfully!` 
          : "Your ticket has been purchased successfully!",
        [
          { 
            text: "View Ticket", 
            onPress: () => router.push({
              pathname: '/ticket-details',
              params: { ticketId: newTicket.id }
            })
          }
        ]
      );
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Reserve Your Seat</Text>
        
        {seatNumber && (
          <Card style={styles.seatCard}>
            <View style={styles.seatInfo}>
              <View style={styles.seatIconContainer}>
                <ArmchairIcon size={28} color="#FFFFFF" />
              </View>
              <View style={styles.seatTextContainer}>
                <Text style={styles.seatTitle}>Reserved Seat</Text>
                <Text style={styles.seatNumber}>{seatNumber}</Text>
              </View>
            </View>
          </Card>
        )}

        <Card style={styles.ticketTypeCard}>
          <Text style={styles.sectionTitle}>Select Ticket Type</Text>
          
          {TICKET_TYPES.map((ticket) => (
            <TouchableOpacity 
              key={ticket.id}
              style={[
                styles.ticketTypeItem,
                selectedTicketType.id === ticket.id && styles.selectedTicketType
              ]}
              onPress={() => setSelectedTicketType(ticket)}
            >
              <View style={styles.ticketTypeInfo}>
                <Text style={styles.ticketTypeName}>{ticket.name}</Text>
                <Text style={styles.ticketTypeDescription}>{ticket.description}</Text>
              </View>
              <View style={styles.ticketTypeRight}>
                <Text style={styles.ticketTypePrice}>{ticket.price} ETB</Text>
                {selectedTicketType.id === ticket.id && (
                  <View style={styles.checkCircle}>
                    <Check size={16} color="#FFFFFF" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </Card>

        <Card style={styles.quantityCard}>
          <Text style={styles.sectionTitle}>Quantity</Text>
          
          <View style={styles.quantitySelector}>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
            >
              <Text style={[
                styles.quantityButtonText,
                quantity <= 1 && styles.quantityButtonDisabled
              ]}>-</Text>
            </TouchableOpacity>
            
            <Text style={styles.quantityValue}>{quantity}</Text>
            
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= 10}
            >
              <Text style={[
                styles.quantityButtonText,
                quantity >= 10 && styles.quantityButtonDisabled
              ]}>+</Text>
            </TouchableOpacity>
          </View>
        </Card>

        <Card style={styles.paymentMethodCard}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          
          {user?.paymentMethods && user.paymentMethods.length > 0 ? (
            user.paymentMethods.map((method) => (
              <TouchableOpacity 
                key={method.id}
                style={styles.paymentMethodItem}
              >
                <CreditCard size={20} color={theme.colors.primary} />
                <View style={styles.paymentMethodInfo}>
                  <Text style={styles.paymentMethodName}>
                    {method.type === 'card' ? `•••• ${method.lastFour}` : method.type}
                  </Text>
                  {method.expiryDate && (
                    <Text style={styles.paymentMethodExpiry}>Expires {method.expiryDate}</Text>
                  )}
                </View>
                {method.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Default</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <TouchableOpacity style={styles.addPaymentButton}>
              <Plus size={20} color={theme.colors.primary} />
              <Text style={styles.addPaymentText}>Add Payment Method</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.telebirrButton}>
            <Text style={styles.telebirrText}>Pay with TeleBirr</Text>
          </TouchableOpacity>
        </Card>

        <Card style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {selectedTicketType.name} x {quantity}
            </Text>
            <Text style={styles.summaryValue}>
              {selectedTicketType.price * quantity} ETB
            </Text>
          </View>
          
          {seatNumber && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Seat Reservation (#{seatNumber})</Text>
              <Text style={styles.summaryValue}>5 ETB</Text>
            </View>
          )}
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service Fee</Text>
            <Text style={styles.summaryValue}>0 ETB</Text>
          </View>
          
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {selectedTicketType.price * quantity + (seatNumber ? 5 : 0)} ETB
            </Text>
          </View>
        </Card>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          title={isProcessing ? "Processing..." : seatNumber ? "Reserve Seat" : "Pay Now"}
          onPress={handlePayment}
          fullWidth
          size="large"
          loading={isProcessing}
          disabled={isProcessing}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSizes.xxl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  seatCard: {
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.highlight,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  seatInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seatIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  seatTextContainer: {
    flex: 1,
  },
  seatTitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
  seatNumber: {
    fontSize: theme.fontSizes.xl,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  ticketTypeCard: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  ticketTypeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  selectedTicketType: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.highlight,
  },
  ticketTypeInfo: {
    flex: 1,
  },
  ticketTypeName: {
    fontSize: theme.fontSizes.md,
    fontWeight: '500',
    color: theme.colors.text,
  },
  ticketTypeDescription: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.subtext,
    marginTop: 2,
  },
  ticketTypeRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticketTypePrice: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginRight: theme.spacing.sm,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityCard: {
    marginBottom: theme.spacing.lg,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: theme.fontSizes.xl,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  quantityButtonDisabled: {
    color: theme.colors.inactive,
  },
  quantityValue: {
    fontSize: theme.fontSizes.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginHorizontal: theme.spacing.lg,
    minWidth: 30,
    textAlign: 'center',
  },
  paymentMethodCard: {
    marginBottom: theme.spacing.lg,
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  paymentMethodInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  paymentMethodName: {
    fontSize: theme.fontSizes.md,
    fontWeight: '500',
    color: theme.colors.text,
  },
  paymentMethodExpiry: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.subtext,
    marginTop: 2,
  },
  defaultBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  defaultBadgeText: {
    fontSize: theme.fontSizes.xs,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  addPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  addPaymentText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.primary,
    fontWeight: '500',
    marginLeft: theme.spacing.sm,
  },
  telebirrButton: {
    marginTop: theme.spacing.md,
    backgroundColor: '#2E7D32', // TeleBirr green color
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  telebirrText: {
    fontSize: theme.fontSizes.md,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  summaryCard: {
    marginBottom: theme.spacing.xl,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  summaryLabel: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
  summaryValue: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.sm,
  },
  totalLabel: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  totalValue: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  bottomBar: {
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    padding: theme.spacing.lg,
  },
});