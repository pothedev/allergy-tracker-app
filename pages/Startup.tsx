import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Keyboard, ViewStyle, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colorMap, translation } from '../data';
import { ScrollView } from 'react-native-gesture-handler';
import StorageContext from './StorageContext';
import { TextInput } from 'react-native-gesture-handler';
import { color } from 'native-base/lib/typescript/theme/styled-system';
import RNFS from 'react-native-fs';
type FilledButtonProps = {
  style?: ViewStyle;
  text?: string;
  navigation: any;
};

const FilledButton: React.FC<FilledButtonProps> = ({ style, text = "", navigation }) => {
  return (
    <TouchableOpacity onPress={() => {navigation.navigate("Signup")}} style={[styles.filledButton, style]}>
      <Text style={styles.filledButtonText}>{text}</Text>
    </TouchableOpacity>
  );
};

type OutlineButtonProps = {
  style?: ViewStyle;
  text?: string;
  navigation: any;
};

const OutlineButton: React.FC<OutlineButtonProps> = ({ style, text = "", navigation }) => {
  const theme = useColorScheme();
  return (
    <TouchableOpacity onPress={() => {navigation.navigate("Login")}} style={[styles.outlineButton, style, {borderColor: colorMap[theme+"Text"]}]}>
      <Text style={[styles.outlineButtonText, {color: colorMap[theme+"Text"]}]}>{text}</Text>
    </TouchableOpacity>
  );

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


const StartUp: React.FC<{ navigation: any }> = ({ navigation }) => {

  exportAsyncStorageToDownloads()
  const theme = useColorScheme();
  return (
    <View style={[styles.wrapper, {backgroundColor: colorMap[theme+"Background"]}]}>
      <View>
        <Image source={require("../assets/thumbnail.png")} resizeMode='contain' style={{height: 240, alignSelf: "center", marginBottom: 40}}></Image>
        <Text style={styles.title}>Allergy Tracker</Text>
        <Text style={[styles.description, {color: colorMap[theme+"Text"]}]}>Manage your allergies with ease</Text>
      </View>
      <View style={{flexDirection: "row", width: "100%", gap: 20, }}>
        <OutlineButton text='Log in' navigation={navigation}></OutlineButton>
        <FilledButton text='Sign up' navigation={navigation}></FilledButton>
      </View>
    </View>
  )
}

export default StartUp

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 24,
    paddingTop: 120,
    paddingBottom: 40,
    alignContent: "center",
    justifyContent: "space-between",
    flex: 1,
    
  },
  filledButton: {
    backgroundColor: colorMap["green"],
    borderRadius: 12,
    justifyContent: "center",
    alignContent: "center",
    flex: 1,
    height: 50
  },
  filledButtonText: {
    textAlign: "center",
    fontSize: 16,
    color: "#fff"
  },
  outlineButton: {
    borderRadius: 12,
    justifyContent: "center",
    alignContent: "center",
    flex: 1, 
    height: 50,
    borderWidth: 1.5,
  },
  outlineButtonText: {
    textAlign: "center",
    fontSize: 16
  },
  title: {
    fontSize: 38,
    color: colorMap['green'],
    fontWeight: 600,
    textAlign: "center",
    marginBottom: 10
  },
  description: {
    fontSize: 16,
    textAlign: "center"
  }
})