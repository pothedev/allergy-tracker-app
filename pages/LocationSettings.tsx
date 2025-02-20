import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { colorMap, intensityColor, translation, intensityColor3} from '../data';
import { LogBox } from 'react-native';
import search from '../assets/search2.png';
import StorageContext from '../pages/StorageContext'; // Import context

// Ignore all log notifications
LogBox.ignoreAllLogs(true);


import veryLowUaDark from '../assets/veryLowUaDark.png';
import lowUaDark from '../assets/lowUaDark.png';
import moderateUaDark from '../assets/moderateUaDark.png';
import highUaDark from '../assets/highUaDark.png';
import veryHighUaDark from '../assets/veryHighUaDark.png';

import veryLowEnDark from '../assets/veryLowEnDark.png';
import lowEnDark from '../assets/lowEnDark.png';
import moderateEnDark from '../assets/moderateEnDark.png';
import highEnDark from '../assets/highEnDark.png';
import veryHighEnDark from '../assets/veryHighEnDark.png';

import veryLowUaLight from '../assets/veryLowUaLight.png';
import lowUaLight from '../assets/lowUaLight.png';
import moderateUaLight from '../assets/moderateUaLight.png';
import highUaLight from '../assets/highUaLight.png';
import veryHighUaLight from '../assets/veryHighUaLight.png';

import veryLowEnLight from '../assets/veryLowEnLight.png';
import lowEnLight from '../assets/lowEnLight.png';
import moderateEnLight from '../assets/moderateEnLight.png';
import highEnLight from '../assets/highEnLight.png';
import veryHighEnLight from '../assets/veryHighEnLight.png';

import notInSeasonUa from '../assets/notInSeasonUa.png';



const intensityImageMap: Record<
  string,
  Record<number, { dark: string; light: string }>
> = {
  ua: {
    0: { dark: notInSeasonUa, light: notInSeasonUa },
    1: { dark: veryLowUaDark, light: veryLowUaLight },
    2: { dark: lowUaDark, light: lowUaLight },
    3: { dark: moderateUaDark, light: moderateUaLight },
    4: { dark: highUaDark, light: highUaLight },
    5: { dark: veryHighUaDark, light: veryHighUaLight },
  },
  en: {
    0: { dark: notInSeasonUa, light: notInSeasonUa },
    1: { dark: veryLowEnDark, light: veryLowEnLight },
    2: { dark: lowEnDark, light: lowEnLight },
    3: { dark: moderateEnDark, light: moderateEnLight },
    4: { dark: highEnDark, light: highEnLight },
    5: { dark: veryHighEnDark, light: veryHighEnLight },
  },
};



const locations = [
  {
    "place": "Kyiv",
    "plants": ["Вільха"],
    "intensity": 2,
    "latitude": 50.45,
    "longitude": 30.52
  },
  {
    "place": "Barcelona",
    "plants": ["Вільха", "Ліщина", "Тополя"],
    "intensity": 3,
    "latitude": 41.38,
    "longitude": 2.162
  },
  {
    "place": "San Francisco",
    "plants": ["Вільха", "Ялівець", "Дуб", "Тополя"],
    "intensity": 3,
    "latitude": 37.69,
    "longitude": 122.31
  },
  {
    "place": "Odesa",
    "plants": ["Вільха", "Трави"],
    "intensity": 1,
    "latitude": 46.47,
    "longitude": 30.73
  },
  {
    "place": "Los Angeles",
    "plants": ["Вільха", "Ялівець", "Тополя"],
    "intensity": 3,
    "latitude": 34.05,
    "longitude":  118.24
  },
  {
    "place": "Florida",
    "plants": ["Вільха", "Тополя", "Дуб", "Ясен"],
    "intensity": 2,
    "latitude": 34.05,
    "longitude":  118.24
  },
]


