import React from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Linking, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { ChevronLeft, ChevronRight, HelpCircle, MessageSquare, Phone, Mail, AlertTriangle, Clock, MapPin, Info } from "lucide-react-native";
import Colors from "@/constants/colors";
import { Link } from 'expo-router';

const faqs = [
  {
    id: '1',
    question: 'How do I book a ride?',
    answer: 'To book a ride, open the app, enter your pickup and drop-off locations, select your preferred vehicle type, and tap "Book Now".',
  },
  {
    id: '2',
    question: 'What payment methods are accepted?',
    answer: 'We accept credit/debit cards, mobile money, and in-app wallet payments. Cash payments are also available for some services.',
  },
  {
    id: '3',
    question: 'How do I cancel a ride?',
    answer: 'Open the app, go to your active rides, select the ride you want to cancel, and tap "Cancel Ride". Note that cancellation fees may apply.',
  },
  {
    id: '4',
    question: 'How do I contact my driver?',
    answer: 'Once your ride is confirmed, you can call or message your driver directly through the app using the contact options provided.',
  },
  {
    id: '5',
    question: 'What should I do if I lost an item?',
    answer: 'Contact our support team immediately with details of your lost item and ride information. We\'ll assist you in contacting the driver.',
  },
];

const helpTopics = [
  {
    id: '1',
    title: 'Getting Started',
    description: 'Learn how to create an account and book your first ride',
    icon: '🚗',
  },
  {
    id: '2',
    title: 'Account & Payment',
    description: 'Manage your account settings and payment methods',
    icon: '💳',
  },
  {
    id: '3',
    title: 'Ride Issues',
    description: 'Report problems with your ride or driver',
    icon: '⚠️',
  },
  {
    id: '4',
    title: 'Safety & Emergency',
    description: 'Important safety information and emergency contacts',
    icon: '🛡️',
  },
];

const supportContacts = [
  {
    id: '1',
    type: 'Chat',
    description: 'Chat with our support team',
    icon: <MessageSquare size={24} color={Colors.primary} />,
    action: () => console.log('Open chat'),
  },
  {
    id: '2',
    type: 'Call',
    description: 'Call our support line',
    icon: <Phone size={24} color={Colors.primary} />,
    action: () => Linking.openURL('tel:+251911123456'),
  },
  {
    id: '3',
    type: 'Email',
    description: 'Send us an email',
    icon: <Mail size={24} color={Colors.primary} />,
    action: () => Linking.openURL('mailto:support@shegertransit.com'),
  },
];

