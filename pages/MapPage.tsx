import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions,  TextInput, KeyboardAvoidingView, FlatList, Keyboard, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import MapboxGL from '@rnmapbox/maps';
import axios from 'axios';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { translation, colorMap} from '../data';
import search from '../assets/search2.png';
import { LogBox } from 'react-native';
import StorageContext from "./StorageContext"

import { BREEZO_API_KEY, MAPBOX_API_TOKEN, GEOCODING_API_KEY } from '@env';

const lang: Record<string, string> = {
  "ua": "uk",
  "en": "en"
};

const intensityColor: Record<string, string> = {
  "Not in season": "#6F6F6F",
  "Very Low": '#55A01E',
  "Low": '#37740A',
  "Moderate": '#ffd91c',
  "High": '#DB7E0D',
  "Very High": '#E0362B',
};


// Ignore all log notifications
LogBox.ignoreAllLogs(true);


MapboxGL.setAccessToken(MAPBOX_API_TOKEN);

const { width } = Dimensions.get('window'); // Get device width dynamically
const containerWidth = (width - 30) / 3 - 8; // 30px padding + 10px gap adjustment


const PollenMapComponent = () => {
  const cameraRef = useRef<MapboxGL.Camera>(null);
  
  const [pollenData, setPollenData] = useState<any>(null);
  const [pollenType, setPollenType] = useState('WEED_UPI');
  const [showPollenData, setShowPollenData] = useState(false); // Toggle for showing extracted data
  const [locationName, setLocationName] = useState<string | null>(null);
  
  const [collapsed, setCollapsed] = useState(false);


  const storage = useContext(StorageContext);
  if (!storage) return null;
  const { storedData } = storage

  const { 
    language,
    theme,
  } = storedData;

  const pollenUrls: Record<string, string> = {
    TREE_UPI: `https://pollen.googleapis.com/v1/mapTypes/TREE_UPI/heatmapTiles/{z}/{x}/{y}?key=${BREEZO_API_KEY}`,
    GRASS_UPI: `https://pollen.googleapis.com/v1/mapTypes/GRASS_UPI/heatmapTiles/{z}/{x}/{y}?key=${BREEZO_API_KEY}`,
    WEED_UPI: `https://pollen.googleapis.com/v1/mapTypes/WEED_UPI/heatmapTiles/{z}/{x}/{y}?key=${BREEZO_API_KEY}`,
  };


  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }
  
    // 🧼 Reset previous pollen data when typing a new search
    setPollenData(null);
    setShowPollenData(false);
  
    const delay = setTimeout(async () => {
      try {
        const res = await axios.get(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=8&language=${language}&format=json`
        );
        if (res.data.results) setSuggestions(res.data.results);
      } catch (err) {
        console.error('Suggestion fetch failed', err);
      }
    }, 300); // or 0 if you removed the debounce
  
    return () => clearTimeout(delay);
  }, [searchQuery]); 
  
  

  const handleSuggestionSelect = (item) => {
    const coords = { geometry: { coordinates: [item.longitude, item.latitude] } };
    cameraRef.current?.setCamera({
      centerCoordinate: [item.longitude, item.latitude],
      zoomLevel: 7, // or higher for closer view
      animationDuration: 1000, // in milliseconds
    });
    setSearchQuery('');
    setSuggestions([]);
    handleMapPress(coords);
  };



  const updatePollenType = (type: string) => setPollenType(type);

  const extractBloomingPlants = (plantInfo) => {
    // Filter plants that are in season and have an intensity value >= 1
    return plantInfo
      .filter(
        (plant) =>
          plant.indexInfo && plant.indexInfo.value >= 1
      )
      .map((plant) => ({
        name: plant.displayName,
        intensity: plant.indexInfo.category, // Use the intensity category (e.g., "Very High")
      }));
  };
  
  const getLocation = async (latitude, longitude) => {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude},${longitude}&key=${GEOCODING_API_KEY}&language=${lang[language]}&pretty=1`
    const response = await axios.get(url);
    const state = response.data.results[0].components.state || response.data.results[0].components.county
    return `${response.data.results[0].components.country}, ${state}`
  }

  

// Fetch the location name in handleMapPress
  const handleMapPress = async (feature: { geometry: { coordinates: [number, number] } }) => {
    Keyboard.dismiss();
    setSuggestions([])
    if (feature.geometry && "coordinates" in feature.geometry) {
      const [longitude, latitude] = feature.geometry.coordinates;
      console.log("Clicked coordinates:", { latitude, longitude });

      // Fetch and set the location name
      const fetchedLocationName = await getLocation(latitude, longitude);
      setLocationName(fetchedLocationName);

      // Fetch and process pollen data (existing logic)
      const apiUrl = `https://pollen.googleapis.com/v1/forecast:lookup?key=${BREEZO_API_KEY}&location.longitude=${longitude}&location.latitude=${latitude}&days=1`;
      try {
        const response = await axios.get(apiUrl);
        
        if (response.data.error && response.data.error.message === 'NOBRIDGE') {
          setPollenData(null);
          setShowPollenData(true);
          return; // Exit early when the data is unavailable
        }

        const plantInfo = response.data.dailyInfo[0].plantInfo;
        console.log(plantInfo);

        const bloomingPlants = extractBloomingPlants(plantInfo);
        if (bloomingPlants.length === 0) {
          setPollenData([{ name: '', intensity: 'Pollen is not detected' }]); // Custom entry for undetected pollen
        } else {
          setPollenData(bloomingPlants);
        }
        setShowPollenData(true);
      } catch (error) {
        console.error("Error fetching pollen data:", error);
        setPollenData([{ name: '', intensity: 'Data unavailable' }]); // Set to display 'Data Unavailable' when request fails
        setShowPollenData(true);
      }
    }
  };

  

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Map Component */}
      <View style={styles.mapContainer}>
        <MapboxGL.MapView
          styleURL={'mapbox://styles/mapbox/streets-v11'}
          style={styles.map}
          onPress={handleMapPress}
        >
          <MapboxGL.Camera
            zoomLevel={5}
            minZoomLevel={2}
            maxZoomLevel={18}
            centerCoordinate={[30.5234, 50.4501]}
            ref={cameraRef}
          />
          <MapboxGL.RasterSource
            key={pollenType}
            id="pollenTiles"
            tileSize={256}
            url={pollenUrls[pollenType]}
          >
            <MapboxGL.RasterLayer
              id="pollenLayer"
              sourceID="pollenTiles"
              style={{ rasterOpacity: 0.7 }}
            />
          </MapboxGL.RasterSource>
        </MapboxGL.MapView>
      </View>

      {/* Bottom Filter Container */}
      <View
        style={[
          styles.filterContainer,
          { backgroundColor: colorMap[theme + 'Widget'] },
        ]}
      >
        {/* Search Bar */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
          <View style={[styles.searchBar, { backgroundColor: colorMap[theme + 'Widget2'], flex: 1, flexDirection: 'row' }]}>
            <Image source={search} style={[styles.searchIcon, { tintColor: colorMap[theme + 'Text2'] }]} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={translation[language]['Search Location'] || 'Search Location'}
              placeholderTextColor={colorMap[theme + 'Text2']}
              style={{ flex: 1, color: colorMap[theme + 'Text'], alignSelf: "center"}}
            />
          </View>

          {/* Cancel Button (to the right) */}
          {keyboardVisible ? (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setSuggestions([]);
                Keyboard.dismiss();
              }}
              style={{ marginLeft: 10 }}
            >
              <Text style={styles.cancelText}>
                {translation[language]['Cancel'] || 'Cancel'}
              </Text>
            </TouchableOpacity>
          ) : (
            showPollenData && pollenData?.length > 0 && (
              <TouchableOpacity
                onPress={() => setCollapsed(prev => !prev)}
                style={{ marginLeft: 10 }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // optional: extends tap area
              >
                <View style={{ width: 32, height: 32, justifyContent: 'center', alignItems: 'center' }}>
                  <Image
                    source={require('../assets/arrow.png')}
                    style={{
                      width: 18,
                      height: 18,
                      tintColor: colorMap[theme + 'Text2'],
                      transform: [{ rotate: collapsed ? '180deg' : '0deg' }]
                    }}  
                    resizeMode='contain'
                  />
                </View>
              </TouchableOpacity>

            )
          )}
        </View>


        {/* Suggestions List */}
        {searchQuery.length > 1 && suggestions.length > 0 && (
          <FlatList
            keyboardShouldPersistTaps="handled"
            data={suggestions}
            style={{ maxHeight: 200, marginBottom: 8 }}
            keyExtractor={(item) => `${item.id}-${item.name}`}
            renderItem={({ item }) => {
              const region = item.admin1 ? `${item.admin1}, ` : '';
              const formatted = `${item.name}, ${region}${item.country}`;
              return (
                <TouchableOpacity
                  style={{ paddingVertical: 10, paddingHorizontal: 15, backgroundColor: colorMap[theme + 'Widget'] }}
                  onPress={() => handleSuggestionSelect(item)}
                >
                  <Text style={{ fontWeight: 'bold', fontSize: 16, color: colorMap[theme + 'Text'] }}>{item.name}, </Text>
                  <Text style={{ fontSize: 16, color: colorMap[theme + 'Text2'] }}>{region}{item.country}</Text>
                </TouchableOpacity>
              );
            }}
          />
        )}

        {/* Extracted Data */}
        {showPollenData && pollenData && pollenData.length > 0 && (
          <View style={styles.extractedDataContainer}>
            
            

            {/* Collapsible Content */}
            {!collapsed && (
              <>
                {locationName && (
                  <Text style={{
                    color: colorMap[theme + "Text"],
                    fontSize: 18,
                    fontWeight: "bold",
                    marginBottom: 10
                  }}>
                    {locationName}
                  </Text>
                )}

                {pollenData.map((plant, index) => (
                  <Text key={index} style={styles.extractedDataText}>
                    <Text style={{ color: colorMap[theme + "Text"], fontSize: 16 }}>
                      {translation[language][plant.name] || plant.name}{plant.name ? ": " : ""}
                    </Text>
                    <Text style={{
                      color: plant.intensity === 'Pollen not detected'
                        ? colorMap[theme + "Text2"]
                        : intensityColor[plant.intensity] || colorMap[theme + "Text2"],
                      fontSize: 16
                    }}>
                      {translation[language][plant.intensity] || plant.intensity}
                    </Text>
                  </Text>
                ))}
              </>
            )}

          </View>
        )}




        {/* Filter Buttons */}
        {!keyboardVisible && (
          <View style={styles.filterButtonContainer}>
            {['TREE_UPI', 'WEED_UPI', 'GRASS_UPI'].map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => updatePollenType(type)}
                style={[
                  styles.filterButton,
                  pollenType === type && styles.activeFilterButton,
                  pollenType === type ? { backgroundColor: colorMap[theme + 'Widget2'] } : { backgroundColor: colorMap[theme + 'Widget3'] },
                ]}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    pollenType === type && styles.activeFilterButtonText,
                    { color: pollenType === type ? colorMap[theme + 'Text'] : colorMap[theme + 'Text2'] },
                  ]}
                >
                  {translation[language][type === 'TREE_UPI' ? 'Tree' : type === 'WEED_UPI' ? 'Weed' : 'Grass']}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}     
      </View>

    </GestureHandlerRootView>
  );
};

