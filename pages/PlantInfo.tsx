import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { colorMap, translation, intensityColor, plantDescriptions, crossReactions, seasonDynamics} from '../data';
import { Hidden, ScrollView } from 'native-base';
//import AllergyLineChart from "./AllergyLineChart";

import ragweedImage from "../assets/ragweed.png"
import mugwortImage from "../assets/mugwort.png"
import birchImage from "../assets/birch.png"
import poplarImage from "../assets/poplar.png"
import nettleImage from "../assets/nettle.png"
import timothyImage from "../assets/timothy.png"
import goosefootImage from "../assets/goosefoot.png"
import alderImage from "../assets/alder.png"

import infoImage from "../assets/info.png"

import { ImageSourcePropType } from 'react-native';

import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

import StorageContext from './StorageContext';

const screenWidth = Dimensions.get("window").width;

import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme } from "victory";

const trans: Record<string, Record<number, string>> = {
  "ua": {
    0: "Динаміка сезону алергії",
    1: "Сезон алергії на амброзію зазвичай починається наприкінці липня або на початку серпня, досягає піку на початку чи в середині вересня та завершується до кінця жовтня.",
  },
  "en": {
    0: "Dynamics of the allergy season",
    1: "The ragweed allergy season often begins in late July or early August, peaks in early to mid-September, and ends by late October."
  }
  
}

const Hello: React.FC<{ theme: any; language: any; plant: string }> = ({ plant, theme, language}) => {
  if (plant == "alder"){
    return <AlderChart theme={theme} language={language}/>
  }
  if (plant == "ragweed"){
    return <RagweedChart theme={theme} language={language}/>
  }
  if (plant == "mugwort"){
    return <MugwortChart theme={theme} language={language}/>
  }
  if (plant == "birch"){
    return <BirchChart theme={theme} language={language}/>
  }
  if (plant == "poplar"){
    return <PoplarChart theme={theme} language={language}/>
  }
  if (plant == "nettle"){
    return <NettleChart theme={theme} language={language}/>
  }
  if (plant == "goosefoot"){
    return <GoosefootChart theme={theme} language={language}/>
  } 
  if (plant == "timothy"){
    return <TimothyChart theme={theme} language={language}/>
  }
  else{
    return <RagweedChart theme={theme} language={language}/>    
  }
}