export default function HelpScreen() {
  const router = useRouter();
  const [expandedFaq, setExpandedFaq] = React.useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const renderFaqItem = (faq: { id: string; question: string; answer: string }) => (
    <TouchableOpacity
      key={faq.id}
      style={styles.faqItem}
      onPress={() => toggleFaq(faq.id)}
      activeOpacity={0.8}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{faq.question}</Text>
        <ChevronRight 
          size={20} 
          color={Colors.textLight} 
          style={[
            styles.chevron,
            expandedFaq === faq.id && styles.chevronExpanded
          ]} 
        />
      </View>
      {expandedFaq === faq.id && (
        <View style={styles.faqAnswerContainer}>
          <Text style={styles.faqAnswer}>{faq.answer}</Text>
          {faq.id === '5' && (
            <TouchableOpacity 
              style={styles.reportButton}
              onPress={() => router.push('/report-lost-item' as never)}
            >
              <Text style={styles.reportButtonText}>Report Lost Item</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen 
        options={{
          title: "Help & Support",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <HelpCircle size={32} color={Colors.primary} />
          </View>
          <Text style={styles.headerTitle}>How can we help you?</Text>
          <Text style={styles.headerSubtitle}>
            Find answers to common questions or contact our support team
          </Text>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search help articles..."
            placeholderTextColor={Colors.textLight}
          />
        </View>
        
        {/* Emergency Banner */}
        <TouchableOpacity 
          style={styles.emergencyBanner}
          onPress={() => router.push('/emergency' as never)}
        >
          <AlertTriangle size={20} color={Colors.danger} />
          <Text style={styles.emergencyText}>Emergency Contacts</Text>
          <ChevronRight size={20} color={Colors.danger} />
        </TouchableOpacity>
        
        {/* Help Topics */}
        <Text style={styles.sectionTitle}>Help Topics</Text>
        <View style={styles.helpTopics}>
          {helpTopics.map((topic) => (
            <TouchableOpacity 
              key={topic.id} 
              style={styles.helpTopicCard}
              onPress={() => console.log('Navigate to topic:', topic.id)}
            >
              <Text style={styles.topicIcon}>{topic.icon}</Text>
              <Text style={styles.topicTitle}>{topic.title}</Text>
              <Text style={styles.topicDescription} numberOfLines={2}>
                {topic.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* FAQs */}
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <View style={styles.faqContainer}>
          {faqs.map(renderFaqItem)}
        </View>
        
        {/* Support Contacts */}
        <Text style={styles.sectionTitle}>Contact Support</Text>
        <View style={styles.contactContainer}>
          {supportContacts.map((contact) => (
            <TouchableOpacity
              key={contact.id}
              style={styles.contactCard}
              onPress={contact.action}
            >
              <View style={styles.contactIcon}>{contact.icon}</View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactType}>{contact.type}</Text>
                <Text style={styles.contactDescription}>{contact.description}</Text>
              </View>
              <ChevronRight size={20} color={Colors.textLight} />
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Business Hours */}
        <View style={styles.businessHours}>
          <View style={styles.businessHoursHeader}>
            <Clock size={20} color={Colors.primary} />
            <Text style={styles.businessHoursTitle}>Business Hours</Text>
          </View>
          <View style={styles.hoursRow}>
            <Text style={styles.day}>Monday - Friday</Text>
            <Text style={styles.hours}>8:00 AM - 10:00 PM</Text>
          </View>
          <View style={styles.hoursRow}>
            <Text style={styles.day}>Saturday - Sunday</Text>
            <Text style={styles.hours}>9:00 AM - 8:00 PM</Text>
          </View>
        </View>
        
        {/* Visit Us */}
        <TouchableOpacity 
          style={styles.visitUs}
          onPress={() => {
            // Open maps with office location
            const address = 'Bole Road, Addis Ababa, Ethiopia';
            const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
            Linking.openURL(url);
          }}
        >
          <View style={styles.visitUsIcon}>
            <MapPin size={20} color={Colors.primary} />
          </View>
          <View style={styles.visitUsInfo}>
            <Text style={styles.visitUsTitle}>Visit Our Office</Text>
            <Text style={styles.visitUsAddress}>
              Bole Road, Addis Ababa, Ethiopia
            </Text>
          </View>
          <ChevronRight size={20} color={Colors.textLight} />
        </TouchableOpacity>
        
        {/* App Info */}
        <View style={styles.appInfo}>
          <Image 
            source={require("@/assets/images/icon.png")}
            style={styles.appLogo}
          />
          <Text style={styles.appName}>Sheger Transit+</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appRights}>© 2025 Sheger Transit. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(41, 98, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    maxWidth: 300,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
  },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  emergencyText: {
    flex: 1,
    color: Colors.danger,
    fontWeight: '600',
    marginLeft: 12,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  helpTopics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 24,
  },
  helpTopicCard: {
    width: '48%',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    margin: 4,
    marginBottom: 12,
  },
  topicIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  topicDescription: {
    fontSize: 12,
    color: Colors.textLight,
    lineHeight: 16,
  },
  faqContainer: {
    marginBottom: 24,
  },
  faqItem: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500',
    marginRight: 8,
  },
  chevron: {
    transform: [{ rotate: '90deg' }],
  },
  chevronExpanded: {
    transform: [{ rotate: '270deg' }],
  },
  faqAnswerContainer: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  faqAnswer: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 22,
  },
  reportButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  reportButtonText: {
    color: Colors.primary,
    fontWeight: '500',
    fontSize: 14,
  },
  contactContainer: {
    marginBottom: 24,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(41, 98, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactType: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  contactDescription: {
    fontSize: 12,
    color: Colors.textLight,
  },
  businessHours: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  businessHoursHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  businessHoursTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  day: {
    fontSize: 14,
    color: Colors.textLight,
  },
  hours: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  visitUs: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  visitUsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(41, 98, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  visitUsInfo: {
    flex: 1,
  },
  visitUsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  visitUsAddress: {
    fontSize: 12,
    color: Colors.textLight,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 40,
  },
  appLogo: {
    width: 60,
    height: 60,
    marginBottom: 12,
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 8,
  },
  appRights: {
    fontSize: 12,
    color: Colors.textLight,
  },
});
