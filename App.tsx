import React, { useState, useEffect, useContext} from 'react';
import { View, Image, StyleSheet, ActivityIndicator, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CalendarPage from './pages/CalendarPage';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import Settings from './pages/Settings';
import LocationSettings from './pages/LocationSettings'
import PlantsLibrary from './pages/PlantsLibrary';
import PlantInfo from './pages/PlantInfo';
import CrossReactions from './pages/CrossReactions';
import { colorMap, bloomingDates, translation} from './data.ts';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NativeBaseProvider } from 'native-base';
import { LogBox } from 'react-native';
import axios from 'axios';
import GetLocation from 'react-native-get-location'
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import StorageContext, { StorageProvider } from './pages/StorageContext';
import { UpdateSources } from 'react-native-calendars/src/expandableCalendar/commons';


const resetAsyncStorage = async () => {
  try {
    await AsyncStorage.clear();
    console.log('AsyncStorage has been cleared.');
  } catch (error) {
    console.error('Failed to clear AsyncStorage:', error);
  }
};

//resetAsyncStorage() 
console.log("app is running")



export const defaultLevels: Record<string, number> = { 
  ragweed: 5, 
  mugwort: 4,
  birch: 2,
  poplar: 3,
  timothy: 3,
  nettle: 1,
  goosefoot: 0,
  alder: 3
};

const saveLevelsToStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem('levels', JSON.stringify(defaultLevels));
    console.log('Levels saved successfully');
  } catch (error) {
    console.error('Error saving levels to AsyncStorage:', error);
  }
};

const saveDefaultSettings = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem('levels', JSON.stringify(defaultLevels));
    await AsyncStorage.setItem('language', "ua");
    await AsyncStorage.setItem('theme', "dark");
    console.log('Default settings saved successfully');
  } catch (error) {
    console.error('Error saving default settings to AsyncStorage:', error);
  }
};

//saveDefaultSettings()
//saveLevelsToStorage()



// Request permission
const requestPermission = async () => {
  const result = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION); 
  if (result === RESULTS.GRANTED) { 
    console.log("Location permission granted");
  } else {
    console.log("Location permission denied");
  }
};

// Check permission
const checkPermission = async () => {
  const result = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
  if (result === RESULTS.GRANTED) {
    console.log("Location permission is already granted");
  } else {
    requestPermission();
  }
};

// Call the permission check
checkPermission();

console.log("startik")


const lang: Record<string, string> = {
  "ua": "uk",
  "en": "en"
};


LogBox.ignoreAllLogs(true);

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomePage} options={{ headerShown: false }} />
      <Stack.Screen name="Settings" component={Settings} options={{ headerShown: false }} />
      <Stack.Screen name="LocationSettings" component={LocationSettings} options={{ headerShown: false }} />
      <Stack.Screen name="PlantsLibrary" component={PlantsLibrary} options={{ headerShown: false }} />
      <Stack.Screen name="PlantInfo" component={PlantInfo} options={{ headerShown: false }} />
      <Stack.Screen name="CrossReactions" component={CrossReactions} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};
 
const geocodingApiKey = '0dd188da8e294b02aa0871972eda5642';

