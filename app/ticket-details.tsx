import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, Clock, Share2, Trash2, ArmchairIcon } from 'lucide-react-native';
import theme from '@/constants/theme';
import useAppStore from '@/store/useAppStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Ticket } from '@/types';

export default function TicketDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  
  const { tickets, removeTicket } = useAppStore();

  useEffect(() => {
    if (params.ticketId) {
      const foundTicket = tickets.find(t => t.id === params.ticketId);
      if (foundTicket) {
        setTicket(foundTicket);
      }
    }
  }, [params, tickets]);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString([], { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTicketTypeLabel = (type: string) => {
    switch (type) {
      case 'single': return 'Single Ride';
      case 'return': return 'Return Ticket';
      case 'day': return 'Day Pass';
      case 'week': return 'Weekly Pass';
      case 'month': return 'Monthly Pass';
      default: return type;
    }
  };

  const getExpiryInfo = () => {
    if (!ticket) return { text: '', color: '' };
    
    const now = new Date();
    const validUntil = new Date(ticket.validUntil);
    const diffMs = validUntil.getTime() - now.getTime();
    const diffHrs = diffMs / (1000 * 60 * 60);
    
    if (diffHrs < 0) {
      return { text: 'Expired', color: theme.colors.error };
    } else if (diffHrs < 1) {
      return { text: 'Expires soon', color: theme.colors.warning };
    } else if (diffHrs < 24) {
      return { text: `Expires in ${Math.floor(diffHrs)}h`, color: theme.colors.warning };
    } else {
      return { text: `Valid until ${formatDate(ticket.validUntil)}`, color: theme.colors.success };
    }
  };

  const handleShare = () => {
    // In a real app, this would use the Share API
    console.log('Share ticket:', ticket?.id);
  };

  const handleDelete = () => {
    if (!ticket) return;
    
    Alert.alert(
      "Cancel Reservation",
      "Are you sure you want to cancel this seat reservation?",
      [
        {
          text: "Keep Reservation",
          style: "cancel"
        },
        { 
          text: "Cancel", 
          onPress: () => {
            removeTicket(ticket.id);
            router.back();
          },
          style: "destructive"
        }
      ]
    );
  };

  const expiryInfo = getExpiryInfo();

  if (!ticket) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading ticket details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        <Card style={styles.ticketCard}>
          <View style={styles.ticketHeader}>
            <View>
              <Text style={styles.ticketType}>{getTicketTypeLabel(ticket.type)}</Text>
              <Text style={styles.ticketPrice}>{ticket.price} ETB</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: expiryInfo.color }]}>
              <Text style={styles.statusText}>{ticket.isActive ? 'Active' : 'Inactive'}</Text>
            </View>
          </View>

          {ticket.seatNumber && (
            <View style={styles.seatInfo}>
              <View style={styles.seatIconContainer}>
                <ArmchairIcon size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.seatText}>
                Reserved Seat: <Text style={styles.seatNumber}>{ticket.seatNumber}</Text>
              </Text>
            </View>
          )}

          <View style={styles.qrContainer}>
            <Image 
              source={{ uri: ticket.qrCode }} 
              style={styles.qrCode}
              resizeMode="contain"
            />
            <Text style={styles.scanText}>Show this QR code to the driver when boarding</Text>
          </View>

          <View style={styles.ticketDetails}>
            <View style={styles.detailRow}>
              <Calendar size={20} color={theme.colors.primary} />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Valid From</Text>
                <Text style={styles.detailValue}>{formatDate(ticket.validFrom)}</Text>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <Clock size={20} color={expiryInfo.color} />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Valid Until</Text>
                <Text style={[styles.detailValue, { color: expiryInfo.color }]}>
                  {formatDate(ticket.validUntil)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <Button 
              title="Share Ticket" 
              onPress={handleShare}
              leftIcon={<Share2 size={18} color="#FFFFFF" />}
              style={styles.shareButton}
            />
            <Button 
              title="Cancel Reservation" 
              onPress={handleDelete}
              variant="outline"
              leftIcon={<Trash2 size={18} color={theme.colors.primary} />}
              style={styles.deleteButton}
            />
          </View>
        </Card>

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>Ticket Information</Text>
          <Text style={styles.infoText}>
            This ticket is valid for all public transportation services in Addis Ababa including buses and light rail.
          </Text>
          <Text style={styles.infoText}>
            Your seat is reserved and guaranteed. Show this ticket to the driver when boarding.
          </Text>
        </Card>

        <Card style={styles.termsCard}>
          <Text style={styles.termsTitle}>Terms & Conditions</Text>
          <Text style={styles.termsText}>
            • Seat reservations can be cancelled up to 30 minutes before departure
          </Text>
          <Text style={styles.termsText}>
            • Tickets are valid only for the specified time period
          </Text>
          <Text style={styles.termsText}>
            • Tickets cannot be transferred to another person
          </Text>
          <Text style={styles.termsText}>
            • You must be at the stop 5 minutes before departure time
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
  },
  scrollView: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  ticketCard: {
    marginBottom: theme.spacing.lg,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  ticketType: {
    fontSize: theme.fontSizes.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  ticketPrice: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.subtext,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontSize: theme.fontSizes.sm,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  seatInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.highlight,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  seatIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  seatText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
  seatNumber: {
    fontWeight: 'bold',
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing.lg,
  },
  qrCode: {
    width: 250,
    height: 250,
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.md,
  },
  scanText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.subtext,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  ticketDetails: {
    marginBottom: theme.spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  detailTextContainer: {
    marginLeft: theme.spacing.md,
  },
  detailLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.subtext,
  },
  detailValue: {
    fontSize: theme.fontSizes.md,
    fontWeight: '500',
    color: theme.colors.text,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shareButton: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  deleteButton: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  infoCard: {
    marginBottom: theme.spacing.lg,
  },
  infoTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  infoText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    lineHeight: 22,
  },
  termsCard: {
    marginBottom: theme.spacing.xl,
  },
  termsTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  termsText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    lineHeight: 22,
  },
});