const LocationBox: React.FC<{
  place: string;
  plants: string[];
  intensity: number;
  theme: string;
  language: string;
  latitude: number;
  longitude: number;
  navigation: any;
}> = ({ place, plants, intensity, theme, language, latitude, longitude, navigation }) => {
  const storage = useContext(StorageContext);
  if (!storage) return null;
  const { updateStoredData } = storage;

  const handlePress = async () => {
    console.log(`📌 Updating City: ${place}, Lat: ${latitude}, Lon: ${longitude}`);

    // Update AsyncStorage
    await AsyncStorage.setItem("city", place);
    await AsyncStorage.setItem("latitude", latitude.toString());
    await AsyncStorage.setItem("longitude", longitude.toString());

    // Update Context to Notify Other Pages
    updateStoredData("city", place);
    updateStoredData("latitude", latitude.toString());
    updateStoredData("longitude", longitude.toString());

    console.log("✅ City Updated in Storage! Navigating to HomePage...");
    navigation.navigate("Home");
  };

  // Translate plant names before joining them
  const translatedPlants = plants.map((plant) => translation[language][plant] || plant);
  const subtext = translatedPlants.join("  •  ");

  return (
    <TouchableOpacity
      style={[styles.locationContainer, { backgroundColor: colorMap[theme + "Widget"] }]}
      onPress={handlePress}
    >
      <View style={{ flexDirection: "column", paddingLeft: 18, justifyContent: "center" }}>
        <Text style={{ color: colorMap[theme + "Text"], marginBottom: 7, fontWeight: "bold", fontSize: 17 }}>
          {place}
        </Text>
        <Text style={{ color: colorMap[theme + "Text2"] }}>{subtext}</Text>
      </View>
      <Image source={intensityImageMap[language][intensity][theme]} style={styles.gaugeImage} />
    </TouchableOpacity>
  );
};

const LocationSettings: React.FC<{ navigation: any }> = ({ navigation }) => {
  const storage = useContext(StorageContext);
  if (!storage) return null;
  
  const { storedData } = storage;
  const { theme, language, city } = storedData; // Get from context

  return <ScrollView style={[styles.container, { backgroundColor: colorMap[theme + "Background"] }]}>
  {/* Header */}
    <View style={styles.header}>
      <Text style={[styles.headerText, { color: colorMap[theme + "Text"] }]}>{translation[language]["Location"] || 'Location'}</Text>
      <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
        <Text style={styles.doneText}>{translation[language]["Back"]}</Text>
      </TouchableOpacity>
    </View>

  {/* Search Bar */}
  <View style={[styles.searchBar, { backgroundColor: colorMap[theme + 'Widget'] }]}>
    <View style={{flexDirection: "row"}}>
      <Image source={search} style={[styles.searchIcon, { tintColor: colorMap[theme + 'Text2'] }]} />
      <Text style={[styles.searchBarText, { color: colorMap[theme + 'Text2'] }]}>
        {translation[language]['Search Location'] || 'Search Location'}
      </Text>
    </View>
  </View>

  {/* Locations */}
  {locations.map((location, index) => (
    <LocationBox
      key={index}
      place={location.place}
      plants={location.plants}
      intensity={location.intensity}
      theme={theme}
      language={language}
      latitude={location.latitude}
      longitude={location.longitude}
      navigation={navigation}
    />
  ))}

  </ScrollView>
}

export default LocationSettings;

const styles = StyleSheet.create({

  container: {
    flex: 1,
    paddingHorizontal: 23, // Updated padding
  },
  header: {
    marginTop: 40 ,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  doneText: {
    fontSize: 20,
    color: colorMap["green"],
    fontWeight: "400"
  },
  headerContainer: {
    position: "relative",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    marginTop: 30,
  },

  searchBarText: {
    fontSize: 14,
  },
  searchIcon: {
    width: 20, // Adjust the size as needed
    height: 20, // Adjust the size as needed
    marginRight: 10, // Add space between the icon and the text
    tintColor: colorMap['darkText2'], // Optional: Adjust the icon color
  },
  searchBar: {
    height: 35,
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginBottom: 15,
    marginTop: 2
  },
  locationContainer: {
    height: 90,
    borderRadius: 20,
    flexDirection: "row",
    marginBottom: 12,
    justifyContent: "space-between",
  },
  gaugeImage: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
    alignSelf: "center",
    marginRight: 15
  },
})