export default PollenMapComponent;


const styles = StyleSheet.create({
 
 
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 5,
    borderRadius: 10,
  },
  button: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 5, marginHorizontal: 5, width: 100},
  treeButton: { backgroundColor: '#009c1a' },
  grassButton: { backgroundColor: '#22b600' },
  weedButton: { backgroundColor: '#26cc00' },
  buttonText: { color: 'white', fontWeight: 'bold' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  intensityText: { fontSize: 16, marginBottom: 5 },
  bloomingText: { fontSize: 16, color: 'green' },
  noDataText: { textAlign: 'center', padding: 20, fontSize: 16, color: 'gray' },
  
  content: {
    flexDirection: 'row',
  },
  
  activeFilterButton: {
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  activeFilterButtonText: {
  },
  searchBarText: {
    fontSize: 14,
  },
  searchIcon: {
    width: 20,
    height: 20, 
    marginRight: 10,
    tintColor: colorMap['darkText2'],
    alignSelf: "center"
  },
  searchBar: {
    height: 35,
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginTop: 2
  },
  container: { flex: 1 },
  mapContainer: { flex: 1, zIndex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  filterContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    zIndex: 5,
  },
  
  extractedDataContainer: { padding: 10 },
  extractedDataText: { fontSize: 14, marginBottom: 5 },
  filterButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterButton: {
    paddingVertical: 12,
    borderRadius: 10,
    width: containerWidth,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: colorMap["green"],
    marginLeft: 10,
  },
});

