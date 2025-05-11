import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ViewStyle,
  useColorScheme,
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colorMap, translation } from '../data';
import StorageContext from './StorageContext';
import { TextInput } from 'react-native-gesture-handler';

import emailIcon from '../assets/email2.png';
import lockIcon from '../assets/lock2.png';
import accountIcon from '../assets/account1.png';

import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { background } from 'native-base/lib/typescript/theme/styled-system';

type FilledButtonProps = {
  style?: ViewStyle;
  text?: string;
  onPress?: any;
  disabled?: boolean;
};

const FilledButton: React.FC<FilledButtonProps> = ({ style, text = "", onPress, disabled = false }) => {
  return (
    <TouchableOpacity
      style={[styles.filledButton, style, disabled && { opacity: 0.5 }]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.filledButtonText}>{text}</Text>
    </TouchableOpacity>
  );
};

type OutlineButtonProps = {
  style?: ViewStyle;
  text?: string;
  onPress?: any;
};

const OutlineButton: React.FC<OutlineButtonProps> = ({ style, text = "", onPress }) => {
  const theme = useColorScheme();
  return (
    <TouchableOpacity style={[styles.outlineButton, style, { borderColor: colorMap[theme + "Text"] }]} onPress={onPress}>
      <Text style={[styles.outlineButtonText, { color: colorMap[theme + "Text"] }]}>{text}</Text>
    </TouchableOpacity>
  );
};

type InputFieldProps = {
  style?: ViewStyle;
  placeholder?: string;
  image: any;
  value?: string;
  onChangeText: any;
  eye?: boolean;
  showPassword?: boolean;
  setShowPassword?: any;
  tempPassword?: string;
  placeholderColor?: string;
};

