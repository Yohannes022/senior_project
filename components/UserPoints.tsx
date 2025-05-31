import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Award, ChevronRight } from "lucide-react-native";
import Colors from "@/constants/colors";
import { userProfile } from "@/constants/mockData";

type UserPointsProps = {
  onPress?: () => void;
};

export default function UserPoints({ onPress }: UserPointsProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Award size={24} color={Colors.primary} />
        </View>
        
        <View style={styles.pointsInfo}>
          <Text style={styles.pointsTitle}>Sheger Points</Text>
          <View style={styles.pointsRow}>
            <Text style={styles.pointsValue}>{userProfile.points}</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{userProfile.level}</Text>
            </View>
          </View>
        </View>
        
        <ChevronRight size={20} color={Colors.textLight} />
      </View>
      
      <Text style={styles.pointsMessage}>
        Earn 150 more points to reach Gold level
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight + "30",
    alignItems: "center",
    justifyContent: "center",
  },
  pointsInfo: {
    flex: 1,
    marginLeft: 12,
  },
  pointsTitle: {
    fontSize: 14,
    color: Colors.textLight,
  },
  pointsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  pointsValue: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  levelBadge: {
    backgroundColor: Colors.secondaryLight + "40",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  levelText: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.secondary,
  },
  pointsMessage: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 12,
  },
});
