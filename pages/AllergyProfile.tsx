import { View, Text, StyleSheet, TouchableOpacity, Image, useColorScheme, NativeSyntheticEvent, NativeScrollEvent, ScrollView, ViewStyle, Animated, } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import React, { useState, useContext} from 'react';
import { colorMap } from '../data';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StorageContext from './StorageContext';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { PERMISSIONS, RESULTS, request } from 'react-native-permissions';
import GetLocation from 'react-native-get-location';
import axios from 'axios';


import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";


const levelMap: Record<number, string> = {
  0: '#6F6F6F',
  1: '#274E0A',
  2: '#3F890A',
  3: '#DFB009',
  4: '#D87803',
  5: '#B60C17',
};  

const handleFinish = async (
  theme: string,
  allergensMap: any,
  name: string,
  email: string,
  password: string,
  navigation: any,
  updateStoredData: any,
  setLoggedIn: any,
  setShowLocationConsent: any
) => {
  try {
    const plantLevels = Object.fromEntries(
      Object.entries(allergensMap).map(([plant, data]) => [
        plant.toLowerCase(),
        data.level,
      ])
    );

    const user = auth.currentUser;
    if (!user) {
      console.error("❌ No authenticated user found");
      return;
    }

    const uid = user.uid;

    // Store in AsyncStorage
    updateStoredData("name", name);
    updateStoredData("levels", plantLevels);
    updateStoredData("language", "en");
    updateStoredData("theme", theme);
    updateStoredData("email", email);
    updateStoredData("uid", uid);

    setShowLocationConsent(true);

    // Save in Firestore
    await setDoc(doc(db, "users", uid), {
      name,
      email,
      levels: plantLevels,
      language: "en",
      theme: theme,
      createdAt: new Date(),
    }); 

    console.log("✅ Firestore profile saved for", uid);
    
    // setTimeout(() => {
    //   setLoggedIn(true);
    // }, 100);
  } catch (err: any) {
    console.error("❌ Failed to save profile:", err.message);
  }
};

type FilledButtonProps = {
  style?: ViewStyle;
  text?: string;
  onPress: any;
};

const FilledButton: React.FC<FilledButtonProps> = ({ style, text = "", onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.filledButton, style]}>
      <Text style={styles.filledButtonText}>{text}</Text>
    </TouchableOpacity>
  );
};

type AllergenState = {
  [key: string]: {
    level: number;
    lastLevel: number;
  };
};

type AllergenRowProps = {
  allergen: string;
  allergenLevel: number;
  lastAllergenLevel: number;
  setAllergenLevel: (level: number) => void;
  setLastAllergenLevel: (level: number) => void;
  theme:string;
};

