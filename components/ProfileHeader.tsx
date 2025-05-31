import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Settings } from "lucide-react-native";
import Colors from "@/constants/colors";
import { userProfile } from "@/constants/mockData";

type ProfileHeaderProps = {
  onSettingsPress?: () => void;
};

export default function ProfileHeader({ onSettingsPress }: ProfileHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.profileInfo}>
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop" }}
          style={styles.profileImage}
        />
        
        <View style={styles.nameContainer}>
          <Text style={styles.nameText}>{userProfile.name}</Text>
          <Text style={styles.phoneText}>{userProfile.phone}</Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.settingsButton} onPress={onSettingsPress}>
        <Settings size={22} color={Colors.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  nameContainer: {
    marginLeft: 12,
  },
  nameText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  phoneText: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 2,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
});
