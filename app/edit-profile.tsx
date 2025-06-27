import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { User } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import * as ImagePicker from 'expo-image-picker';
import { Calendar, MapPin, Pencil, User as UserIcon, ChevronLeft, ChevronRight, Camera, Mail, Phone, Edit2, Check } from "lucide-react-native";
import { Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import DateTimePicker from '@react-native-community/datetimepicker';
import Colors from "@/constants/colors";

type UserProfile = Partial<Pick<User, 'name' | 'email' | 'phoneNumber' | 'address' | 'dateOfBirth' | 'avatar'>>;

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState<UserProfile>({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || '',
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth) : undefined,
    avatar: user?.avatar || '',
  });
  
  const [profileImage, setProfileImage] = useState(user?.avatar || "");
  
  const updateProfile = async (data: UserProfile) => {
    // In a real app, this would be an API call to update the user's profile
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log('Profile updated:', data);
        // Update the user context with the new data
        // This is a simplified example - in a real app, you'd update the user in your auth context
        resolve();
      }, 1000);
    });
  };

  const handleChangePassword = () => {
    // In a real app, you would navigate to a password change screen
    // For now, we'll just show an alert
    Alert.alert("Change Password", "Password change functionality would be implemented here.");
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || selectedDate;
    setShowDatePicker(Platform.OS === 'ios');
    if (currentDate) {
      setSelectedDate(currentDate);
      setFormData({...formData, dateOfBirth: currentDate});
    }
  };

  const formatDate = (date?: Date): string => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const [isEditing, setIsEditing] = useState({
    name: false,
    email: false,
    phoneNumber: false,
    address: false,
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(user?.dateOfBirth ? new Date(user.dateOfBirth) : undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photo library to upload a profile picture.');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      // In a real app, you would upload the image to a storage service
      // and update the user's profile with the new image URL
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (formData.phoneNumber && !/^\+?[0-9]{10,15}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      // Only include the fields that are part of the UserProfile type
      const profileData: UserProfile = {
        name: formData.name || '',
        email: formData.email || '',
        phoneNumber: formData.phoneNumber || undefined,
        address: formData.address || undefined,
        dateOfBirth: formData.dateOfBirth,
        avatar: formData.avatar || undefined
      };
      
      await updateProfile(profileData);
      
      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderEditableField = (
    field: keyof UserProfile,
    label: string,
    icon: React.ReactNode,
    keyboardType: 'default' | 'email-address' | 'phone-pad' = 'default',
    isDateField = false
  ) => {
    return (
      <View style={styles.fieldContainer}>
        <View style={styles.fieldLabelContainer}>
          {icon}
          <Text style={styles.fieldLabel}>{label}</Text>
        </View>
        
        {field === 'dateOfBirth' ? (
          <TouchableOpacity 
            style={styles.inputContainer}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {formData.dateOfBirth ? formatDate(formData.dateOfBirth) : 'Select date of birth'}
            </Text>
            <Edit2 size={16} color={Colors.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.inputContainer}>
            {isEditing[field as keyof typeof isEditing] ? (
              <TextInput
                style={styles.input}
                value={formData[field] as string || ''}
                onChangeText={(text) => setFormData({...formData, [field]: text})}
                autoCapitalize={field === 'name' ? 'words' : 'none'}
                keyboardType={keyboardType}
                autoFocus
                onBlur={() => {
                  setIsEditing({...isEditing, [field]: false});
                  validateForm();
                }}
                onSubmitEditing={() => {
                  setIsEditing({...isEditing, [field]: false});
                  validateForm();
                }}
              />
            ) : (
              <Text 
                style={styles.inputText}
                onPress={() => {
                  setIsEditing({...isEditing, [field]: true});
                }}
              >
                {formData[field] || `Add ${label.toLowerCase()}`}
              </Text>
            )}
            
            {(field !== 'email') && (
              <TouchableOpacity 
                onPress={() => {
                  if (isEditing[field as keyof typeof isEditing]) {
                    setIsEditing({...isEditing, [field]: false});
                    validateForm();
                  } else {
                    setIsEditing({...isEditing, [field]: true});
                  }
                }}
                style={styles.editButton}
              >
                {isEditing[field as keyof typeof isEditing] ? (
                  <Check size={16} color={Colors.primary} />
                ) : (
                  <Edit2 size={16} color={Colors.primary} />
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {errors[field] && (
          <Text style={styles.errorText}>{errors[field]}</Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen 
        options={{
          title: "Edit Profile",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
              onPress={handleSave}
              disabled={isLoading}
            >
              <Text style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}>
                {isLoading ? 'Saving...' : 'Save'}
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
                uri: profileImage || `https://ui-avatars.com/api/?name=${formData.name || 'User'}`
              }}
              style={styles.avatar}
            />
            <TouchableOpacity 
              style={styles.cameraButton}
              onPress={pickImage}
            >
              <Camera size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={pickImage}>
            <Text style={styles.changePhotoText}>Change Profile Photo</Text>
          </TouchableOpacity>
        </View>
        
        {/* Form Fields */}
        <View style={styles.form}>
            
          {renderEditableField('name', 'Full Name', 
            <UserIcon size={20} color={Colors.primary} style={styles.fieldIcon} />
          )}
          
          {renderEditableField('email', 'Email', 
            <Mail size={20} color={Colors.primary} style={styles.fieldIcon} />, 
            'email-address'
          )}
          
          {renderEditableField('phoneNumber', 'Phone Number', 
            <Phone size={20} color={Colors.primary} style={styles.fieldIcon} />, 
            'phone-pad'
          )}
          
          {renderEditableField('address', 'Address', 
            <MapPin size={20} color={Colors.primary} style={styles.fieldIcon} />
          )}
          
          {renderEditableField('dateOfBirth', 'Date of Birth', 
            <Calendar size={20} color={Colors.primary} style={styles.fieldIcon} />
          )}
          
          </View>
          
          {showDatePicker && (
            <DateTimePicker
              value={formData.dateOfBirth || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setFormData({...formData, dateOfBirth: selectedDate});
                }
              }}
              maximumDate={new Date()}
            />
          )}
          
          {/* Change Password */}
          <TouchableOpacity 
            style={styles.changePasswordButton}
            onPress={handleChangePassword}
          >
            <Text style={styles.changePasswordText}>Change Password</Text>
            <ChevronRight size={20} color={Colors.primary} />
          </TouchableOpacity>
          
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
  },
  saveButton: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 16,
  },
  saveButtonDisabled: {
    opacity: 0.5,
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
    backgroundColor: Colors.border,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.background,
  },
  changePhotoText: {
    color: Colors.primary,
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
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: Colors.text,
    paddingRight: 8,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    paddingVertical: 16,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  editButton: {
    padding: 8,
    marginRight: -8,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 8,
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
