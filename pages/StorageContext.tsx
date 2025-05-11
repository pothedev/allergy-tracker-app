import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface StorageContextType {
  storedData: { [key: string]: any }; // Stores all values dynamically
  updateStoredData: (key: string | { [key: string]: any }, newValue?: any) => Promise<void>;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

interface StorageProviderProps {
  children: ReactNode;
}

const defaultLevels: Record<string, number> = { 
  ragweed: 5, 
  mugwort: 4,
  birch: 2,
  poplar: 3,
  timothy: 3,
  nettle: 1,
  goosefoot: 0,
  alder: 3,
  oak: 2, 
  plantain: 2
};

export const StorageProvider: React.FC<StorageProviderProps> = ({ children }) => {
  const [storedData, setStoredData] = useState<{ [key: string]: any }>({});
  const [isLoading, setIsLoading] = useState(true); // Track loading state

  const sanitizeString = (input: string | null): string | null => {
    if (!input) return null;
    // Remove all escape characters and extra quotes
    let sanitized = input.replace(/\\+/g, ''); // Remove all backslashes
    sanitized = sanitized.replace(/^"+|"+$/g, ''); // Remove surrounding quotes
    return sanitized;
  };

  // Load individual values from AsyncStorage
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        console.log("🔹 Loading AsyncStorage keys individually...");
    
        const city = await AsyncStorage.getItem('city');
        const latitude = await AsyncStorage.getItem('latitude');
        const longitude = await AsyncStorage.getItem('longitude');
        const language = await AsyncStorage.getItem('language');
        const theme = await AsyncStorage.getItem('theme');
        const locations = await AsyncStorage.getItem('locations');
        const currentlyBlooming = await AsyncStorage.getItem('currentlyBlooming');
        const levels = await AsyncStorage.getItem('levels');
        const pendingProfileSetup = await AsyncStorage.getItem('pendingProfileSetup');

        const cleanedCity = sanitizeString(city);
        const cleanedLat = sanitizeString(latitude);
        const cleanedLon = sanitizeString(longitude);
        const cleanedLanguage = sanitizeString(language);
        const cleanedTheme = sanitizeString(theme);
        const cleanedPendingProfileSetup = sanitizeString(pendingProfileSetup);

    
        const newData = {
          city: cleanedCity || "Unknown city",
          latitude: cleanedLat || "0",
          longitude: cleanedLon || "0",
          language: cleanedLanguage || "en",
          theme: cleanedTheme || "dark",
          locations: locations ? JSON.parse(locations) : [],
          currentlyBlooming: currentlyBlooming ? JSON.parse(currentlyBlooming) : [],
          levels: levels ? JSON.parse(levels) : defaultLevels,
          pendingProfileSetup: pendingProfileSetup || "false"
        };
    
        console.log("✅ AsyncStorage Loaded:", newData);
    
        setStoredData(newData);
      } catch (error) {
        console.error("❌ Error loading AsyncStorage:", error);
      } finally {
        setIsLoading(false);
      }
    };    
    loadStoredData();
  }, []);

  // Dynamically update a key-value pair or multiple pairs in AsyncStorage
  const updateStoredData = async (
    key: string | { [key: string]: any }, 
    newValue?: any, 
    childKey?: string
  ) => {
    try {
      if (typeof key === "string") {
        // If updating a nested key inside an object
        if (childKey) {
          const storedParentMap = await AsyncStorage.getItem(key);
          let parentMap = storedParentMap ? JSON.parse(storedParentMap) : {};
  
          // Append new value instead of overwriting
          parentMap[childKey] = parentMap[childKey] ? [...parentMap[childKey], newValue] : [newValue];
  
          await AsyncStorage.setItem(key, JSON.stringify(parentMap));
  
          setStoredData((prev) => ({
            ...prev,
            [key]: parentMap,
          }));
        } else {
          // Standard key-value update
          await AsyncStorage.setItem(key, JSON.stringify(newValue));
  
          setStoredData((prev) => ({
            ...prev,
            [key]: newValue,
          }));
        }
      } else {
        // Bulk update (key is an object)
        await AsyncStorage.multiSet(
          Object.entries(key).map(([k, v]) => [k, JSON.stringify(v)])
        );
  
        setStoredData((prev) => ({
          ...prev,
          ...key,
        }));
      }
  
      console.log(`✅ Successfully updated AsyncStorage & Context!`);
    } catch (error) {
      console.error(`❌ Failed to save to AsyncStorage`, error);
    }
  };
  

  if (isLoading) {
    console.log("🔄 Storage is still loading...");
    return null; // Prevent rendering components until storage is loaded
  }

  //console.log("🚀 Final Stored Data in Context:", storedData);

  return (
    <StorageContext.Provider value={{ storedData, updateStoredData }}>
      {children}
    </StorageContext.Provider>
  );
};

export default StorageContext;