const InputField: React.FC<InputFieldProps> = ({
  style,
  placeholder = "",
  image,
  value = "",
  onChangeText,
  eye = false,
  showPassword = true,
  setShowPassword,
  tempPassword = "",
  placeholderColor = "#888"
}) => {
  const theme = useColorScheme();
  return (
    <View style={[style, {backgroundColor: colorMap[theme+"Widget"], borderRadius: 16}]}>
      <Image source={image} resizeMode='contain' style={{ width: 22, marginRight: 10, tintColor: colorMap[theme + "Text"] }} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={colorMap[theme+"Text2"]}
        style={{ width: '100%', color: colorMap[theme + "Text"] }}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!showPassword}
      />
      {(eye && tempPassword.length > 0 && showPassword) && (
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Image
            source={require("../assets/eye.png")}
            resizeMode='contain'
            style={{ height: 20, marginHorizontal: 10, tintColor: colorMap[theme + "Text"] }}
          />
        </TouchableOpacity>
      )}
      {(eye && tempPassword.length > 0 && !showPassword) && (
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Image
            source={require("../assets/crossed_eye.png")}
            resizeMode='contain'
            style={{ height: 20, marginHorizontal: 10, tintColor: colorMap[theme + "Text"] }}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const Signup: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  const storage = useContext(StorageContext);
  if (!storage) return null;
  const { updateStoredData, storedData } = storage;

  const theme = useColorScheme();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  const textColor = colorMap[theme + "Text"];
  const textColor2 = colorMap[theme + "Text2"]; // gray
  const placeholderColor = colorMap[theme + "Text2"];

  const handleSignup = async () => {
    let valid = true;
  
    setNameError(null);
    setEmailError(null);
    setPasswordError(null);
  
    if (!name.trim()) {
      setNameError("Name cannot be empty");
      valid = false;
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Invalid email format");
      valid = false;
    }
  
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      valid = false;
    }
  
    if (!valid) return;
  
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    try {
      updateStoredData('pendingProfileSetup', 'true');
      await sleep(300);

      const latest = await AsyncStorage.getItem('pendingProfileSetup');
      console.log("latest in Sign up", latest);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      await updateProfile(user, { displayName: name });
  
      console.log("✅ User signed up:", user.uid);
  
      navigation.navigate("AllergyProfile", {
        name: name,
        email: user.email,
        uid: user.uid,
      });
  
    } catch (error: any) {
      console.error("❌ Signup failed:", error.message);
    }
  };

  return (
    <ScrollView style={[styles.wrapper, { backgroundColor: colorMap[theme + "Background"] }]}>
      <TouchableOpacity onPress={() => { navigation.goBack() }}>
        <Image 
          source={require('../assets/arrow-left.png')} 
          resizeMode='contain' 
          style={{ height: 22, marginTop: 20, marginLeft: -8, tintColor: textColor }} 
        />
      </TouchableOpacity>

      <Text style={[styles.title, { color: textColor }]}>Sign up</Text>
      <Text style={[styles.description, { color: textColor }]}>Let's get started on your journey!</Text>

      <Text style={{ color: textColor }}>Please enter your name</Text>
      <InputField
        placeholder='Name'
        placeholderColor={placeholderColor}
        image={accountIcon}
        style={[styles.inputField, { backgroundColor: colorMap[theme + "InputBackground"] }]}
        onChangeText={setName}
        value={name}
      />
      {nameError && <Text style={{ color: colorMap[theme+"Red"], marginTop: 4 }}>{nameError}</Text>}

      <Text style={{ marginTop: 24, color: textColor }}>Enter your email</Text>
      <InputField
        placeholder='Email'
        placeholderColor={placeholderColor}
        image={emailIcon}
        style={[styles.inputField, { backgroundColor: colorMap[theme + "Widget"] }]}
        onChangeText={setEmail}
        value={email}
      />
      {emailError && <Text style={{ color: colorMap[theme+"Red"], marginTop: 4 }}>{emailError}</Text>}

      <Text style={{ marginTop: 24, color: textColor }}>Enter your password</Text>
      <InputField
        placeholder='Password'
        placeholderColor={placeholderColor}
        image={lockIcon}
        style={[styles.inputField, { backgroundColor: colorMap[theme + "InputBackground"]}]}
        onChangeText={setPassword}
        value={password}
        eye={true}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        tempPassword={password}
      />
      {passwordError && <Text style={{ color: colorMap[theme+"Red"], marginTop: 4 }}>{passwordError}</Text>}

      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 30 }}>
        <TouchableOpacity
          onPress={() => setAgreed(!agreed)}
          style={{
            width: 20,
            height: 20,
            borderWidth: 2,
            borderColor: !agreed ? textColor2 : colorMap["green"],
            backgroundColor: agreed ? colorMap["green"] : "transparent",
            borderRadius: 4,
            marginRight: 12,
          }}
        />
        <Text style={{ flexWrap: "wrap", flexShrink: 1, color: textColor }}>
          I agree to the{" "}
          <Text
            style={{ color: colorMap["green"], textDecorationLine: "underline" }}
            onPress={() => navigation.navigate("PrivacyPolicy")}
          >
            Privacy Policy
          </Text>
        </Text>
      </View>

      <FilledButton 
        text='Sign up' 
        onPress={handleSignup} 
        style={{ marginTop: 60, opacity: agreed ? 1 : 0.5}}  
        disabled={!agreed} 
      />

      <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 16 }}>
        <Text style={{ marginRight: 4, color: textColor }}>Already have an account?</Text>
        <TouchableOpacity onPress={() => { navigation.navigate("Login") }}>
          <Text style={{ color: colorMap["green"], fontWeight: "500" }}>Log in</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Signup;

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    flex: 1,
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
    color: "#fff"
  },
  outlineButton: {
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    borderWidth: 1.5,
  },
  outlineButtonText: {
    textAlign: "center",
    fontSize: 16
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 30
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
    marginBottom: 50
  },
  inputField: {
    flexDirection: "row",
    borderRadius: 16,
    paddingLeft: 12,
    height: 50,
    alignItems: "center",
    marginTop: 8,
  }
});