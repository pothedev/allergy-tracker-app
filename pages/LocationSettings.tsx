import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, FlatList, ActivityIndicator, LogBox } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colorMap, translation } from '../data';
import StorageContext from '../pages/StorageContext';
import search from '../assets/search2.png';
import { background, color } from 'native-base/lib/typescript/theme/styled-system';
import 'react-native-gesture-handler';
import { Swipeable } from 'react-native-gesture-handler';


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


import RNFS from 'react-native-fs';


// Ignore all log notifications
LogBox.ignoreAllLogs(true);

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


const exportAsyncStorageToDownloads = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const stores = await AsyncStorage.multiGet(keys);

    const dump = stores.reduce((acc, [key, value]) => {
      try {
        acc[key] = JSON.parse(value);
      } catch {
        acc[key] = value;
      }
      return acc;
    }, {});

    const json = JSON.stringify(dump, null, 2);

    // 📂 Save to public Downloads folder
    const path = RNFS.DownloadDirectoryPath + '/asyncStorageDump.json';

    await RNFS.writeFile(path, json, 'utf8');

    console.log('✅ File saved at:', path);
    return path;
  } catch (e) {
    console.error('❌ Error saving to file:', e);
  }
};



const locations = [
  {
    "place": "Kyiv",
    "plants": ["Вільха"],
    "intensity": 3,
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
    "intensity": 2,
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
    "place": "Bucharest",
    "plants": ["Вільха", "Береза", "Тополя"],
    "intensity": 5,
    "latitude": 44.4268,
    "longitude":  26.1025
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
  onDelete: () => void; // Add this line
}> = ({ place, plants, intensity, theme, language, latitude, longitude, navigation, onDelete }) => {
  const storage = useContext(StorageContext);
  if (!storage) return null;
  const { updateStoredData } = storage;

  const handlePress = async () => {
    updateStoredData("city", place);
    updateStoredData("latitude", latitude.toString());
    updateStoredData("longitude", longitude.toString());

    console.log("✅ City Updated in Storage! Navigating to HomePage...");
    navigation.navigate("Home");
  };

  const translatedPlants = plants.map((plant) => translation[language][plant] || plant);
  const subtext = translatedPlants.join("  •  ");

  const renderRightActions = () => (
    <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
      <Text style={styles.deleteButtonText}>Delete</Text>
    </TouchableOpacity>
  );

  return (
    <Swipeable renderRightActions={renderRightActions}>
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
    </Swipeable>
  );
};


 
const LocationSettings: React.FC<{ navigation: any }> = ({ navigation }) => {
  const storage = useContext(StorageContext);
  if (!storage) return null;
  
  const { storedData, updateStoredData } = storage;
  const { theme, language } = storedData;

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const savedLocations = storedData.locations || [];
  console.log("super locations", savedLocations)

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=10&language=${language}&format=json`);
        const data = await response.json();
        if (data.results) {
          setSuggestions(data.results);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Failed to fetch location suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300); // debounce
    return () => clearTimeout(timeoutId);
  }, [searchQuery, language]);

  const handleSelectLocation = async (item: any) => {
    const cityName = `${item.name}, ${item.country}`;
  
    console.log(`📌 Selected: ${cityName} (${item.latitude}, ${item.longitude})`);
  
    // Get existing saved locations from context
    let savedLocations = storedData.locations || [];
  
    // Get currently blooming plants from context
    const currentlyBlooming = storedData.currentlyBlooming || [];
  
    // Prepare plants and intensity
    const plants = currentlyBlooming.map((plant: any) => plant.name || "");
    const intensityLevels = {
      "Very low": 1,
      "Low": 2,
      "Moderate": 3,
      "High": 4,
      "Very high": 5,
    };
    const intensity = Math.max(
      ...currentlyBlooming.map((plant: any) => intensityLevels[plant.intensity] || 1)
    );
  
    // New location object
    const newLocation = {
      place: cityName,
      plants: plants,
      intensity: intensity,
      latitude: item.latitude,
      longitude: item.longitude,
    };
  
    // Update locations list
    const updatedLocations = [...savedLocations, newLocation];
  
    // Update StorageContext
    updateStoredData('locations', updatedLocations);
    updateStoredData('city', cityName);
    updateStoredData('latitude', item.latitude.toString());
    updateStoredData('longitude', item.longitude.toString());
  
    console.log("✅ City saved to locations list via context!");
  
    navigation.navigate('Home');
    exportAsyncStorageToDownloads()
  };
   

  return (
    <ScrollView style={[styles.container, { backgroundColor: colorMap[theme + 'Background'] }]}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: colorMap[theme + 'Text']}]}>
          {translation[language]['Location'] || 'Location'}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.doneText}>{translation[language]['Back'] || 'Back'}</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20}}>
  
        {/* Search Icon + Input */}
        <View style={[styles.searchBar, {backgroundColor: colorMap[theme+"Widget2"]}]}>
          <Image source={search} style={[styles.searchIcon, { tintColor: colorMap[theme + 'Text2'] }]} />
          <TextInput
            style={[styles.searchBarText, { color: colorMap[theme + 'Text2'], flex: 1}]}
            placeholder={translation[language]['Search Location'] || 'Search Location'}
            placeholderTextColor={colorMap[theme + 'Text2']}
            value={searchQuery}
            onChangeText={text => setSearchQuery(text)}
          />
        </View>

        {/* Cancel Button - show only when typing */}
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={[styles.cancelText]}>
              {translation[language]['Cancel'] || 'Cancel'}
            </Text>
          </TouchableOpacity>
        )}

      </View>


      {/* Location Suggestions */}
      {loading && (
        <ActivityIndicator size="small" color={colorMap.green} style={{ marginVertical: 10 }} />
      )}
      <FlatList
        style={[styles.suggestionsList]}
        data={suggestions}
        keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
        renderItem={({ item }) => {
          const region = item.admin1 ? `${item.admin1}, ` : '';
          const country = item.country;
          const formatted = `${item.name}, ${region}${country}`;

          return (
            <TouchableOpacity
              style={[styles.suggestionContainer]}
              onPress={() => handleSelectLocation(item)}
            >
              <View style={{ flexDirection: 'row', paddingLeft: 8, justifyContent: 'center' }}>
                <Text style={{ color: colorMap[theme + 'Text'], fontWeight: 'bold', fontSize: 17 }}>
                  {item.name}, {" "}
                </Text>
                <Text style={{ color: colorMap[theme + 'Text2'], fontSize: 17 }} numberOfLines={1} ellipsizeMode="tail">
                  {region}{country}
                </Text>
              </View>
            </TouchableOpacity>
          ); 
        }}
      />
      {/* Locations */}
      {searchQuery.length === 0 && savedLocations.map((location, index) => (
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
          onDelete={() => {
            const newList = storedData.locations.filter((l: any) => l.place !== location.place);
            updateStoredData("locations", newList);
          }}
        />
      ))}



    </ScrollView>
  );
};

export default LocationSettings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 23,
  },
  header: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  doneText: {
    fontSize: 20,
    color: colorMap['green'],
    fontWeight: '400',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 10,
    borderRadius: 10,
    paddingVertical: 2
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  searchBarText: {
    fontSize: 16,
    paddingVertical: 5,
  },
  locationContainer: {
    height: 90,
    borderRadius: 20,
    flexDirection: "row",
    marginBottom: 12,
    justifyContent: "space-between",
  },
  noResultsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  suggestionsList: {

  },
  suggestionContainer: {
    height: 40,
    flexDirection: 'row',
    marginBottom: 5,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingLeft: 0,
    borderBottomColor: "#6e6e6e",
    borderBottomWidth: 0.4,
  },
  cancelText: {
    fontSize: 16,
    color: colorMap["green"],
    marginLeft: 10,
    alignSelf: "center",
  },
  gaugeImage: {
    width: 64,
    height: 64,
    resizeMode: 'contain',
    alignSelf: "center",
    marginRight: 15
  },
  
  deleteButton: {
    backgroundColor: colorMap["darkWidget2"],
    justifyContent: 'center',
    alignItems: 'center',
    width: 90,
    borderRadius: 20,
    height: 90,
    marginLeft: 10
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    paddingHorizontal: 15,
  },
  
});
