import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/types/database";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Calendar, MapPin, Pencil, User as UserIcon, ChevronLeft, ChevronRight, Camera, Mail, Phone, Edit2, Check } from "lucide-react-native";
import { Image, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import DateTimePicker from '@react-native-community/datetimepicker';
import 'react-native-get-random-values'; // Required for Android
import Colors from "@/constants/colors";

// Extend the User type with additional fields for the form
type UserProfile = Omit<User, 'phone' | 'profilePicture' | 'dateOfBirth'> & {
  phone?: string;
  address?: string;
  profilePicture?: string | null;
  dateOfBirth?: string | null;
  isPhoneVerified: boolean; // Required from User interface
  [key: string]: any; // For dynamic access
};

// Define styles before the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  // Header save button
  saveButtonDisabled: {
    opacity: 0.5,
  },
  // Main save button container
  saveButtonContainer: {
    padding: 20,
    paddingBottom: 40, // Extra padding at the bottom for better reachability
  },
  // Main save button
  saveButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    marginLeft: 16,
    padding: 4,
  },
  profilePhotoContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.inputBackground,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  changePhotoText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  form: {
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldIcon: {
    marginRight: 8,
  },
  fieldLabel: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    padding: 0,
    height: '100%',
  },
  inputIcon: {
    marginRight: 12,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    paddingVertical: 12,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 8,
    fontSize: 16,
    color: Colors.text,
    paddingVertical: 12,
  },
  dateContainer: {
    width: '100%',
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    paddingVertical: 12,
  },
  placeholderText: {
    color: Colors.textLight,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  clearButtonText: {
    color: Colors.textLight,
    fontSize: 16,
    lineHeight: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  modalButton: {
    fontSize: 16,
    color: Colors.textLight,
    padding: 8,
  },
  modalConfirm: {
    color: Colors.primary,
    fontWeight: '600',
  },
  inputError: {
    borderColor: Colors.danger,
  },
  editButton: {
    padding: 8,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 24,
    marginBottom: 16,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemText: {
    flex: 1,
    marginLeft: 12,
  },
  menuItemTitle: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 13,
    color: Colors.textLight,
  },
  menuItemIcon: {
    width: 24,
    alignItems: 'center',
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.inputBackground,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  levelLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  levelBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  levelText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  pointsBadge: {
    backgroundColor: Colors.inputBackground,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  pointsBadgeText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  viewAllButton: {
    alignItems: 'center',
    padding: 8,
    marginTop: 8,
  },
  viewAllText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  noSavedLocations: {
    textAlign: 'center',
    color: Colors.textLight,
    marginVertical: 16,
    fontStyle: 'italic',
  },
  signOutButton: {
    backgroundColor: Colors.inputBackground,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  signOutText: {
    color: Colors.danger,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerText: {
    color: Colors.textLight,
    fontSize: 12,
  },
  versionText: {
    color: Colors.textLight,
    fontSize: 12,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  emptyStateContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    color: Colors.textLight,
    fontSize: 14,
    textAlign: 'center',
  },
  changePasswordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  changePasswordText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  deleteAccountButton: {
    marginTop: 32,
    marginBottom: 40,
    alignItems: 'center',
  },
  deleteAccountText: {
    color: Colors.danger,
    fontWeight: '500',
  },
});

const EditProfileScreen: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Initialize form state with user data
  const [formData, setFormData] = useState<UserProfile>({
    id: user?.id || '',
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    profilePicture: user?.profilePicture || '',
    isPhoneVerified: user?.isPhoneVerified || false,
    createdAt: user?.createdAt || new Date().toISOString(),
    updatedAt: user?.updatedAt || new Date().toISOString(),
  });
  
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState<boolean>(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());
  
  type EditState = {
    name: boolean;
    email: boolean;
    phone: boolean;
    dateOfBirth: boolean;
  };
  
  const [isEditing, setIsEditing] = useState<EditState>({
    name: false,
    email: false,
    phone: false,
    dateOfBirth: false,
  });

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      const userData: UserProfile = {
        id: user.id,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        profilePicture: user.profilePicture || '',
        isPhoneVerified: user.isPhoneVerified || false,
        createdAt: user.createdAt || new Date().toISOString(),
        updatedAt: user.updatedAt || new Date().toISOString(),
      };
      setFormData(userData);
      setIsLoading(false);
    }
  }, [user]);

  const handleChangePassword = () => {
    // In a real app, you would navigate to a password change screen
    // For now, we'll just show an alert
    Alert.alert("Change Password", "Password change functionality would be implemented here.");
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setTempDate(selectedDate);
      // On Android, we confirm the date immediately
      if (Platform.OS === 'android') {
        confirmDate(selectedDate);
      }
    }
  };

  const confirmDate = (date: Date) => {
    setFormData(prev => ({
      ...prev,
      dateOfBirth: date.toISOString(),
    }));
    setShowDatePicker(false);
    setIsDatePickerVisible(false);
  };

  const showDatepicker = () => {
    setTempDate(formData.dateOfBirth ? new Date(formData.dateOfBirth) : new Date());
    if (Platform.OS === 'ios') {
      setIsDatePickerVisible(true);
    } else {
      setShowDatePicker(true);
    }
  };

  const handleDateConfirm = () => {
    confirmDate(tempDate);
  };

  const handleDateCancel = () => {
    setIsDatePickerVisible(false);
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Select date of birth';
    
    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  const pickImage = async () => {
    try {
      // Request permission to access the media library
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please allow access to your photo library to upload a profile picture.');
        return;
      }
      
      // Launch the image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // For local storage, we'll just use the URI directly
        // In a real app, you might want to upload this to a server
        const imageUri = result.assets[0].uri;
        
        // If you want to save the image to the app's document directory:
        // const fileName = imageUri.split('/').pop();
        // const destPath = `${FileSystem.documentDirectory}${fileName}`;
        // await FileSystem.copyAsync({ from: imageUri, to: destPath });
        
        // Update the form data with the new image URI
        setFormData(prev => ({
          ...prev,
          profilePicture: imageUri, // or destPath if saving to document directory
        }));
      }
      
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!formData.name?.trim() || !formData.email?.trim()) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        Alert.alert('Error', 'Please enter a valid email address');
        return;
      }

      setIsSaving(true);
      
      // Prepare the data to update
      const updatedData: Partial<User> = {
        id: formData.id,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone?.trim() || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        profilePicture: formData.profilePicture || undefined,
        updatedAt: new Date().toISOString(),
        // Include any other required fields from the User type
        ...(user?.createdAt ? { createdAt: user.createdAt } : {})
      };
      
      if (updateProfile) {
        const success = await updateProfile(updatedData);
        
        if (success) {
          // Show success message
          Alert.alert('Success', 'Profile updated successfully');
          
          // Go back to previous screen after a short delay
          setTimeout(() => {
            router.back();
          }, 1500);
        } else {
          throw new Error('Failed to update profile');
        }
      } else {
        throw new Error('Update function not available');
      }
      
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  type FieldType = 'name' | 'email' | 'phone' | 'dateOfBirth';
  const renderEditableField = (
    field: keyof typeof isEditing,
    label: string,
    icon: React.ReactNode,
    keyboardType: 'default' | 'email-address' | 'numeric' | 'phone-pad' = 'default',
    multiline = false,
  ) => {
    if (field === 'dateOfBirth') {
      return (
        <View style={styles.formGroup}>
          <Text style={styles.label}>{label}</Text>
          <View style={styles.dateContainer}>
            <TouchableOpacity 
              style={[styles.inputContainer, errors[field] && styles.inputError]}
              onPress={showDatepicker}
            >
              <Text style={[styles.dateText, !formData[field] && styles.placeholderText]}>
                {formData[field] ? formatDate(formData[field]) : 'Select date of birth'}
              </Text>
              {formData[field] && (
                <TouchableOpacity 
                  onPress={(e) => {
                    e.stopPropagation();
                    setFormData(prev => ({ ...prev, [field]: '' }));
                  }}
                  style={styles.clearButton}
                >
                  <Text style={styles.clearButtonText}>×</Text>
                </TouchableOpacity>
              )}
              <View style={styles.editButton}>
                <Calendar size={16} color={Colors.primary} />
              </View>
            </TouchableOpacity>

            {/* Android Date Picker */}
            {showDatePicker && Platform.OS === 'android' && (
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}

            {/* iOS Date Picker */}
            {isDatePickerVisible && Platform.OS === 'ios' && (
              <Modal
                transparent={true}
                animationType="slide"
                visible={isDatePickerVisible}
                onRequestClose={() => setIsDatePickerVisible(false)}
              >
                <View style={styles.modalContainer}>
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <TouchableOpacity onPress={() => setIsDatePickerVisible(false)}>
                        <Text style={styles.modalButton}>Cancel</Text>
                      </TouchableOpacity>
                      <Text style={styles.modalTitle}>Select Date of Birth</Text>
                      <TouchableOpacity onPress={handleDateConfirm}>
                        <Text style={[styles.modalButton, styles.modalConfirm]}>Done</Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={tempDate}
                      mode="date"
                      display="spinner"
                      onChange={handleDateChange}
                      maximumDate={new Date()}
                    />
                  </View>
                </View>
              </Modal>
            )}
            {errors[field] && (
              <Text style={styles.errorText}>{errors[field]}</Text>
            )}
          </View>
        </View>
      );
    }

    return (
      <View style={styles.formGroup}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.inputContainer}>
          {icon}
          {isEditing[field] ? (
            <TextInput
              style={[styles.input, multiline && styles.multilineInput]}
              value={formData[field] as string}
              onChangeText={(text) => setFormData(prev => ({ ...prev, [field]: text }))}
              onBlur={() => setIsEditing(prev => ({ ...prev, [field]: false }))}
              keyboardType={keyboardType}
              autoCapitalize={field === 'name' ? 'words' : 'none'}
              autoCorrect={field !== 'name'}
              multiline={multiline}
              autoFocus
            />
          ) : (
            <TouchableOpacity
              style={styles.input}
              onPress={() => setIsEditing(prev => ({ ...prev, [field]: true }))}
            >
              <Text style={[styles.inputText, !formData[field] && styles.placeholderText]}>
                {formData[field] || `Enter ${label.toLowerCase()}`}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => setIsEditing(prev => ({ ...prev, [field]: !prev[field] }))}
            style={styles.editButton}
          >
            {isEditing[field] ? (
              <Check size={18} color={Colors.primary} />
            ) : (
              <Pencil size={16} color={Colors.primary} />
            )}
          </TouchableOpacity>
        </View>
        {errors[field] && (
          <Text style={styles.errorText}>{errors[field]}</Text>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Edit Profile',
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600',
          },
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.primary} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
              onPress={handleSave}
              disabled={isSaving}
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.scrollView}>
        {/* Profile Photo */}
        <View style={styles.profilePhotoContainer}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: formData.profilePicture || 'https://via.placeholder.com/150',
                cache: 'force-cache'
              }}
              style={styles.avatar}
            />
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={pickImage}
            >
              <Camera size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={pickImage}>
            <Text style={styles.changePhotoText}>Change Profile Photo</Text>
          </TouchableOpacity>
        </View>
        
        {/* Form Fields */}
        <View style={styles.form}>
          {renderEditableField(
            'name',
            'Full Name',
            <UserIcon size={20} color={Colors.textLight} style={styles.inputIcon} />
          )}

          {renderEditableField(
            'email',
            'Email',
            <Mail size={20} color={Colors.textLight} style={styles.inputIcon} />,
            'email-address'
          )}

          {renderEditableField(
            'phone',
            'Phone Number',
            <Phone size={20} color={Colors.textLight} style={styles.inputIcon} />,
            'phone-pad'
          )}

          {renderEditableField(
            'dateOfBirth',
            'Date of Birth',
            <Calendar size={20} color={Colors.textLight} style={styles.inputIcon} />
          )}

          {/* Change Password Button */}
          <TouchableOpacity
            style={styles.changePasswordButton}
            onPress={handleChangePassword}
          >
            <Text style={styles.changePasswordText}>Change Password</Text>
          </TouchableOpacity>

          {/* Delete Account Button */}
          <TouchableOpacity 
            style={styles.deleteAccountButton}
            onPress={() => {
              Alert.alert(
                "Delete Account",
                "Are you sure you want to delete your account? This action cannot be undone.",
                [
                  { text: "Cancel", style: "cancel" },
                  { 
                    text: "Delete", 
                    style: "destructive",
                    onPress: () => {
                      // Handle account deletion
                      console.log("Account deletion requested");
                    } 
                  }
                ]
              );
            }}
          >
            <Text style={styles.deleteAccountText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
        
        {/* Save Button */}
        <View style={styles.saveButtonContainer}>
          <TouchableOpacity 
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default EditProfileScreen;
