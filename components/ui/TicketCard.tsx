import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ticket } from '@/types';
import theme from '@/constants/theme';
import Card from './Card';
import { Calendar, Clock, ArmchairIcon } from 'lucide-react-native';

interface TicketCardProps {
  ticket: Ticket;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
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

  const expiryInfo = getExpiryInfo();

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.typeContainer}>
          <Text style={styles.type}>{getTicketTypeLabel(ticket.type)}</Text>
          <Text style={styles.price}>{ticket.price} ETB</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: expiryInfo.color }]}>
          <Text style={styles.statusText}>{ticket.isActive ? 'Active' : 'Inactive'}</Text>
        </View>
      </View>

      <View style={styles.qrContainer}>
        <Image 
          source={{ uri: ticket.qrCode }} 
          style={styles.qrCode}
          resizeMode="contain"
        />
      </View>

      <View style={styles.seatInfo}>
        <View style={styles.seatIconContainer}>
          <ArmchairIcon size={20} color="#FFFFFF" />
        </View>
        <Text style={styles.seatText}>
          Reserved Seat: <Text style={styles.seatNumber}>{ticket.seatNumber || 'Not assigned'}</Text>
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.infoRow}>
          <Calendar size={16} color={theme.colors.subtext} />
          <Text style={styles.infoText}>Valid from: {formatDate(ticket.validFrom)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Clock size={16} color={expiryInfo.color} />
          <Text style={[styles.infoText, { color: expiryInfo.color }]}>{expiryInfo.text}</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  typeContainer: {
    flex: 1,
  },
  type: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  price: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.subtext,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontSize: theme.fontSizes.xs,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing.md,
  },
  qrCode: {
    width: 200,
    height: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.sm,
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
  footer: {
    marginTop: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  infoText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.subtext,
    marginLeft: theme.spacing.xs,
  },
});