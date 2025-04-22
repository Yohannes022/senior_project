import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Ticket, Clock, Calendar } from 'lucide-react-native';
import theme from '@/constants/theme';
import useAppStore from '@/store/useAppStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {TicketCard} from '@/components/ui/TicketCard';

export default function TicketsScreen() {
  const router = useRouter();
  const { tickets } = useAppStore();
  const [activeTab, setActiveTab] = useState<'active' | 'expired'>('active');

  const activeTickets = tickets.filter(ticket => {
    const now = new Date();
    const validUntil = new Date(ticket.validUntil);
    return validUntil > now && ticket.isActive;
  });

  const expiredTickets = tickets.filter(ticket => {
    const now = new Date();
    const validUntil = new Date(ticket.validUntil);
    return validUntil <= now || !ticket.isActive;
  });

  const handleBuyTicket = () => {
    router.push('/payment');
  };

  const handleTicketPress = (ticketId: string) => {
    router.push({
      pathname: '/ticket-details',
      params: { ticketId }
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Tickets</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleBuyTicket}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Clock size={18} color={activeTab === 'active' ? theme.colors.primary : theme.colors.subtext} />
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
            Active ({activeTickets.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'expired' && styles.activeTab]}
          onPress={() => setActiveTab('expired')}
        >
          <Calendar size={18} color={activeTab === 'expired' ? theme.colors.primary : theme.colors.subtext} />
          <Text style={[styles.tabText, activeTab === 'expired' && styles.activeTabText]}>
            Expired ({expiredTickets.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'active' ? (
          activeTickets.length > 0 ? (
            activeTickets.map(ticket => (
              <TouchableOpacity 
                key={ticket.id}
                onPress={() => handleTicketPress(ticket.id)}
                activeOpacity={0.8}
              >
                <TicketCard ticket={ticket} />
              </TouchableOpacity>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyContent}>
                <Ticket size={48} color={theme.colors.subtext} />
                <Text style={styles.emptyTitle}>No Active Tickets</Text>
                <Text style={styles.emptyText}>
                  You don't have any active tickets. Purchase a ticket to get started.
                </Text>
                <Button 
                  title="Buy Ticket" 
                  onPress={handleBuyTicket}
                  style={styles.buyButton}
                />
              </View>
            </Card>
          )
        ) : (
          expiredTickets.length > 0 ? (
            expiredTickets.map(ticket => (
              <TouchableOpacity 
                key={ticket.id}
                onPress={() => handleTicketPress(ticket.id)}
                activeOpacity={0.8}
              >
                <TicketCard ticket={ticket} />
              </TouchableOpacity>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyContent}>
                <Calendar size={48} color={theme.colors.subtext} />
                <Text style={styles.emptyTitle}>No Expired Tickets</Text>
                <Text style={styles.emptyText}>
                  You don't have any expired tickets yet.
                </Text>
              </View>
            </Card>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSizes.xxl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: theme.fontSizes.md,
    fontWeight: '500',
    color: theme.colors.subtext,
    marginLeft: theme.spacing.xs,
  },
  activeTabText: {
    color: theme.colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  emptyCard: {
    marginTop: theme.spacing.xl,
  },
  emptyContent: {
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  emptyText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.subtext,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  buyButton: {
    minWidth: 150,
  },
});