const AllergenRow: React.FC<AllergenRowProps> = ({
  allergen,
  allergenLevel,
  setAllergenLevel,
  lastAllergenLevel,
  setLastAllergenLevel,
  theme
}) => {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity
          style={[styles.levelBox, (allergenLevel === 0 ? {borderWidth: 2, borderColor: levelMap[0]} : {backgroundColor: levelMap[allergenLevel]})]}
          onPress={() => {
            if (allergenLevel > 0) {
              setLastAllergenLevel(allergenLevel);
              setAllergenLevel(0);
            }
            else if (lastAllergenLevel === 0) {
              setAllergenLevel(1)
            }
            else {
              setAllergenLevel(lastAllergenLevel);
            }
          }}
        />
        <Text style={{ marginLeft: 10, color: colorMap[theme+"Text"] }}>{allergen}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => setAllergenLevel(Math.max(0, allergenLevel - 1))}>
          <Image source={require('../assets/minus.png')} resizeMode="contain" style={{ width: 20, height: 20, marginRight: 8 }} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setAllergenLevel(Math.min(5, allergenLevel + 1))}>
          <Image source={require('../assets/plus.png')} resizeMode="contain" style={{ width: 20, height: 20 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
};


const LocationPanel: React.FC<{
  theme: string;
  onAllow: () => void;
  onDeny: () => void;
}> = ({ theme, onAllow, onDeny }) => {
  
  return (
    <View style={[styles.logoutPanel, {backgroundColor: colorMap[theme+"Widget"]}]}>
      <Text style={[{color: colorMap[theme+"Text"], fontSize: 18, fontWeight: 'semibold', textAlign: "center"}]}>Personalized Allergy Predictions</Text>
      <Text style={[{color: colorMap[theme+"Text2"], fontSize: 14, marginBottom: 20, marginTop: 20}]}>
      To provide accurate pollen forecasts tailored to your region, this app needs access to your device’s location.
      Your location data helps determine the specific allergy risks in your area based on local environmental conditions.
      </Text>
      <View style={{flexDirection: "row", justifyContent: "space-between", width: "100%", marginTop: 10}}>
        <TouchableOpacity style={[styles.deleteButton, {borderColor: colorMap[theme+"Widget4"]}]} onPress={onDeny}>
          <Text style={{color: colorMap[theme+"Text"], fontWeight: "semibold", textAlign: "center"}}>Deny</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={onAllow}>
          <Text style={{color: colorMap["darkText"], fontWeight: "semibold", textAlign: "center"}}>Allow</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}


const AllergyProfile: React.FC<{ route: any; navigation: any; setLoggedIn:any }> = ({ route, navigation, setLoggedIn }) => {
  const { name, email, password } = route.params;
  const theme = useColorScheme();

  const [showLocationPanel, setShowLocationPanel] = useState(false);

  const storage = useContext(StorageContext);
  const { updateStoredData } = storage;  

  const textColor = colorMap[theme+"Text"]
  const textColor2 = colorMap[theme+"Text2"]

  const allergenList = [
    'Ragweed',
    'Mugwort',
    'Birch',
    'Oak',
    'Alder',
    'Poplar',
    'Timothy',
    'Goosefoot',
    'Nettle',
    'Plantain',
  ];

  const [allergens, setAllergens] = useState<AllergenState>(
    Object.fromEntries(allergenList.map((a) => [a, { level: 0, lastLevel: 0 }]))
  );

  const updateAllergen = (name: string, newLevel: number, saveLast: boolean = false) => {
    setAllergens((prev) => ({
      ...prev,
      [name]: {
        level: newLevel,
        lastLevel: saveLast ? prev[name].level : prev[name].lastLevel,
      },
    }));
  };

  ***REMOVED***


  const handleLocationAllow = async () => {
    setShowLocationPanel(false);
    try {
      const result = await request(PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION);
      if (result === RESULTS.GRANTED) {
        const location = await GetLocation.getCurrentPosition();
        const newLat = location.latitude.toString();
        const newLon = location.longitude.toString();
        
        // Get city name
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${newLat},${newLon}&key=${geocodingApiKey}`;
        const response = await axios.get(url);
        const cityName = response.data.results[0]?.components?.city || 'Unknown City';

        updateStoredData("city", cityName);
        updateStoredData("latitude", newLat);
        updateStoredData("longitude", newLon);
      }
    } catch (error) {
      console.error('Location fetch failed:', error);
    } finally {
      console.log("allowed, redirecting")
      setLoggedIn(true);
    }
  };

  const handleLocationDeny = () => {
    setShowLocationPanel(false);
    console.log("denied, redirecting")
    setLoggedIn(true);
    // Kyiv coordinates already set by default
  };


  return (
    <View style={{ flex: 1, position: "relative" }}>
      <View style={[styles.wrapper, { backgroundColor: colorMap[theme + 'Background'] }]}>
        <View>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require('../assets/arrow-left.png')}
              resizeMode="contain"
              style={{ height: 22, marginTop: 20, marginLeft: -8 }}
            />
          </TouchableOpacity>

          <Text style={[styles.title, {color: textColor}]}>Hello, {name}!</Text>
          <Text style={[styles.description, {color: textColor2}]}>
            To finish creating your account you need to mark plants you are allergic to
          </Text>
          <Image
            source={require('../assets/allergy_profile.png')}
            resizeMode="contain"
            style={{ height: 150, width: 150, alignSelf: 'center' }}
          />
          <ScrollView style={{height: 260}} showsVerticalScrollIndicator={false}>
            {Object.entries(allergens).map(([name, data]) => (
              <AllergenRow
                key={name}
                allergen={name}
                allergenLevel={data.level}
                lastAllergenLevel={data.lastLevel}
                setAllergenLevel={(val) => updateAllergen(name, val)}
                setLastAllergenLevel={(val) => updateAllergen(name, val, true)}
                theme={theme || 'light'}
              />
            ))}
          </ScrollView>  
        </View>
        <FilledButton text='Finish' onPress={()=>{handleFinish(theme || 'light', allergens, name, email, password, navigation, updateStoredData, setLoggedIn, setShowLocationPanel)}} style={{marginTop: 0}}></FilledButton>
        
        
      </View>
      {/* Tint */}
      {showLocationPanel && (
        <View style={{height: "100%", width: "100%", position: "absolute", zIndex: 1, backgroundColor: "rgba(0, 0, 0, 0.42)"}}></View>
      )}

      {/* Panels */}
      {showLocationPanel && (
        <LocationPanel onAllow={handleLocationAllow} onDeny={handleLocationDeny} theme={theme || 'light'}></LocationPanel>
      )}
    </View>
  );
};

export default AllergyProfile;

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    flex: 1,
    justifyContent: "space-between"
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 30,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 20,
  },
  levelBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  filledButton: {
    backgroundColor: colorMap["green"],
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    height: 50,
  },
  filledButtonText: {
    textAlign: "center",
    fontSize: 16,
    color: "#fff"
  },
  logoutPanel: {
    position: 'absolute',
    zIndex: 2,
    top: '30%', 
    left: '50%',
    transform: [{ translateX: -150 }],
    width: 300, 
    padding: 20,
    paddingBottom: 20,
    borderRadius: 18
  },
  deleteButton: {
    borderColor: "#4b4b4b",
    borderWidth: 1,
    borderRadius: 12,
    height: 40,
    width: 120, 
    alignContent: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colorMap["green"],
    borderRadius: 12,
    height: 40,
    width: 120, 
    alignContent: 'center',
    justifyContent: 'center',
  },
});