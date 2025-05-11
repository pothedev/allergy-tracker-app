import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Keyboard, ViewStyle, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colorMap, translation } from '../data';
import StorageContext from './StorageContext';
import { TextInput } from 'react-native-gesture-handler';
import { color } from 'native-base/lib/typescript/theme/styled-system';

import emailIcon from '../assets/email2.png';
import lockIcon from '../assets/lock2.png';

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebaseConfig";

import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { doc, getDoc } from "firebase/firestore";

import { PERMISSIONS, RESULTS, request } from 'react-native-permissions';
import axios from 'axios';
import GetLocation from 'react-native-get-location';


type FilledButtonProps = {
  style?: ViewStyle;
  text?: string;
  onPress?: () => void;
};


const FilledButton: React.FC<FilledButtonProps> = ({ style, text = "", onPress }) => {
  return (
    <TouchableOpacity style={[styles.filledButton, style]} onPress={onPress}>
      <Text style={styles.filledButtonText}>{text}</Text>
    </TouchableOpacity>
  );
};


type OutlineButtonProps = {
  style?: ViewStyle;
  text?: string;
  navigation: any;
};

const OutlineButton: React.FC<OutlineButtonProps> = ({ style, text = "" }) => {
  const theme = useColorScheme();
  return (
    <TouchableOpacity style={[styles.outlineButton, style, {borderColor: colorMap[theme+"Text"]}]}>
      <Text style={[styles.outlineButtonText, {color: colorMap[theme+"Text"]}]}>{text}</Text>
    </TouchableOpacity>
  );
}; 


type InputFieldProps = {
  style?: ViewStyle;
  placeholder?: string;
  image: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
};

const InputField: React.FC<InputFieldProps> = ({ style, placeholder = "", image, value = "", onChangeText, secureTextEntry = false }) => {
  const theme = useColorScheme();
  return (
    <View style={[style, { backgroundColor: colorMap[theme+"Widget"]}]}>
      <Image source={image} resizeMode='contain' style={{ width: 24, marginRight: 10 }} />
      <TextInput
        placeholder={placeholder}
        style={{ width: '100%', color: colorMap[theme+"Text"]}}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
};


const LocationPanel: React.FC<{
  theme: string;
  onAllow: () => void;
  onDeny: () => void;
}> = ({ theme, onAllow, onDeny }) => (
  <View style={[styles.logoutPanel, { backgroundColor: colorMap[theme + "Widget"] }]}>
    <Text style={{ color: colorMap[theme + "Text"], fontSize: 18, fontWeight: 'semibold', textAlign: "center" }}>Personalized Allergy Predictions</Text>
    <Text style={{ color: colorMap[theme + "Text2"], fontSize: 14, marginBottom: 20, marginTop: 20 }}>
    To provide accurate pollen forecasts tailored to your region, this app needs access to your device’s location.
    Your location data helps determine the specific allergy risks in your area based on local environmental conditions.
    </Text>
    <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", marginTop: 10 }}>
      <TouchableOpacity style={[styles.deleteButton, { borderColor: colorMap[theme + "Widget4"] }]} onPress={onDeny}>
        <Text style={{ color: colorMap[theme + "Text"], fontWeight: "semibold", textAlign: "center" }}>Deny</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelButton} onPress={onAllow}>
        <Text style={{ color: colorMap["darkText"], fontWeight: "semibold", textAlign: "center" }}>Allow</Text>
      </TouchableOpacity>
    </View>
  </View>
);



