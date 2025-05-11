import React from "react";
import {
  View,
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
  ScrollView,
  ViewStyle,
  Linking
} from "react-native";
import { colorMap } from "../data";
import StorageContext from "./StorageContext";
import { useContext } from "react";

type FilledButtonProps = {
  style?: ViewStyle;
  text?: string;
  onPress: () => void;
};

const FilledButton: React.FC<FilledButtonProps> = ({ style, text = "", onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.filledButton, style]}>
      <Text style={styles.filledButtonText}>{text}</Text>
    </TouchableOpacity>
  );
};

const PrivacyPolicy: React.FC<{ navigation: any }> = ({ navigation }) => {
  const storage = useContext(StorageContext);
  if (!storage) return null;
  const { storedData } = storage;
  const theme = storedData.theme;
  const textColor = colorMap[theme + "Text"];

  return (
    <View style={{ flex: 1, position: "relative", backgroundColor: colorMap[theme + "Background"] }}>
      <View style={[styles.wrapper]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require("../assets/arrow-left.png")}
            resizeMode="contain"
            style={{ height: 22, marginTop: 20, marginLeft: -8, tintColor: textColor }}
          />
        </TouchableOpacity>

        <Text style={[styles.title, { color: textColor }]}>Privacy Policy</Text>

        <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: 20 }}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>1. Introduction</Text>
          <Text style={[styles.paragraph, { color: textColor }]}>
            Allergy Tracker is committed to protecting your personal data. This Privacy Policy outlines how we collect,
            use, and store your information.
          </Text>

          <Text style={[styles.sectionTitle, { color: textColor }]}>2. Data We Collect</Text>
          <Text style={[styles.paragraph, { color: textColor }]}>
            - <Text style={{fontWeight: '600'}}>Email and password</Text>: Collected during account creation to securely identify and manage your profile.{"\n"}
            - <Text style={{fontWeight: '600'}}>Allergy sensitivity levels</Text>: You manually assign a severity level (from 0 to 5) to each supported plant species to receive personalized pollen forecasts.{"\n"}
            - <Text style={{fontWeight: '600'}}>Approximate location</Text>: If permitted, your device's approximate coordinates are used to fetch localized pollen forecasts and environmental conditions (e.g., humidity, wind, temperature).{"\n"}
            - <Text style={{fontWeight: '600'}}>Pollen prediction data</Text>: Based on blooming periods, weather, and your sensitivity settings, the app predicts pollen intensity for each plant.{"\n"}
            - <Text style={{fontWeight: '600'}}>App preferences</Text>: Includes theme (light/dark mode) and selected language, stored locally to improve your user experience.
          </Text>

          <Text style={[styles.sectionTitle, { color: textColor }]}>3. Third-Party Services</Text>
          <Text style={[styles.paragraph, { color: textColor }]}>
            This app uses the following APIs to provide core functionality:
            {"\n\n"}
            - <Text style={{fontWeight: '600'}}>Open-Meteo</Text>: For weather forecasts and location search suggestions. 
              Your approximate coordinates may be sent to Open-Meteo if location permissions are granted.
              {"\n"}→ <Text style={{textDecorationLine: 'underline', color: textColor}} onPress={() => Linking.openURL('https://open-meteo.com/en/terms')}>Terms</Text> | <Text style={{textDecorationLine: 'underline', color: textColor}} onPress={() => Linking.openURL('https://open-meteo.com/en/privacy')}>Privacy Policy</Text>
            {"\n\n"}
            - <Text style={{fontWeight: '600'}}>OpenCageData</Text>: For converting coordinates to city names (geocoding).
              {"\n"}→ <Text style={{textDecorationLine: 'underline', color: textColor}} onPress={() => Linking.openURL('https://opencagedata.com/security-policy')}>Security Policy</Text>
            {"\n\n"}
            - <Text style={{fontWeight: '600'}}>BreezoMeter</Text>: For pollen data and pollen maps when you select a location.
              {"\n"}→ <Text style={{textDecorationLine: 'underline', color: textColor}} onPress={() => Linking.openURL('https://www.breezometer.com/privacy-policy')}>Privacy Policy</Text>
            {"\n\n"}
            - <Text style={{fontWeight: '600'}}>Firebase (by Google)</Text>: Used for authentication and data storage. Firebase may process anonymized usage data and analytics under Google’s policies.
            {"\n"}→ <Text style={{textDecorationLine: 'underline', color: textColor}} onPress={() => Linking.openURL('https://firebase.google.com/support/privacy')}>Firebase Privacy Policy</Text>
            {"\n\n"}
            <Text style={{fontStyle: 'italic'}}>
              Note: These services process data under their own policies. We do not store raw location data.
            </Text>
          </Text>

          <Text style={[styles.sectionTitle, { color: textColor }]}>4. Location Use</Text>
          <Text style={[styles.paragraph, { color: textColor }]}>
            If location permission is granted, your approximate coordinates are used to personalize allergy forecasts. Specifically:
            {"\n"}• Your location is sent to Open-Meteo to retrieve local weather and environmental data (e.g., temperature, humidity).
            {"\n"}• Coordinates may be sent to OpenCageData to determine your general city area.
            {"\n"}• If you select a map location, coordinates are also sent to BreezoMeter to retrieve real-time pollen intensity data.
            {"\n"}We do not store or share your raw location data on any server.
          </Text>

          <Text style={[styles.sectionTitle, { color: textColor }]}>5. Data Storage</Text>
          <Text style={[styles.paragraph, { color: textColor }]}>
            Your preferences are stored securely in Firebase Firestore and locally on your device using AsyncStorage. All data is deleted immediately and permanently
            when you delete your account. We do not retain any personal data after account deletion.
          </Text>

          <Text style={[styles.sectionTitle, { color: textColor }]}>6. Account Deletion</Text>
          <Text style={[styles.paragraph, { color: textColor }]}>
            You may delete your account at any time from the app. Doing so will erase your user data from both local
            storage and Firebase servers.
          </Text>

          <Text style={[styles.sectionTitle, { color: textColor }]}>7. Data Sharing with APIs</Text>
          <Text style={[styles.paragraph, { color: textColor }]}>
            We do not sell your data, but the app shares necessary information with:
            {"\n"}
            - Weather/geocoding APIs (Open-Meteo, OpenCageData) when fetching forecasts.
            {"\n"}
            - BreezoMeter when checking pollen levels for a location.
            {"\n\n"}
            All data sent to these services is governed by their respective privacy policies.
          </Text>

          <Text style={[styles.sectionTitle, { color: textColor }]}>8. Disclaimer</Text>
          <Text style={[styles.paragraph, { color: textColor }]}>
            Allergy Tracker provides pollen predictions based on weather and environmental models. These forecasts are not
            guaranteed to be 100% accurate and should not replace professional medical advice. Always consult your doctor
            if you suffer from serious allergic conditions.
          </Text>

          <Text style={[styles.sectionTitle, { color: textColor }]}>9. Children's Privacy</Text>
          <Text style={[styles.paragraph, { color: textColor }]}>
            This app is not intended for use by children under the age of 13. We do not knowingly collect or solicit personal information from children. If you are a parent or guardian and believe your child has provided us with information, please contact us immediately.
          </Text>

          <Text style={[styles.sectionTitle, { color: textColor }]}>10. Contact</Text>
          <Text style={[styles.paragraph, { color: textColor }]}>
            For questions or concerns regarding this privacy policy, please contact us at <Text style={{textDecorationLine: 'underline'}} onPress={() => Linking.openURL('mailto:poroshynskamilana@gmail.com')}>poroshynskamilana@gmail.com</Text>
          </Text>
        </ScrollView>
      </View>
    </View>
  );
};

export default PrivacyPolicy;

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
  },
  filledButton: {
    backgroundColor: colorMap["green"],
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    height: 50,
  },
  filledButtonText: {
    textAlign: "center",
    fontSize: 17,
    fontWeight: "500",
    color: "#fff",
  },
});