import React, { useState, useEffect, useContext} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import MapboxGL from '@rnmapbox/maps';
import axios from 'axios';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { translation, colorMap} from '../data';
import search from '../assets/search2.png';
import { LogBox } from 'react-native';
import StorageContext from "./StorageContext"

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

***REMOVED***

***REMOVED***
***REMOVED***

const { width } = Dimensions.get('window'); // Get device width dynamically
const containerWidth = (width - 30) / 3 - 8; // 30px padding + 10px gap adjustment

const PollenMapComponent = () => {

  
  const [pollenData, setPollenData] = useState<any>(null);
  const [pollenType, setPollenType] = useState('WEED_UPI');
  const [showPollenData, setShowPollenData] = useState(false); // Toggle for showing extracted data
  const [locationName, setLocationName] = useState<string | null>(null);

  const storage = useContext(StorageContext);
  if (!storage) return null;
  const { storedData } = storage

  const { 
    language,
    theme,
    adjustedBloomingDates
  } = storedData;

  const pollenUrls: Record<string, string> = {
    TREE_UPI: `https://pollen.googleapis.com/v1/mapTypes/TREE_UPI/heatmapTiles/{z}/{x}/{y}?key=${breezoApiKey}`,
    GRASS_UPI: `https://pollen.googleapis.com/v1/mapTypes/GRASS_UPI/heatmapTiles/{z}/{x}/{y}?key=${breezoApiKey}`,
    WEED_UPI: `https://pollen.googleapis.com/v1/mapTypes/WEED_UPI/heatmapTiles/{z}/{x}/{y}?key=${breezoApiKey}`,
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
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude},${longitude}&key=${geocodingApiKey}&language=${lang[language]}&pretty=1`
    const response = await axios.get(url);
    const state = response.data.results[0].components.state || response.data.results[0].components.county
    return `${response.data.results[0].components.country}, ${state}`
  }

  // Example usage within handleMapPress:
  

// Fetch the location name in handleMapPress
  const handleMapPress = async (feature: { geometry: { coordinates: [number, number] } }) => {
    if (feature.geometry && "coordinates" in feature.geometry) {
      const [longitude, latitude] = feature.geometry.coordinates;
      console.log("Clicked coordinates:", { latitude, longitude });

      // Fetch and set the location name
      const fetchedLocationName = await getLocation(latitude, longitude);
      setLocationName(fetchedLocationName);

      // Fetch and process pollen data (existing logic)
      const apiUrl = `https://pollen.googleapis.com/v1/forecast:lookup?key=${breezoApiKey}&location.longitude=${longitude}&location.latitude=${latitude}&days=1`;
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
        <View style={[styles.searchBar, { backgroundColor: colorMap[theme + 'Widget2'] }]}>
          <View style={styles.content}>
            <Image source={search} style={[styles.searchIcon, { tintColor: colorMap[theme + 'Text2'] }]} />
            <Text style={[styles.searchBarText, { color: colorMap[theme + 'Text2'] }]}>
              {translation[language]['Search Location'] || 'Search Location'}
            </Text>
          </View>
        </View>

        {/* Extracted Data */}
        {showPollenData && pollenData && pollenData.length > 0 && (
        <View style={styles.extractedDataContainer}>
          {/* Location Name */}
          {locationName && (
            <Text style={{ color: colorMap[theme + "Text"], fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
              {locationName}
            </Text>
          )}

          {/* List of Plants */}
          {pollenData.map((plant: { name: string; intensity: string }, index: number) => (
            <Text key={index} style={styles.extractedDataText}>
              <Text style={{ color: colorMap[theme + "Text"], fontSize: 16 }}>
                {translation[language][plant.name] || plant.name}{plant.name ? ": " : ""}
              </Text>
              <Text style={{ color: plant.intensity === 'Pollen not detected' ? colorMap[theme+"Text2"] : intensityColor[plant.intensity] || colorMap[theme+"Text2"], fontSize: 16 }}>
                {translation[language][plant.intensity] || plant.intensity}
              </Text>
            </Text>
          ))}
        </View>
      )}



        {/* Filter Buttons */}
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
    marginBottom: 10,
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
});

