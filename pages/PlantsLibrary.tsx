import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { colorMap, translation, intensityColor } from '../data';
import { ScrollView } from 'native-base';
import { Dimensions } from 'react-native';
import ragweedImage from "../assets/ragweed.png";
import mugwortImage from "../assets/mugwort.png";
import birchImage from "../assets/birch.png";
import poplarImage from "../assets/poplar.png";
import nettleImage from "../assets/nettle.png";
import timothyImage from "../assets/timothy.png";
import goosefootImage from "../assets/goosefoot.png";
import alderImage from "../assets/alder.png";
import StorageContext from "./StorageContext";

import { ImageSourcePropType } from 'react-native';

const { width } = Dimensions.get('window'); // Get device width dynamically
const containerWidth = (width - 30) / 2 - 15; // 30px padding + 10px gap adjustment

export const plantImages: Record<string, ImageSourcePropType> = {
  ragweed: ragweedImage,
  mugwort: mugwortImage,
  birch: birchImage,
  poplar: poplarImage,
  nettle: nettleImage,
  timothy: timothyImage,
  goosefoot: goosefootImage,
  alder: alderImage
};

const PlantsLibrary: React.FC<{ navigation: any }> = ({ navigation }) => {
  //const [currentlyBlooming, setCurrentlyBlooming] = useState<any[]>([]);

  const storage = useContext(StorageContext);
  if (!storage) return null;
  const { storedData } = storage

  const currentlyBlooming = storedData.currentlyBlooming
  const language = storedData.language
  const theme = storedData.theme


  const getIntensity = (plant: string) => {
    const foundPlant = currentlyBlooming.find((p) => p.name.toLowerCase() === plant);
    return foundPlant ? foundPlant.intensity : 'Not in season';
  };

  return (
    <ScrollView>
      <View style={[styles.container, { backgroundColor: colorMap[theme + "Background"] }]}>
        <View style={styles.header}>
          <Text style={[styles.headerText, { color: colorMap[theme + "Text"] }]}>{translation[language]["Plants library"]}</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Home")}>
            <Text style={styles.doneText}>{translation[language]["Back"]}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.plants}>
          <Plant plant="alder" intensity={getIntensity('alder')} navigation={navigation}></Plant>
          <Plant plant="ragweed" intensity={getIntensity('ragweed')} navigation={navigation}></Plant>
          <Plant plant="mugwort" intensity={getIntensity('mugwort')} navigation={navigation}></Plant>
          <Plant plant="birch" intensity={getIntensity('birch')} navigation={navigation}></Plant>
          <Plant plant="poplar" intensity={getIntensity('poplar')} navigation={navigation}></Plant>
          <Plant plant="timothy" intensity={getIntensity('timothy')} navigation={navigation}></Plant>
          <Plant plant="nettle" intensity={getIntensity('nettle')} navigation={navigation}></Plant>
          <Plant plant="goosefoot" intensity={getIntensity('goosefoot')} navigation={navigation}></Plant>
          
        </View>
      </View>
    </ScrollView>
  );
};

const Plant: React.FC<{ plant: string; intensity: string, navigation: any}> = ({
  plant,
  intensity,
  navigation
}) => {

  const imageSource = plantImages[plant] || ragweedImage;

  const storage = useContext(StorageContext);
  if (!storage) return null;
  const { storedData } = storage

  const language = storedData.language
  const theme = storedData.theme

  return (
    <TouchableOpacity onPress={() => navigation.navigate("PlantInfo", { plant })}>
      <View style={[styles.plantContainer, { backgroundColor: colorMap[theme + 'Widget'] }]}>
        <Image source={imageSource} style={styles.plantImage} resizeMode="contain"/>
        <Text style={[styles.plantTitle, { color: colorMap[theme + 'Text'] }]}>{translation[language][plant]}</Text>
        <Text style={[styles.intensityText, { color: intensityColor[intensity] }]}>{translation[language][intensity]}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default PlantsLibrary;

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
  plants: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between", // Distribute containers evenly
    marginTop: 20,
  },
  plantContainer: {
    width: containerWidth, // Dynamic width
    height: 230,
    borderRadius: 15,
    marginBottom: 10, // Margin between rows
    padding: 15,
    alignContent: "center",
    backgroundColor: '#fff', // Ensure color for testing
  },
  plantImage: {
    width: 90,
    height: 150,
    alignSelf: "center",
  },
  plantTitle: {
    fontSize: 20,
    textAlign: "center",
  },
  intensityText: {
    fontSize: 17,
    textAlign: "center",
  },
});