const AppContent = () => {
  const theme = "dark";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>("en");
  const [latitude, setLatitude] = useState<string>();
  const [longitude, setLongitude] = useState<string>();
  const [city, setCity] = useState<string>();
  const [dateShifting, setDateShifting] = useState<Record<string, number[]>>();
  const [predictionsMap, setPredictionsMap] = useState<Record<string, Record<string, number>>>();
  const [levels, setLevels] = useState<Record<string, number>>();
  const [isStorageLoaded, setStorageLoaded] = useState(false);
  const [AppIsLoading, setAppIsLoading] = useState(true)

  const storage = useContext(StorageContext);
  if (!storage) return null;
  const { updateStoredData, storedData } = storage;

  const sanitizeString = (input: string | null): string | null => {
    if (!input) return null;
    // Remove all escape characters and extra quotes
    let sanitized = input.replace(/\\+/g, ''); // Remove all backslashes
    sanitized = sanitized.replace(/^"+|"+$/g, ''); // Remove surrounding quotes
    return sanitized;
  };

  // 1. Load initial data from storage
  useEffect(() => {
    console.log("✅ 1. Load initial data from storage");

    const loadStorageData = async () => {
      try {
        updateStoredData('fetching', 'true')
        // Load all data from AsyncStorage
        var testlang = await AsyncStorage.getItem('language')
        if (!testlang){
          await saveDefaultSettings()
        }

        const [savedLanguage, savedCity, savedLat, savedLon, savedLevels, savedTheme] = await Promise.all([
          AsyncStorage.getItem('language'),
          AsyncStorage.getItem('city'),
          AsyncStorage.getItem('latitude'),
          AsyncStorage.getItem('longitude'),
          AsyncStorage.getItem('levels'),
          AsyncStorage.getItem('theme'),
        ]);


        // Sanitize all string values
        const cleanedCity = sanitizeString(savedCity);
        const cleanedLat = sanitizeString(savedLat);
        const cleanedLon = sanitizeString(savedLon);
        const cleanedLanguage = sanitizeString(savedLanguage) 
        const cleanedTheme = sanitizeString(savedTheme)

        // Update context storage with cleaned values
        updateStoredData('city', cleanedCity);
        updateStoredData('latitude', cleanedLat);
        updateStoredData('longitude', cleanedLon);
        updateStoredData('language', cleanedLanguage);
        updateStoredData('theme', cleanedTheme);

        // Update local state with cleaned values
        if (cleanedLanguage) setLanguage(cleanedLanguage);
        if (cleanedCity) setCity(cleanedCity);
        if (cleanedLat) setLatitude(cleanedLat);
        if (cleanedLon) setLongitude(cleanedLon);
        if (savedLevels) setLevels(JSON.parse(savedLevels));
        //if (cleanedTheme) setTheme(cleanedTheme);

        // If cleaned values are different from saved values, update AsyncStorage
        if (
          cleanedCity !== savedCity ||
          cleanedLat !== savedLat ||
          cleanedLon !== savedLon ||
          cleanedLanguage !== savedLanguage ||
          cleanedTheme !== savedTheme
        ) {
          await Promise.all([
            cleanedCity !== savedCity ? AsyncStorage.setItem('city', cleanedCity) : Promise.resolve(),
            cleanedLat !== savedLat ? AsyncStorage.setItem('latitude', cleanedLat) : Promise.resolve(),
            cleanedLon !== savedLon ? AsyncStorage.setItem('longitude', cleanedLon) : Promise.resolve(),
            cleanedLanguage !== savedLanguage ? AsyncStorage.setItem('language', cleanedLanguage) : Promise.resolve(),
            cleanedTheme !== savedTheme ? AsyncStorage.setItem('theme', cleanedTheme) : Promise.resolve(),
          ]);
          console.log("✅ Cleaned and updated storage");
        }

        setStorageLoaded(true);
      } catch (e) {
        console.error('1. Failed to load storage data:', e);
        setError('1. Failed to load user settings');
      }
    };

    loadStorageData();
  }, []);

  // 2. Fetch location if not in storage
  useEffect(() => {
    console.log("✅ 2. Fetch location if not in storage")
    if (!isStorageLoaded) return;
    
    const fetchLocation = async () => {
      if (latitude && longitude) {
        console.log('🔹 2.1 Location already exists in storage');
        return;
      }

      console.log("🔹 2.1. Location not in storage, fetching")
      try {
        const location = await GetLocation.getCurrentPosition();
        const newLat = location.latitude.toString();
        const newLon = location.longitude.toString();

        console.log("🔹 2.2", location, newLat, newLon)


        // Update state and storage
        setLatitude(newLat);
        setLongitude(newLon);
        await Promise.all([
          AsyncStorage.setItem('latitude', newLat),
          AsyncStorage.setItem('longitude', newLon),
        ]);

        // Get city name
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${newLat},${newLon}&key=${geocodingApiKey}&language=${lang[language]}`;
        const response = await axios.get(url);
        const cityName = response.data.results[0]?.components?.city || 'Unknown City';
        console.log("🔹 2.3", cityName)
        setCity(cityName);
        //await AsyncStorage.setItem('city', cityName);
        updateStoredData("city", cityName)
        updateStoredData("latitude", newLat)
        updateStoredData("longitude", newLon)
        console.log("🔹 2.4 fetched", newLat, newLon, cityName)

      } catch (error) {
        console.error('2. Location fetch failed:', error);
        
        setCity("Kyiv");
        //await AsyncStorage.setItem('city', "Kyiv");
        updateStoredData("city", "Kyiv")
        updateStoredData("latitude", "50.45")
        updateStoredData("longitude", "30.52")
        setError('2. Failed to get location');
      }
    };

    fetchLocation();
  }, [isStorageLoaded, language]);

  // 3. Fetch initial date shifting prediction
  useEffect(() => {
    const fetchDateShifting = async () => {
      //console.log("3. hi")
      if (!latitude || !longitude || !city) return; 
      console.log("✅ 3. Fetch initial date shifting prediction");
      //console.log("✅ 3.0 Sending data to server:", storedData.city, storedData.latitude, storedData.longitude);
      // if (storedData.levels){
      //   levels = storedData.levels
      //   console.log("✅ 3.1 Yes, levels", levels);
      // }

      updateStoredData('fetching', 'true')
      console.log("✅ 3.1 going to fetch rn");
      try {
        const response = await fetch("https://allergyprediction.onrender.com/predict", { 
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            weather_data: [[7, 30, 60, 30, 0], [8, 30, 60, 30, 0]] // Original payload specific to this source
          }),
        });
        if (!response.ok) throw new Error("Failed to fetch"); 
        
        const data = await response.json();
        console.log("✅ 3.2 Prediction data received:", data);
        const shiftingMap: Record<string, number[]> = {
          ragweed: [data.start_shift, data.end_shift],
          mugwort: [0, 0],
          birch: [0, 0],
          poplar: [0, 0],
          nettle: [0, 0],
          timothy: [0, 0],
          goosefoot: [0, 0],
          alder: [0, 0],
        }
        setDateShifting(shiftingMap)
        console.log("3. setting dateShifting", shiftingMap)
      } catch (err) {
        console.error("3. Fetch error:", err);
        setError("3. Failed to fetch data");
      } finally {
        //setLoading(false);
      }
    };
  
    fetchDateShifting();
  }, [latitude, longitude, city, storedData.city, storedData.latitude, storedData.longitude]);


  // 4. Fetch intensity predictions
  useEffect(() => {
    
    if (!dateShifting || !latitude || !longitude || !city) return;

    const fetchIntensityPredictions = async () => {
      console.log("✅ 4. Fetch intensity predictions for", city);
      try {
        
        const requests = Object.entries(bloomingDates).map(([plant, dates]) => ({
          plant,
          start: shiftDate(dates[0], dateShifting[plant]?.[0] || 0),
          end: shiftDate(dates[1], dateShifting[plant]?.[1] || 0),
        }));

        const predictions = await Promise.all(
          requests.map(async ({ plant, start, end }) => {
            console.log("4.1", plant, start, end, latitude, longitude);
            const response = await fetch("https://intensityprediction.onrender.com/predict", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                start_date: start,
                end_date: end,
                latitude: storedData.latitude,  
                longitude: storedData.longitude, 
                timezone: "Africa/Cairo",
              }),
            });
            //console.log("4.1", start, end, latitude, longitude)
            //console.log("4.2", response.json());
            const data = await response.json();
            //console.log("4.2", plant, data.updated_dict);
            return { plant, data: data.updated_dict };
          })
        );

        const newPredictionsMap = predictions.reduce((acc, { plant, data }) => {
          acc[plant] = data;
          return acc;
        }, {} as Record<string, Record<string, number>>);

        //console.log(newPredictionsMap)

        setPredictionsMap(newPredictionsMap);

        const today = new Date().toISOString().split("T")[0];
        if (newPredictionsMap && city){
          updateStoredData( "allBloomingDates",  { data: newPredictionsMap, date: today }, city );
          console.log("🍕🍕🍕", storedData.allBloomingDates)
        }

        console.log("✅ 4.1 Fetched intensity predictions for", storedData.city, storedData.latitude, storedData.longitude)
        console.log(newPredictionsMap)
        //console.log(newPredictionsMap)
        await AsyncStorage.setItem('bloomingDates', JSON.stringify(newPredictionsMap));
      } catch (err) {
        console.error("4. Intensity prediction failed:", err);
        setError("4. Failed to load intensity predictions");
      } finally {
        setLoading(false);
      }
    };

    fetchIntensityPredictions();
  }, [dateShifting, latitude, longitude, city]);

  // 5. Adjust intensities based on user levels
  useEffect(() => {
    if (!predictionsMap || !levels) {
      console.log(" 5.1 no predictions map or levels");
      // if (!levels && !storedData.levels) {
      //   saveLevelsToStorage()
      // }
      // return;
      return;
    }

    var levelss = levels
    
    if (storedData.levels){
      levelss = storedData.levels
    }


    console.log("✅ 5. Adjust intensities based on user levels", levelss);
    const adjustedData = adjustIntensityByReactionLevel(predictionsMap, levelss);
    //console.log("adjustedData in App")
    console.log(adjustedData)

    updateStoredData("adjustedBloomingDates", adjustedData);

    setAppIsLoading(false)
    //updateStoredData('fetching', 'false')
  }, [predictionsMap, levels]); 

  useEffect(() => {
    console.log("🍔 6. Adjust intensity was triggered with!", storedData.levels)
    if (AppIsLoading || !levels || !predictionsMap) {
      console.log("🍔 6.1 nvm")
      return
    }
    const data = adjustIntensityByReactionLevel(predictionsMap, storedData.levels)
    updateStoredData("adjustedBloomingDates", data) 
    // const today = new Date().toISOString().split("T")[0];
    // console.log("🍔🍔", today)
    // updateStoredData( "allAdjustedBloomingDates",  { data: data, date: today }, city );
    // console.log("🍔🍔🍔", storedData.allAdjustedBloomingDates)
    console.log("❗❗❗❗❗❗❗❗❗❗❗❗❗")
    // console.log(city, ":", [data.alder, today])
    console.log("🍕🍕🍕", storedData.allBloomingDates)
    console.log("🍔 6.1 adjust intensity was called and saved!", storedData.adjustedBloomingDates)
    //updateStoredData('fetching', 'false')
  }, [storedData.levels])
  
  

  // Helper functions remain the same
  const shiftDate = (dateString: string, shift: number): string => {
    const [day, month, year] = dateString.split('/').map(Number); 
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + shift);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  };

  const adjustIntensityByReactionLevel = ( 
    originalData: Record<string, Record<string, number>>, // Original data with intensities from 0-5
    levels: Record<string, number> // User levels (0-5) for each plant
  ): Record<string, Record<string, number>> => { 
    const adjustedData: Record<string, Record<string, number>> = {};  

    console.log("🤯 adjustIntensityByReactionLevel was called")
  
    Object.keys(originalData).forEach((plant) => {
      const maxUserLevel = levels[plant] ?? 1; // Default level to 1 if not  provided
      const plantData = originalData[plant];
  
      // If the plant's level is 0, we overwrite all of its intensity values with -1
      if (levels[plant] === 0) { 

        adjustedData[plant] = Object.fromEntries(
          Object.keys(plantData).map((date) => [date, -1])
        );
      } else {
        // For plants with levels 1-5, adjust intensity based on user level
        const maxOriginalIntensity = Math.max(...Object.values(plantData));
    
        // Initialize the adjusted data for this plant if not already initialized
        if (!adjustedData[plant]) {
          adjustedData[plant] = {};
        }
  
        // Adjust the intensity for each date
        Object.entries(plantData).forEach(([date, intensity]) => {
          // Scale the intensity to the user's maximum level
          const scaledIntensity = Math.round((intensity / maxOriginalIntensity) * maxUserLevel);
          adjustedData[plant][date] = scaledIntensity;
        });
      }
    });
  
    return adjustedData;
  };

  // Render logic remains the same
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Error: {error}</Text>
      </View>
    );
  }

  if (loading || AppIsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={[styles.loadingText, {color: colorMap["lightText2"]}]}>{translation[language]["Loading Allergy Data..."]}</Text>
        </View>
      </View>
    );
  }
  

  if (!AppIsLoading){
    return (
      <NavigationContainer>
        <Tab.Navigator
          initialRouteName="HomeStack"
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused }) => {
              let iconPath;
              switch (route.name) {
                case 'Calendar':
                  iconPath = require('./assets/calendar.png');
                  break;
                case 'HomeStack':
                  iconPath = require('./assets/home.png');
                  break;
                case 'Map':
                  iconPath = require('./assets/map.png');
                  break;
              }
              return <Image source={iconPath} style={styles.icon} resizeMode="contain" />;
            },
            tabBarActiveTintColor: storedData.theme === 'dark' ? 'white' : 'black',
            tabBarInactiveTintColor: storedData.theme === 'dark' ? 'gray' : 'lightgray',
            tabBarStyle: { backgroundColor: colorMap[`${storedData.theme}Widget`] },
            tabBarShowLabel: false,
            headerShown: false,
          })}
        >
          <Tab.Screen name="Calendar" component={CalendarPage} />
          <Tab.Screen name="HomeStack" component={HomeStack} />
          <Tab.Screen name="Map" component={MapPage} />
        </Tab.Navigator>
      </NavigationContainer>
    );
  }
};

const App = () => {
  
  return (
    <StorageProvider>
      <NativeBaseProvider>
        <AppContent />
      </NativeBaseProvider>
    </StorageProvider>
  );
};

const styles = StyleSheet.create({
  icon: { width: 22, height: 22, marginBottom: -6},
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { fontSize: 16, color: 'red' },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 999,
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    marginTop: 10,
  },
}); 

export default App;