const Login: React.FC<{ navigation: any; setLoggedIn:any}> = ({ navigation, setLoggedIn}) => {
  const theme1 = useColorScheme();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");

  const [showLocationPanel, setShowLocationPanel] = useState(false);

  const storage = useContext(StorageContext);
  if (!storage) return null;
  const { storedData, updateStoredData } = storage

  ***REMOVED***

  const textColor = colorMap[theme1+"Text"]
  const textColor1 = colorMap[theme1+"Text"]


  const handleLocationAllow = async () => {
    setShowLocationPanel(false);
    try {
      const result = await request(PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION);
      if (result === RESULTS.GRANTED) {
        const location = await GetLocation.getCurrentPosition();
        const newLat = location.latitude.toString();
        const newLon = location.longitude.toString();
  
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${newLat},${newLon}&key=${geocodingApiKey}`;
        const response = await axios.get(url);
        const cityName = response.data.results[0]?.components?.city || 'Unknown City';
  
        updateStoredData("city", cityName);
        updateStoredData("latitude", newLat);
        updateStoredData("longitude", newLon);
      }
    } catch (error) {
      console.error("Location permission failed:", error);
    } finally {
      setLoggedIn(true);
    }
  };
  
  const handleLocationDeny = () => {
    setShowLocationPanel(false);
    setLoggedIn(true);
  };
  

  const handleLogin = async () => {
    let hasError = false;
  
    // Reset previous errors
    setEmailError("");
    setPasswordError("");
  
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Invalid email address.");
      hasError = true;
    }
  
    // Password validation
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      hasError = true;
    }
  
    if (hasError) return;

      const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    try {
      //await AsyncStorage.setItem('pendingProfileSetup', 'true');
      updateStoredData('pendingProfileSetup', 'true');
      await sleep(300);

      const latest = await AsyncStorage.getItem('pendingProfileSetup');
      console.log("latest in Log in", latest);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      console.log("✅ Logged in:", user.uid);
  
      // 🔽 Get Firestore data
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
  
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const { name, levels, theme, language} = userData;
  
        console.log("📦 Retrieved Firestore data:", userData);
  
        // Save to local storage or context
        updateStoredData("name", name);
        updateStoredData("levels", levels);
        updateStoredData("email", user.email);
        updateStoredData("uid", user.uid);
        updateStoredData("language", language); 
        updateStoredData("theme", theme); 

        setShowLocationPanel(true);
  
        //setLoggedIn(true);
      } else {
        console.error("❌ No user document found in Firestore.");
      }
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        setEmailError("No user found with this email.");
      } else if (err.code === "auth/wrong-password") {
        setPasswordError("Incorrect password.");
      } else if (err.code === "auth/invalid-credential"){
        setEmailError("No account found with this email.");
      } else {
        console.error("❌ Login error:", err.message);
      }
    }
  };
  
  
  
  return (
    <View style={{ flex: 1, position: "relative" }}>
      <View style={[styles.wrapper, {backgroundColor: colorMap[theme1+"Background"]}]}>
        <TouchableOpacity onPress={() => {navigation.goBack()}}>
          <Image source={require('../assets/arrow-left.png')} resizeMode='contain' style={{height: 22, marginTop: 20, marginLeft: -8}}></Image>
        </TouchableOpacity>

        <Text style={[styles.title, {color: textColor}]}>Log in</Text>
        <Text style={[styles.description, {color: textColor}]}>Welcome back, you have been missed!</Text>

        <Text style={{color: textColor}} >Please enter your email</Text>
        <InputField
          placeholder="Email"
          image={emailIcon}
          style={styles.inputField}
          value={email}
          onChangeText={setEmail}
        />
        {emailError ? <Text style={{ color: colorMap[theme1+"Red"], marginTop: 4 }}>{emailError}</Text> : null}
        <Text style={{marginTop: 24, color: textColor}}>Enter your password</Text>
        <InputField
          placeholder="Password"
          image={lockIcon}
          style={styles.inputField}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {passwordError ? <Text style={{ color: colorMap[theme1+"Red"], marginTop: 4 }}>{passwordError}</Text> : null}

        <FilledButton text='Log in' style={{marginTop: 80}} onPress={handleLogin} />

        <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 16 }}>
          <Text style={{ marginRight: 4, color: textColor}}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => {navigation.navigate("Signup")}}>
            <Text style={{ color: colorMap["green"], fontWeight: "500" }}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>  
      {/* Tint */}
      {showLocationPanel && (
        <View style={{height: "100%", width: "100%", position: "absolute", zIndex: 1, backgroundColor: "rgba(0, 0, 0, 0.42)"}}></View>
      )}

      {/* Panels */}
      {showLocationPanel && (
        <LocationPanel onAllow={handleLocationAllow} onDeny={handleLocationDeny} theme={theme1 || 'light'}></LocationPanel>
      )}
    </View>
  )
}

export default Login

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    alignContent: "center",
    //justifyContent: "space-between",
    flex: 1,
  },
  filledButton: {
    backgroundColor: colorMap["green"],
    borderRadius: 16,
    justifyContent: "center",
    alignContent: "center",
    height: 50,
  },
  filledButtonText: {
    textAlign: "center",
    fontSize: 17,
    fontWeight: 500,
    color: "#fff"
  },
  outlineButton: {
    borderRadius: 12,
    justifyContent: "center",
    alignContent: "center",
    height: 50,
    borderWidth: 1.5,
  },
  outlineButtonText: {
    textAlign: "center",
    fontSize: 16
  },
  title: {
    fontSize: 34,
    fontWeight: 700,
    textAlign: "center",
    marginBottom: 20,
    marginTop: 30
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    fontWeight: 500,
    marginBottom: 60
  },
  inputField: {
    flexDirection: "row",
    backgroundColor: "#E7E7E7",
    borderRadius: 16,
    paddingLeft: 12,
    height: 50,
    alignItems: "center",
    marginTop: 8,
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
})