import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, Linking, Alert, TextInput, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { ChevronLeft, Phone, Plus, User, X, Search, Star, Edit2, Trash2, AlertTriangle } from "lucide-react-native";
import * as Contacts from 'expo-contacts';
import Colors from "@/constants/colors";

interface EmergencyContact {
  id: string;
  name: string;
  phoneNumber: string;
  isFavorite: boolean;
  photoUri?: string;
}

export default function EmergencyContactsScreen() {
  const router = useRouter();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<EmergencyContact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Sample emergency contacts (in a real app, these would be stored in a database)
  const defaultEmergencyContacts: EmergencyContact[] = [
    {
      id: '1',
      name: 'Emergency Services',
      phoneNumber: '911',
      isFavorite: true,
    },
    {
      id: '2',
      name: 'Police',
      phoneNumber: '991',
      isFavorite: true,
    },
    {
      id: '3',
      name: 'Ambulance',
      phoneNumber: '907',
      isFavorite: true,
    },
    {
      id: '4',
      name: 'Fire Department',
      phoneNumber: '939',
      isFavorite: true,
    },
  ];

  // Load contacts on component mount
  useEffect(() => {
    loadContacts();
  }, []);

  // Filter contacts when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.phoneNumber.includes(searchQuery)
      );
      setFilteredContacts(filtered);
    }
  }, [searchQuery, contacts]);

  const loadContacts = async () => {
    try {
      // First, load default emergency contacts
      setContacts(defaultEmergencyContacts);
      setFilteredContacts(defaultEmergencyContacts);
      
      // Request permission to access device contacts
      const { status } = await Contacts.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [
            Contacts.Fields.Name,
            Contacts.Fields.PhoneNumbers,
            Contacts.Fields.Image,
          ],
        });
        
        // Format device contacts and add to the list
        const deviceContacts: EmergencyContact[] = [];
        
        for (const contact of data) {
          if (!contact.phoneNumbers?.length || !contact.phoneNumbers[0]?.number || !contact.id) {
            continue;
          }
          
          const phoneNumber = contact.phoneNumbers[0].number;
          
          deviceContacts.push({
            id: contact.id,
            name: contact.name || 'Unknown',
            phoneNumber,
            isFavorite: false,
            photoUri: contact.image?.uri,
          });
        }
        

        // Combine with default contacts, avoiding duplicates
        const allContacts = [
          ...defaultEmergencyContacts,
          ...deviceContacts.filter(deviceContact => 
            !defaultEmergencyContacts.some(defaultContact => 
              defaultContact.phoneNumber === deviceContact.phoneNumber
            )
          ),
        ];
        
        setContacts(allContacts);
        setFilteredContacts(allContacts);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      Alert.alert('Error', 'Failed to load contacts. Please check your permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const toggleFavorite = (id: string) => {
    const updatedContacts = contacts.map(contact =>
      contact.id === id 
        ? { ...contact, isFavorite: !contact.isFavorite } 
        : contact
    );
    
    // Sort so favorites appear first
    const sortedContacts = [...updatedContacts].sort((a, b) => 
      (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0)
    );
    
    setContacts(sortedContacts);
  };

  const deleteContact = (id: string) => {
    // Don't allow deleting default emergency contacts
    if (defaultEmergencyContacts.some(contact => contact.id === id)) {
      Alert.alert('Cannot Delete', 'Default emergency contacts cannot be deleted.');
      return;
    }
    
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to remove this contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedContacts = contacts.filter(contact => contact.id !== id);
            setContacts(updatedContacts);
          },
        },
      ]
    );
  };

  const renderContactItem = ({ item }: { item: EmergencyContact }) => (
    <View style={[styles.contactItem, item.isFavorite && styles.favoriteContact]}>
      <TouchableOpacity 
        style={styles.contactInfo}
        onPress={() => handleCall(item.phoneNumber)}
        activeOpacity={0.7}
      >
        {item.photoUri ? (
          <Image source={{ uri: item.photoUri }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {item.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </Text>
          </View>
        )}
        
        <View style={styles.contactDetails}>
          <View style={styles.contactHeader}>
            <Text style={styles.contactName} numberOfLines={1}>
              {item.name}
              {defaultEmergencyContacts.some(c => c.id === item.id) && (
                <Text style={styles.badge}> Default</Text>
              )}
            </Text>
            <Text style={styles.contactNumber}>{item.phoneNumber}</Text>
          </View>
        </View>
      </TouchableOpacity>
      
      <View style={styles.contactActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => toggleFavorite(item.id)}
        >
          <Star 
            size={20} 
            color={item.isFavorite ? Colors.warning : Colors.textLight} 
            fill={item.isFavorite ? Colors.warning : 'transparent'}
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleCall(item.phoneNumber)}
        >
          <Phone size={20} color={Colors.primary} />
        </TouchableOpacity>
        
        {!defaultEmergencyContacts.some(c => c.id === item.id) && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => deleteContact(item.id)}
          >
            <Trash2 size={20} color={Colors.danger} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <AlertTriangle size={48} color={Colors.textLight} style={styles.emptyIcon} />
      <Text style={styles.emptyTitle}>No Emergency Contacts</Text>
      <Text style={styles.emptyText}>
        {hasPermission === false
          ? 'Please enable contacts permission to add emergency contacts.'
          : 'Add emergency contacts to quickly reach out in case of an emergency.'}
      </Text>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => {
          // In a real app, this would open a contact picker or form
          Alert.alert('Add Contact', 'Feature coming soon!');
        }}
      >
        <Plus size={20} color="#fff" />
        <Text style={styles.addButtonText}>Add Emergency Contact</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen 
        options={{
          title: "Emergency Contacts",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={Colors.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts..."
            placeholderTextColor={Colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <X size={18} color={Colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* Emergency Banner */}
      <View style={styles.emergencyBanner}>
        <AlertTriangle size={20} color="#fff" style={styles.emergencyIcon} />
        <Text style={styles.emergencyText}>
          In case of emergency, tap on a contact to call immediately
        </Text>
      </View>
      
      {/* Contacts List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading contacts...</Text>
        </View>
      ) : filteredContacts.length > 0 ? (
        <FlatList
          data={filteredContacts}
          renderItem={renderContactItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.contactsList}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>
              {searchQuery ? 'Search Results' : 'Emergency Contacts'}
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.emptySearch}>
              <Text style={styles.emptySearchText}>No contacts found</Text>
            </View>
          }
        />
      ) : (
        renderEmptyState()
      )}
      
      {/* Add Button */}
      {!isLoading && filteredContacts.length > 0 && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => {
            // In a real app, this would open a contact picker or form
            Alert.alert('Add Contact', 'Feature coming soon!');
          }}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: Colors.background,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
    opacity: 0.7,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: Colors.text,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.danger,
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  emergencyIcon: {
    marginRight: 8,
  },
  emergencyText: {
    flex: 1,
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactsList: {
    padding: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  favoriteContact: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  contactInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.border,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(41, 98, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
  },
  contactDetails: {
    flex: 1,
  },
  contactHeader: {
    flexDirection: 'column',
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  contactNumber: {
    fontSize: 14,
    color: Colors.textLight,
  },
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  badge: {
    fontSize: 10,
    backgroundColor: 'rgba(41, 98, 255, 0.1)',
    color: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIcon: {
    opacity: 0.5,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptySearch: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySearchText: {
    color: Colors.textLight,
    fontSize: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});