const WeeklyIntensityChart: React.FC<{ theme: any; language: any; plant: string }> = ({
  theme,
  language,
  plant
}) => {
  
  const storage = useContext(StorageContext);
  if (!storage) return null;
  const { storedData } = storage

  const currentlyBlooming = storedData.currentlyBlooming
  // const language = storedData.language
  // const theme = storedData.theme
  
  const adjustedBloomingDates = storedData.adjustedBloomingDates
 

  const getWeekRange = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Calculate Monday

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6); // Calculate Sunday

    return { start: monday, end: sunday };
  };

  const getWeekdays = (start: Date) => {
    const weekdays: string[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      weekdays.push(date.toISOString().split("T")[0]); // Format as YYYY-MM-DD
    }
    return weekdays;
  };

  const getPlantIntensityForWeek = (plant: string, weekdays: string[]) => {
    const plantIntensity = adjustedBloomingDates[plant] || {};
    const intensitiesForWeek = weekdays.map((date) => {
      return plantIntensity[date] || 0; // Default to 0 if no intensity data is available
    });
    const sundayIntensity = intensitiesForWeek[intensitiesForWeek.length - 1] || 0;
    // Add dummy values (D1, D2, D3)
    const d1 = sundayIntensity || 0  // Previous day's intensity
    const d2 = 0; // Dummy value: 0 intensity
    const d3 = 5; // Dummy value: 5 intensity

    return [...intensitiesForWeek, d1, d2, d3];
  };

  const { start } = getWeekRange();
  const weekdays = getWeekdays(start); // Get range of weekdays starting from Monday
  const intensities = getPlantIntensityForWeek(plant, weekdays); // Get intensities for the given plant

  const chartData = {
    labels: weekdays.map((date) => {
      const day = new Date(date).getDay();
      return translation[language][["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day]] || date;
    }).concat(["D1", "D2", "D3"]), // Add dummy labels D1, D2, D3
    datasets: [
      {
        data: intensities,
        strokeWidth: 2,
        color: (opacity = 1) => `${colorMap["green"]}${opacity})`,
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: colorMap[theme + "Widget"],
    backgroundGradientTo: colorMap[theme + "Widget"],
    color: (opacity = 1) => colorMap[theme + "Text"],
    propsForBackgroundLines: {
      stroke: colorMap[theme + "Grid"], // Grid lines in teal with light opacity
      strokeDasharray: "6", // Optional: dashed grid lines
    },
    strokeWidth: 2, // Optional: Line thickness
    decimalPlaces: 0, // Number of decimal places
    propsForDots: {
      r: "5",
      strokeWidth: "2",
    },
  };

  return (
    <View style={[styles.container2, { backgroundColor: colorMap[theme + "Widget"] }]}>
      <View style={styles.mask}>
        <LineChart
          data={chartData}
          width={screenWidth + 110}
          height={220}
          chartConfig={chartConfig}
          style={[styles.chart, { backgroundColor: colorMap[theme + "Widget"] }]}
          segments={5}
        />
      </View>
    </View>
  );
};

const RagweedChart: React.FC<{ theme: any, language: any}> = ({ theme, language }) => {
  const chartData = {
    labels: [
      translation[language]["Jul"] || "Jul",
      translation[language]["Aug"] || "Aug",
      translation[language]["Sep"] || "Sep",
      translation[language]["Oct"] || "Oct",
      translation[language]["Nov"] || "Nov",
    ],
    datasets: [
      {
        data: [0, 0, 2, 4, 5, 4, 2, 0, 0], // Allergy intensity values
        strokeWidth: 2, // Line thickness
        color: (opacity = 1) => `${colorMap["green"]}${opacity})`, // Line color
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: colorMap[theme+"Widget"],
    backgroundGradientTo: colorMap[theme+"Widget"],
    color: (opacity = 1) => colorMap[theme+"Text"],
    propsForBackgroundLines: {
      stroke: colorMap[theme+"Grid"], // Grid lines in teal with light opacity
      strokeDasharray: "6" // Optional: dashed grid lines
    },
    strokeWidth: 2, // Optional: Line thickness
    decimalPlaces: 0, // Number of decimal places
    propsForDots: {
      r: "5",
      strokeWidth: "2",
    },
  };

  return (
    <View style={[styles.container2, {backgroundColor: colorMap[theme+"Widget"]}]}>
      <LineChart
        data={chartData}
        width={screenWidth - 53}
        height={220}
        chartConfig={chartConfig}
        // bezier
        style={[styles.chart, {backgroundColor: colorMap[theme+"Widget"]}]}
        segments={5}
      />
    </View>
  );
};

const AlderChart: React.FC<{ theme: any, language: any}> = ({ theme, language }) => {
  const chartData = {
    labels: [
      translation[language]["Jan"] || "Jan",
      translation[language]["Feb"] || "Feb",
      translation[language]["Mar"] || "Mar",
      translation[language]["Apr"] || "Apr",
    ],
    datasets: [
      {
        data: [0, 0, 2, 4, 5, 4, 2, 0, 0], // Allergy intensity values
        strokeWidth: 2, // Line thickness
        color: (opacity = 1) => `${colorMap["green"]}${opacity})`, // Line color
      }, 
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: colorMap[theme+"Widget"],
    backgroundGradientTo: colorMap[theme+"Widget"],
    color: (opacity = 1) => colorMap[theme+"Text"],
    propsForBackgroundLines: {
      stroke: colorMap[theme+"Grid"], // Grid lines in teal with light opacity
      strokeDasharray: "6" // Optional: dashed grid lines
    },
    strokeWidth: 2, // Optional: Line thickness
    decimalPlaces: 0, // Number of decimal places
    propsForDots: {
      r: "5",
      strokeWidth: "2",
    },
  };

  return (
    <View style={[styles.container2, {backgroundColor: colorMap[theme+"Widget"]}]}>
      <LineChart
        data={chartData}
        width={screenWidth - 53}
        height={220}
        chartConfig={chartConfig}
        // bezier
        style={[styles.chart, {backgroundColor: colorMap[theme+"Widget"]}]}
        segments={5}
      />
    </View>
  );
};

const MugwortChart: React.FC<{ theme: any, language: any}> = ({ theme, language }) => {
  const chartData = {
    labels: [
      translation[language]["Jul"] || "Jul",
      translation[language]["Aug"] || "Aug",
      translation[language]["Sep"] || "Sep",
      translation[language]["Oct"] || "Oct",
    ],
    datasets: [
      {
        data: [0, 0, 2, 4, 5, 4, 2, 0, 0], // Allergy intensity values
        strokeWidth: 2, // Line thickness
        color: (opacity = 1) => `${colorMap["green"]}${opacity})`, // Line color
      }, 
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: colorMap[theme+"Widget"],
    backgroundGradientTo: colorMap[theme+"Widget"],
    color: (opacity = 1) => colorMap[theme+"Text"],
    propsForBackgroundLines: {
      stroke: colorMap[theme+"Grid"], // Grid lines in teal with light opacity
      strokeDasharray: "6" // Optional: dashed grid lines
    },
    strokeWidth: 2, // Optional: Line thickness
    decimalPlaces: 0, // Number of decimal places
    propsForDots: {
      r: "5",
      strokeWidth: "2",
    },
  };

  return (
    <View style={[styles.container2, {backgroundColor: colorMap[theme+"Widget"]}]}>
      <LineChart
        data={chartData}
        width={screenWidth - 53}
        height={220}
        chartConfig={chartConfig}
        // bezier
        style={[styles.chart, {backgroundColor: colorMap[theme+"Widget"]}]}
        segments={5}
      />
    </View>
  );
};

const PoplarChart: React.FC<{ theme: any, language: any}> = ({ theme, language }) => {
  const chartData = {
    labels: [
      translation[language]["Jan"] || "Jan",
      translation[language]["Feb"] || "Feb",
      translation[language]["Mar"] || "Mar",
      translation[language]["Apr"] || "Apr",
      translation[language]["Ma"] || "May",
    ],
    datasets: [
      {
        data: [0, 0, 2, 4, 5, 4, 2, 0, 0], // Allergy intensity values
        strokeWidth: 2, // Line thickness
        color: (opacity = 1) => `${colorMap["green"]}${opacity})`, // Line color
      }, 
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: colorMap[theme+"Widget"],
    backgroundGradientTo: colorMap[theme+"Widget"],
    color: (opacity = 1) => colorMap[theme+"Text"],
    propsForBackgroundLines: {
      stroke: colorMap[theme+"Grid"], // Grid lines in teal with light opacity
      strokeDasharray: "6" // Optional: dashed grid lines
    },
    strokeWidth: 2, // Optional: Line thickness
    decimalPlaces: 0, // Number of decimal places
    propsForDots: {
      r: "5",
      strokeWidth: "2",
    },
  };

  return (
    <View style={[styles.container2, {backgroundColor: colorMap[theme+"Widget"]}]}>
      <LineChart
        data={chartData}
        width={screenWidth - 53}
        height={220}
        chartConfig={chartConfig}
        // bezier
        style={[styles.chart, {backgroundColor: colorMap[theme+"Widget"]}]}
        segments={5}
      />
    </View>
  );
};

const BirchChart: React.FC<{ theme: any, language: any}> = ({ theme, language }) => {
  const chartData = {
    labels: [
      translation[language]["Apr"] || "Apr",
      translation[language][" "] || " ",
      translation[language][" "] || " ",
      translation[language]["Ma"] || "May",
    ],
    datasets: [
      {
        data: [0, 0, 2, 4, 5, 4, 2, 0, 0], // Allergy intensity values
        strokeWidth: 2, // Line thickness
        color: (opacity = 1) => `${colorMap["green"]}${opacity})`, // Line color
      }, 
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: colorMap[theme+"Widget"],
    backgroundGradientTo: colorMap[theme+"Widget"],
    color: (opacity = 1) => colorMap[theme+"Text"],
    propsForBackgroundLines: {
      stroke: colorMap[theme+"Grid"], // Grid lines in teal with light opacity
      strokeDasharray: "6" // Optional: dashed grid lines
    },
    strokeWidth: 2, // Optional: Line thickness
    decimalPlaces: 0, // Number of decimal places
    propsForDots: {
      r: "5",
      strokeWidth: "2",
    },
  };

  return (
    <View style={[styles.container2, {backgroundColor: colorMap[theme+"Widget"]}]}>
      <LineChart
        data={chartData}
        width={screenWidth - 53}
        height={220}
        chartConfig={chartConfig}
        // bezier
        style={[styles.chart, {backgroundColor: colorMap[theme+"Widget"]}]}
        segments={5}
      />
    </View>
  );
};

const TimothyChart: React.FC<{ theme: any, language: any}> = ({ theme, language }) => {
  const chartData = {
    labels: [
      translation[language]["Apr"] || "Apr",
      translation[language]["Ma"] || "May",
      translation[language]["Jun"] || "Jun",
      translation[language]["Jul"] || "Jul",
    ],
    datasets: [
      {
        data: [0, 0, 2, 4, 5, 4, 2, 0, 0, 0], // Allergy intensity values
        strokeWidth: 2, // Line thickness
        color: (opacity = 1) => `${colorMap["green"]}${opacity})`, // Line color
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: colorMap[theme+"Widget"],
    backgroundGradientTo: colorMap[theme+"Widget"],
    color: (opacity = 1) => colorMap[theme+"Text"],
    propsForBackgroundLines: {
      stroke: colorMap[theme+"Grid"], // Grid lines in teal with light opacity
      strokeDasharray: "6" // Optional: dashed grid lines
    },
    strokeWidth: 2, // Optional: Line thickness
    decimalPlaces: 0, // Number of decimal places
    propsForDots: {
      r: "5",
      strokeWidth: "2",
    },
  };

  return (
    <View style={[styles.container2, {backgroundColor: colorMap[theme+"Widget"]}]}>
      <LineChart
        data={chartData}
        width={screenWidth - 53}
        height={220}
        chartConfig={chartConfig}
        // bezier
        style={[styles.chart, {backgroundColor: colorMap[theme+"Widget"]}]}
        segments={5}
      />
    </View>
  );
};

const NettleChart: React.FC<{ theme: any, language: any}> = ({ theme, language }) => {
  const chartData = {
    labels: [
      
      translation[language]["Jun"] || "Jun",
      translation[language]["Jul"] || "Jul",
      translation[language]["Aug"] || "Aug",
      translation[language]["Sep"] || "Sep",
      
    ],
    datasets: [
      {
        data: [0, 0, 2, 4, 5, 4, 2, 0,0 ], // Allergy intensity values
        strokeWidth: 2, // Line thickness
        color: (opacity = 1) => `${colorMap["green"]}${opacity})`, // Line color
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: colorMap[theme+"Widget"],
    backgroundGradientTo: colorMap[theme+"Widget"],
    color: (opacity = 1) => colorMap[theme+"Text"],
    propsForBackgroundLines: {
      stroke: colorMap[theme+"Grid"], // Grid lines in teal with light opacity
      strokeDasharray: "6" // Optional: dashed grid lines
    },
    strokeWidth: 2, // Optional: Line thickness
    decimalPlaces: 0, // Number of decimal places
    propsForDots: {
      r: "5",
      strokeWidth: "2",
    },
  };

  return (
    <View style={[styles.container2, {backgroundColor: colorMap[theme+"Widget"]}]}>
      <LineChart
        data={chartData}
        width={screenWidth - 53}
        height={220}
        chartConfig={chartConfig}
        // bezier
        style={[styles.chart, {backgroundColor: colorMap[theme+"Widget"]}]}
        segments={5}
      />
    </View>
  );
};

const GoosefootChart: React.FC<{ theme: any, language: any}> = ({ theme, language }) => {
  const chartData = {
    labels: [
      
      translation[language]["Jun"] || "Jun",
      translation[language]["Jul"] || "Jul",
      translation[language]["Aug"] || "Aug",
      translation[language]["Sep"] || "Sep",
      translation[language]["Oct"] || "Oct",
      
    ],
    datasets: [
      {
        data: [0, 0, 2, 4, 5, 4, 2, 0], // Allergy intensity values
        strokeWidth: 2, // Line thickness
        color: (opacity = 1) => `${colorMap["green"]}${opacity})`, // Line color
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: colorMap[theme+"Widget"],
    backgroundGradientTo: colorMap[theme+"Widget"],
    color: (opacity = 1) => colorMap[theme+"Text"],
    propsForBackgroundLines: {
      stroke: colorMap[theme+"Grid"], // Grid lines in teal with light opacity
      strokeDasharray: "6" // Optional: dashed grid lines
    },
    strokeWidth: 2, // Optional: Line thickness
    decimalPlaces: 0, // Number of decimal places
    propsForDots: {
      r: "5",
      strokeWidth: "2",
    },
  };

  return (
    <View style={[styles.container2, {backgroundColor: colorMap[theme+"Widget"]}]}>
      <LineChart
        data={chartData}
        width={screenWidth - 53}
        height={220}
        chartConfig={chartConfig}
        // bezier
        style={[styles.chart, {backgroundColor: colorMap[theme+"Widget"]}]}
        segments={5}
      />
    </View>
  );
};

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

const PlantInfo: React.FC<{ route: any, navigation: any}> = ({ route, navigation }) => {
  const { plant } = route.params; // Extract the plant parameter


  const storage = useContext(StorageContext);
  if (!storage) return null;
  const { storedData } = storage

  const language = storedData.language
  const theme = storedData.theme

  return (
    <ScrollView style={[styles.container, {backgroundColor: colorMap[theme+"Background"]}]}>
      <View style={styles.header}>
        <Text style={[styles.headerText, {color: colorMap[theme+"Text"]}]}>{translation[language]["Plants library"]}</Text>
        <TouchableOpacity onPress={() => navigation.navigate("PlantsLibrary")}>
          <Text style={styles.doneText}>{translation[language]["Back"]}</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.plantContainer, {backgroundColor: colorMap[theme+"Widget"], shadowColor: colorMap[theme+"Shadow"]}]}>
        <Image source={plantImages[plant]} style={styles.image} resizeMode="contain"/>
        <View style={styles.textContainer}>
          <Text style={[styles.plantTitle, {color: colorMap[theme+"Text"]}]}>{translation[language][plant]}</Text>
          <Text style={[styles.plantDescription, {color: colorMap[theme+"Text"]}]}>{plantDescriptions[language][plant]}</Text>
        </View>
      </View>

      {/* cross reactions */}
      <View>
        <View style={{flexDirection: "row"}}>
          <Text style={[styles.plantTitle, {color: colorMap[theme+"Text"], marginRight: 11}]}>{translation[language]["Cross reactions"]}</Text>
          <TouchableOpacity onPress={() => navigation.navigate("CrossReactions", { plant })}>
            <Image source={infoImage} style={styles.infoImage}></Image>
          </TouchableOpacity>
        </View>
        <View style={{paddingLeft: 10}}>
          {crossReactions[plant].map((plant, index) => (
            <Text style={[styles.plantDescription, {color: colorMap[theme+"Text"], marginBottom: 2}]} key={index}>• {translation[language][plant] || plant}</Text>
          ))}
        </View>  
      </View>
      <Text style={[styles.plantTitle, {color: colorMap[theme+"Text"], marginRight: 11, marginTop: 15}]}>{translation[language]["Allergy season graph"]}</Text>
      <Hello theme={theme} language={language} plant={plant}></Hello>
      <Text style={[styles.plantTitle, {color: colorMap[theme+"Text"], marginRight: 11, marginTop: 15}]}>{translation[language]["Weekly intensity graph"]}</Text>
      {/* <WeeklyIntensityChart theme={theme} language={language}></WeeklyIntensityChart> */}
      <WeeklyIntensityChart theme={theme} language={language} plant={plant} />
      <Text style={[styles.plantTitle, {color: colorMap[theme+"Text"], marginRight: 11, marginTop: 15}]}>{trans[language][0]}</Text>
      <Text style={[styles.plantDescription, {color: colorMap[theme+"Text"], marginBottom: 30}]}>{seasonDynamics[language][plant]}</Text>
    </ScrollView>
  );  
};

export default PlantInfo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 23,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  text: {
    fontSize: 18,
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
  plantContainer: {
    marginTop: 30,
    //height: 220, // Fixed height
    width: "100%", // Width respects parent padding
    borderRadius: 24,
    flexDirection: 'row',
    elevation: 3,
    shadowColor: '#aba9a9',
    alignContent: "center",
    padding: 20,
    marginBottom: 20
  },
  image: {
    height: 180,
    width: 120,
    marginLeft: -10,
    marginRight: 10
  },
  textContainer: {
    flex: 1, // Take up the remaining width
  },
  
  plantTitle: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 8
  },
  plantDescription: {
    fontSize: 14,
    lineHeight: 18
  },
  infoImage: {
    height: 20,
    width: 20,
    marginTop: 2
  },
  titlee: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  chart: {
    //marginVertical: 8,
    borderRadius: 60,
    backgroundColor: colorMap["darkWidget"],
    padding: 10,
    paddingLeft: 4,
    paddingBottom: 6,
    paddingTop: 18,
    marginLeft: -25,
    
  },
  container2: {
    backgroundColor: 'rgba(255, 255, 255, 0.93)',
    marginTop: 5,
    marginBottom: 10,
    //paddingRight: 20
    overflow: "hidden",
    borderRadius: 24,
  },
  mask: {
    //backgroundColor: "#ffffff",
    marginRight: 20,
    //marginLeft: -10,
    overflow: "hidden",
  }
});