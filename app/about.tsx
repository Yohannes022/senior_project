import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  Globe,
  MessageSquare,
  Star,
  User,
  Shield,
  FileText,
  HelpCircle,
  Phone,
  MapPin,
  Clock,
} from "lucide-react-native";
import * as WebBrowser from "expo-web-browser";
import FirestoreTest from "@/components/FirestoreTest";
import * as Application from "expo-application";
import Constants from "expo-constants";
import Colors from "@/constants/colors";

const APP_VERSION = "1.0.0";
const BUILD_NUMBER = "1";

export default function AboutScreen() {
  const router = useRouter();

  const openExternalLink = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url, {
        toolbarColor: Colors.primary,
        controlsColor: "#fff",
      });
    } catch (error) {
      console.error("Error opening link:", error);
    }
  };

  const openEmail = () => {
    Linking.openURL("mailto:contact@shegertransit.com");
  };

  const openPhone = () => {
    Linking.openURL("tel:+251911123456");
  };

  const openMap = () => {
    const address = "Bole Road, Addis Ababa, Ethiopia";
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(address)}`,
      android: `geo:0,0?q=${encodeURIComponent(address)}`,
    });

    if (url) {
      Linking.openURL(url);
    } else {
      // Fallback for web or other platforms
      openExternalLink(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          address
        )}`
      );
    }
  };

  const aboutItems = [
    {
      id: "1",
      title: "Rate Us",
      description: "Love our app? Leave us a rating",
      icon: <Star size={24} color={Colors.primary} />,
      onPress: () => {
        // Platform-specific app store links
        const url = Platform.select({
          ios: "https://apps.apple.com/app/idYOUR_APP_ID",
          android: "market://details?id=com.shegertransit.app",
          default:
            "https://play.google.com/store/apps/details?id=com.shegertransit.app",
        });
        if (url) {
          Linking.openURL(url);
        }
      },
    },
    {
      id: "2",
      title: "Terms of Service",
      description: "Read our terms and conditions",
      icon: <FileText size={24} color={Colors.primary} />,
      onPress: () => openExternalLink("https://shegertransit.com/terms"),
    },
    {
      id: "3",
      title: "Privacy Policy",
      description: "Learn how we handle your data",
      icon: <Shield size={24} color={Colors.primary} />,
      onPress: () => openExternalLink("https://shegertransit.com/privacy"),
    },
    {
      id: "4",
      title: "Help Center",
      description: "Get help with common issues",
      icon: <HelpCircle size={24} color={Colors.primary} />,
      onPress: () => router.push("/help"),
    },
  ];

  const contactItems = [
    {
      id: "1",
      title: "Email Us",
      description: "contact@shegertransit.com",
      icon: <Mail size={20} color={Colors.primary} />,
      onPress: openEmail,
    },
    {
      id: "2",
      title: "Call Us",
      description: "+251 911 123 456",
      icon: <Phone size={20} color={Colors.primary} />,
      onPress: openPhone,
    },
    {
      id: "3",
      title: "Visit Us",
      description: "Bole Road, Addis Ababa, Ethiopia",
      icon: <MapPin size={20} color={Colors.primary} />,
      onPress: openMap,
    },
    {
      id: "4",
      title: "Business Hours",
      description: "Monday - Friday: 8:00 AM - 6:00 PM",
      icon: <Clock size={20} color={Colors.primary} />,
      onPress: null,
    },
  ];

  const socialItems = [
    {
      id: "1",
      name: "Website",
      icon: <Globe size={24} color={Colors.primary} />,
      onPress: () => openExternalLink("https://shegertransit.com"),
    },
    {
      id: "2",
      name: "Facebook",
      icon: <Text style={styles.socialIcon}>f</Text>,
      onPress: () => openExternalLink("https://facebook.com/shegertransit"),
    },
    {
      id: "3",
      name: "Twitter",
      icon: <Text style={styles.socialIcon}>𝕏</Text>,
      onPress: () => openExternalLink("https://twitter.com/shegertransit"),
    },
    {
      id: "4",
      name: "Instagram",
      icon: <Text style={styles.socialIcon}>📸</Text>,
      onPress: () => openExternalLink("https://instagram.com/shegertransit"),
    },
    {
      id: "5",
      name: "Telegram",
      icon: <Text style={styles.socialIcon}>✈️</Text>,
      onPress: () => openExternalLink("https://t.me/shegertransit"),
    },
  ];

  const appInfo = {
    version: APP_VERSION,
    buildNumber: BUILD_NUMBER,
    deviceId:
      Platform.OS === "android"
        ? Application.getAndroidId()
        : Application.getIosIdForVendorAsync?.() || "N/A",
    os: Platform.OS,
    osVersion: Platform.Version,
    deviceName: Constants.deviceName || "Unknown Device",
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen
        options={{
          title: "About",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView}>
        {/* App Header */}
        <View style={styles.header}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Sheger Transit+</Text>
          <Text style={styles.appSlogan}>
            Your Reliable Urban Mobility Partner
          </Text>
          <Text style={styles.appVersion}>
            Version {appInfo.version} (Build {appInfo.buildNumber})
          </Text>
        </View>

        {/* About Items */}
        <View style={styles.section}>
          {aboutItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.item}
              onPress={item.onPress}
              activeOpacity={0.8}
            >
              <View style={styles.itemIcon}>{item.icon}</View>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDescription}>{item.description}</Text>
              </View>
              <ChevronRight size={20} color={Colors.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Contact Us */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          {contactItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.item, !item.onPress && styles.itemNoPress]}
              onPress={item.onPress || undefined}
              activeOpacity={item.onPress ? 0.8 : 1}
              disabled={!item.onPress}
            >
              <View style={styles.itemIcon}>{item.icon}</View>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.contactText}>{item.description}</Text>
              </View>
              {item.onPress && (
                <ChevronRight size={20} color={Colors.textLight} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Follow Us */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Follow Us</Text>
          <View style={styles.socialContainer}>
            {socialItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.socialButton}
                onPress={item.onPress}
                activeOpacity={0.8}
              >
                {item.icon}
                <Text style={styles.socialText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Firestore Test Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Database Test</Text>
          <View style={styles.testContainer}>
            <FirestoreTest />
          </View>
        </View>

        {/* App Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            {new Date().getFullYear()} Sheger Transit. All rights reserved.
          </Text>
          <Text style={[styles.infoText, styles.infoSmall]}>
            Made with in Addis Ababa, Ethiopia
          </Text>

          {/* Debug Info - Can be hidden in production */}
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                "Debug Information",
                `App Version: ${appInfo.version}
Build: ${appInfo.buildNumber}
Device: ${appInfo.deviceName}
OS: ${appInfo.os} ${appInfo.osVersion}
Device ID: ${appInfo.deviceId}`,
                [{ text: "OK" }]
              );
            }}
            style={styles.debugButton}
          >
            <Text style={styles.debugButtonText}>App Info</Text>
          </TouchableOpacity>
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
  },
  header: {
    alignItems: "center",
    padding: 24,
    paddingBottom: 16,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  appSlogan: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 8,
    textAlign: "center",
  },
  appVersion: {
    fontSize: 12,
    color: Colors.textLight,
    opacity: 0.7,
  },
  section: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    margin: 16,
    marginBottom: 0,
    paddingHorizontal: 16,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textLight,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  itemNoPress: {
    opacity: 0.9,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(41, 98, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text,
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 13,
    color: Colors.textLight,
  },
  contactText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  socialContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
    marginBottom: 8,
  },
  socialButton: {
    width: "33.33%",
    alignItems: "center",
    padding: 16,
  },
  socialIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  socialText: {
    fontSize: 12,
    color: Colors.text,
    textAlign: "center",
  },
  infoContainer: {
    marginTop: 40,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  testContainer: {
    marginTop: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    elevation: 2,
  },
  infoText: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: "center",
    marginBottom: 4,
  },
  infoSmall: {
    fontSize: 11,
    opacity: 0.7,
  },
  debugButton: {
    marginTop: 16,
    padding: 8,
  },
  debugButtonText: {
    fontSize: 10,
    color: Colors.textLight,
    opacity: 0.5,
  },
});
