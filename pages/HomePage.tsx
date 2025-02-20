import React, { useState, useEffect, useContext, useMemo} from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Platform, SafeAreaView, StatusBar, ActivityIndicator} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { colorMap, intensityColor, translation, bloomingNow, upcoming, bloomingDict, upcomingDict, weekdays, months, recommendations} from '../data';
import { LogBox } from 'react-native';

import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

import StorageContext from './StorageContext';

import FastImage from 'react-native-fast-image';


console.log("HomePage is rendering");
const screenWidth = Dimensions.get("window").width;


// Ignore all log notifications
LogBox.ignoreAllLogs(true);


// Import all images statically
import veryLowUaDark from '../assets/veryLowUaDark.png';
import lowUaDark from '../assets/lowUaDark.png';
import moderateUaDark from '../assets/moderateUaDark.png';
import highUaDark from '../assets/highUaDark.png';
import veryHighUaDark from '../assets/veryHighUaDark.png';

import veryLowEnDark from '../assets/veryLowEnDark.png';
import lowEnDark from '../assets/lowEnDark.png';
import moderateEnDark from '../assets/moderateEnDark.png';
import highEnDark from '../assets/highEnDark.png';
import veryHighEnDark from '../assets/veryHighEnDark.png';

import veryLowUaLight from '../assets/veryLowUaLight.png';
import lowUaLight from '../assets/lowUaLight.png';
import moderateUaLight from '../assets/moderateUaLight.png';
import highUaLight from '../assets/highUaLight.png';
import veryHighUaLight from '../assets/veryHighUaLight.png';

import veryLowEnLight from '../assets/veryLowEnLight.png';
import lowEnLight from '../assets/lowEnLight.png';
import moderateEnLight from '../assets/moderateEnLight.png';
import highEnLight from '../assets/highEnLight.png';
import veryHighEnLight from '../assets/veryHighEnLight.png';

import notInSeasonUa from '../assets/notInSeasonUa.png';
import menuIcon from '../assets/coolmenu.png';

const statusBarHeight = StatusBar.currentHeight;

// Map static imports for image paths
const intensityLevels = ["Not in season", "Very low", "Low", "Moderate", "High", "Very high"]


const intensityImageMap: Record<
  string,
  Record<string, { dark: any; light: any }>
> = {
  ua: {
    "Not in season": { dark: notInSeasonUa, light: notInSeasonUa },
    "Very low": { dark: veryLowUaDark, light: veryLowUaLight },
    "Low": { dark: lowUaDark, light: lowUaLight },
    "Moderate": { dark: moderateUaDark, light: moderateUaLight },
    "High": { dark: highUaDark, light: highUaLight },
    "Very high": { dark: veryHighUaDark, light: veryHighUaLight },
  },
  en: {
    "Not in season": { dark: notInSeasonUa, light: notInSeasonUa },
    "Very low": { dark: veryLowEnDark, light: veryLowEnLight },
    "Low": { dark: lowEnDark, light: lowEnLight },
    "Moderate": { dark: moderateEnDark, light: moderateEnLight },
    "High": { dark: highEnDark, light: highEnLight },
    "Very high": { dark: veryHighEnDark, light: veryHighEnLight },
  },
};

const WeeklyIntensityChart2: React.FC<{ theme: any; language: any; weeklyIntensityMap: Record<string, number[]> }> = ({
  theme,
  language,
  weeklyIntensityMap,
}) => {
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

  const calculateMaxIntensities = (weekdays: string[]) => {
    const maxIntensities = weekdays.map((date) => {
      const intensities = weeklyIntensityMap[date] || []; // Get intensities for the day
      return Math.max(0, ...intensities); // Maximum intensity, default to 0 if no data
    });
    return maxIntensities;
  };

  const { start } = getWeekRange();
  const weekdays = getWeekdays(start); // Get range of weekdays starting from Monday
  const maxIntensities = calculateMaxIntensities(weekdays); // Calculate max intensities for the week

  const sundayIntensity = maxIntensities[maxIntensities.length - 1] || 0;

  const chartData = {
    labels: [
      ...weekdays.map((date) => {
        const day = new Date(date).getDay();
        return translation[language][["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day]] || date;
      }),
      "D1", 
      "D2", 
      "D3"
    ],
    datasets: [
      {
        data: [...maxIntensities, sundayIntensity, 0, 5], // Add dummy values for y-axis range
        strokeWidth: 2,
        color: (opacity = 1) => `${colorMap["green"]}${opacity})`,
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
    <View style={[styles.container2, { backgroundColor: colorMap[theme + "Widget"] }]}>
      <View style={styles.mask}>
        <LineChart
          data={chartData}
          width={screenWidth+105}
          height={220}
          chartConfig={chartConfig}
          style={[styles.chart, { backgroundColor: colorMap[theme + "Widget"] }]}
          segments={5}
        />
      </View>
    </View>
  );
};


const HomePage: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);

  const storage = useContext(StorageContext);
  if (!storage) return null;
  const { storedData, updateStoredData } = storage

  const { 
    levels,
    adjustedBloomingDates,
    city,
    language,
    theme,
    latitude,
    longitude
  } = storedData;



  const [currentlyBlooming, setCurrentlyBlooming] = useState<{ name: string; intensity: string }[]>([]);
  const [upcomingDates, setUpcomingDates] = useState<Array<[string, string]>>([]);
  const [maxIntensity, setMaxIntensity] = useState<string>('Not in season');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  

  const buildWeeklyIntensityMap = (currentlyBlooming: Record<string, Record<string, number>>): Record<string, number[]> => {
    const today = new Date();
    const startOfWeek = new Date(today);
    const endOfWeek = new Date(today);
  
    // Calculate the start (Monday) and end (Sunday) of the week
    const dayOfWeek = today.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
    startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
  
    // Generate all dates in the week range
    const weekDates: string[] = [];
    for (let d = new Date(startOfWeek); d <= endOfWeek; d.setDate(d.getDate() + 1)) {
      weekDates.push(d.toISOString().split("T")[0]); // Format as YYYY-MM-DD
    }
  
    // Initialize the weekly intensity map
    const weeklyIntensityMap: Record<string, number[]> = {};
    weekDates.forEach((date) => {
      weeklyIntensityMap[date] = [];
    });
  
    Object.entries(currentlyBlooming).forEach(([plant, intensityMap]) => {
      Object.entries(intensityMap).forEach(([date, intensity]) => {
        if (weeklyIntensityMap[date]) {
          weeklyIntensityMap[date].push(intensity);
        }
      });
    });
  
    // Ensure all dates have intensity values for all plants (default to 0)
    weekDates.forEach((date) => {
      const intensityArray = weeklyIntensityMap[date];
      const numberOfPlants = Object.keys(currentlyBlooming).length;
      weeklyIntensityMap[date] = Array.from({ length: numberOfPlants }, (_, i) => intensityArray[i] || 0);
    });
  
    return weeklyIntensityMap;
  }; 

  const weeklyIntensityMap = useMemo(() => {
    console.log("📅 Rebuilding weekly intensity map");
    return adjustedBloomingDates 
      ? buildWeeklyIntensityMap(adjustedBloomingDates)
      : {};
  }, [adjustedBloomingDates, refreshTrigger]); // 🔥 Force re-render  

  const getClosestUpcomingDates = (bloomingDates: Record<string, Record<string, number>>): Array<[string, string]> => {
    // Helper function to get the date object from a string (e.g., '2023-04-12')
    const parseDate = (dateString: string) => new Date(dateString);
  
    // Get the current date
    const currentDate = new Date();
  
    // Create an array to store upcoming plant seasons
    const upcoming: Array<[string, string]> = [];
  
    // Iterate over the bloomingDates dictionary
    for (const plant in bloomingDates) {
      const plantDates = bloomingDates[plant];
      
      // Find the first date with intensity 1 (start of blooming season)
      const firstBloomingDate = Object.entries(plantDates).find(([date, intensity]) => intensity === 1);
      
      if (firstBloomingDate) {
        const [date, intensity] = firstBloomingDate;
        const dateObj = parseDate(date);
  
        // If the date is in the future (after today)
        if (dateObj > currentDate) {
          upcoming.push([plant, date]);  // Add to upcoming list
        }
      }
    }
  
    // Sort the upcoming array by date to get the closest upcoming dates
    upcoming.sort((a, b) => parseDate(a[1]).getTime() - parseDate(b[1]).getTime());
  
    // Get the top 3 upcoming dates
    const top3Upcoming = upcoming.slice(0, 3);
  
    return top3Upcoming;
  };

  useEffect(() => {
    const updateBloomingData = () => {
      if (!adjustedBloomingDates) return;
      
      console.log("🌼 Updated blooming dates received:", adjustedBloomingDates);
      
      const today = new Date().toISOString().split("T")[0];
      const newBlooming = Object.entries(adjustedBloomingDates)
        .filter(([plant, dates]) => {
          const userLevel = storedData.levels?.[plant] || 0; 
          return dates[today] > 0;
        })
        .map(([plant, dates]) => ({
          name: plant,
          intensity: intensityLevels[dates[today]]
        }));

      console.log("🌼 New blooming dict:", newBlooming);
      setCurrentlyBlooming(newBlooming);
      updateStoredData("currentlyBlooming", newBlooming)
      
      setUpcomingDates(getClosestUpcomingDates(adjustedBloomingDates));
  
      if (newBlooming.length === 0) {
        setMaxIntensity("Not in season");
      } else {
        const maxValue = Math.max(...newBlooming.map(p => 
          intensityLevels.indexOf(p.intensity)
        ));
        setMaxIntensity(intensityLevels[maxValue]);
      }
  
      setRefreshTrigger(prev => prev + 1); // 🔥 Force re-render
      setIsLoading(false);
      updateStoredData('fetching', 'false')
    };
  
    updateBloomingData();
  }, [adjustedBloomingDates]);


  if (storedData.fetching === "true") {
    return ( 
      <View style={styles.loadingContainer}>
        <FastImage
          source={require('../assets/beeAnim.gif')}
          style={styles.gif}
          resizeMode={FastImage.resizeMode.contain}
        />
        <Text style={styles.loadingText}>{translation[language]["Loading Allergy Data..."]}</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: colorMap[theme + "Background"] }]}>
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <View>
          <Text style={[styles.dateText, { color: colorMap[theme + "Text2"] }]}>
            {`${translation[language][weekdays[new Date().getDay()]] || new Date().getDay()}, ${new Date().getDate()} ${translation[language][months[new Date().getMonth() + 1]] || new Date().getMonth() + 1}`}
          </Text>
          <Text style={[styles.titleText, { color: colorMap[theme + "Text"] }]}>
            {translation[language]['Allergy progression']}
          </Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
          <Image
            source={menuIcon}
            style={[styles.menuIcon]}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>   

      {/* Currently Blooming Section */}
      <View style={[styles.bloomingContainer, { backgroundColor: colorMap[theme + "Widget"], shadowColor: colorMap[theme + "Shadow"] }]}>
        <View style={styles.currentlyBlooming}>
          <Text style={[styles.sectionTitle, { color: colorMap[theme + "Text"] }]}>
            {translation[language]['Currently blooming']}
          </Text>
          <View style={styles.allergyList}>
            {currentlyBlooming.length === 0 ? (
              <Text style={[styles.supertext, { color: colorMap[theme + "Text2"] }]}>
                {translation[language]['The plants you have selected are currently out of season']}
              </Text>
            ) : (
              currentlyBlooming.map((plant, index) => (
                <View key={index} style={[styles.currentAllergyContainer, {backgroundColor: colorMap[theme+"Widget2"]}]}>
                  <Text style={[styles.allergyText, { color: colorMap[theme + "Text"] }]}>
                    {translation[language][plant.name] || plant.name}
                  </Text>
                  <Text
                    style={[
                      styles.intensityText,
                      { color: intensityColor[plant.intensity] },
                    ]}
                  >
                    {translation[language][plant.intensity] || plant.intensity}
                  </Text>
                </View>
              ))
            )}
          </View> 
        </View>
        <View style={styles.gaugeContainer}>
          {/* Dynamically load the gauge image based on maxIntensity */}
          <Image source={intensityImageMap[language][maxIntensity][theme]} style={styles.gaugeImage} />
          <Text style={[styles.locationText, { color: colorMap[theme + "Text"] }]}>
            {translation[language]['Your location']}
          </Text>
          <Text style={[styles.placeText, { color: colorMap[theme + "Text2"] }]}>{city}</Text>
        </View>
      </View>

      
      
      {/* <Text>{recommendations[language][maxIntensity]["Symptoms"]}</Text>
      <Text>{recommendations[language][maxIntensity]["Precautions"]}</Text>
      <Text>{recommendations[language][maxIntensity]["Recommendation"]}</Text> */}


      {/* Weekly intensity graph */}
      <Text style={[styles.sectionTitle, {color: colorMap[theme+"Text"], marginRight: 11, marginTop: 25, marginLeft: 24}]}>{translation[language]["Weekly intensity graph"]}</Text>
      <WeeklyIntensityChart2 language={language} theme={theme} weeklyIntensityMap={weeklyIntensityMap}></WeeklyIntensityChart2>

      {/* Recomemndations */}
      <View style={[styles.recommendationsContainer, { borderColor: colorMap[theme+"Widget2"], shadowColor: colorMap[theme + "Shadow"]}]}>
        <Text style={[styles.sectionTitle, {color: colorMap[theme+"Text"], marginRight: 11, marginTop: 25, marginLeft: 24}]}>{translation[language]["Symptoms"]}</Text>
        <View style={{paddingHorizontal: 30}}>
          <Text style={{color: colorMap[theme+"Text"]}}>{recommendations[language][maxIntensity]["Symptoms"]}</Text>
        </View>
        <Text style={[styles.sectionTitle, {color: colorMap[theme+"Text"], marginRight: 11, marginTop: 25, marginLeft: 24}]}>{translation[language]["Recommendations"]}</Text>
        <View style={{paddingHorizontal: 30}}>
          <Text style={{color: colorMap[theme+"Text"]}}>{recommendations[language][maxIntensity]["Recommendations"]}</Text>
        </View>
      </View>
    

      {/* Upcoming Section */}
      <View style={styles.upcomingContainer}>
        <Text style={[styles.sectionTitle, { color: colorMap[theme + 'Text'] }]}>
          {translation[language]['Upcoming']}
        </Text>
        {upcomingDates.length > 0 ? (
          upcomingDates.map((plant, index) => (
            <UpcomingAllergy key={index} plant={plant[0]} date={plant[1]} language={language} theme={theme} />
          ))
        ) : (
          <Text style={{ color: colorMap[theme + 'Text2'] }}>
            {translation[language]['No upcoming blooming plants.']}
          </Text>
        )}
      </View>

      {/* Features Section */}
      <View style={styles.featuresContainer}>
        <Text style={[styles.sectionTitle, { color: colorMap[theme + "Text"] }]}>
          {translation[language]['Features']}
        </Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate("PlantsLibrary")}
          style={[styles.featureButton, { backgroundColor: colorMap[theme + "Widget"], shadowColor: colorMap[theme+"Shadow"]}]}
        >
          <Text style={[styles.featureButtonText, { color: colorMap[theme + "Text"] }]}>
            {translation[language]['Plants']}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const UpcomingAllergy: React.FC<{ plant: string; date: string; language: string; theme: string }> = ({
  plant,
  date,
  language,
  theme,
}) => {
  const formatDate = (dateString: string, language: string): string => {
    const date = new Date(dateString); // Convert the string to a Date object
  
    const monthNames = {
      en: [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
      ],
      ua: [
        "Січня", "Лютого", "Березня", "Квітня", "Травня", "Червня",
        "Липня", "Серпня", "Вересня", "Жовтня", "Листопада", "Грудня"
      ]
    };
  
    const monthIndex = date.getMonth(); // Get the month (0 - 11)
    const day = date.getDate(); // Get the day of the month
  
    // Format the date
    if (language === 'ua') {
      // In Ukrainian, the day comes before the month
      return `${day} ${monthNames.ua[monthIndex]}`;
    } else {
      // In English, the month comes before the day
      return `${monthNames.en[monthIndex]} ${day}`;
    }
  };

  return (
    <View style={[styles.upcomingAllergyContainer, { backgroundColor: colorMap[theme + 'Widget'], shadowColor: colorMap[theme + 'Shadow'] }]}>
      <Text style={[styles.allergyText, { color: colorMap[theme + 'Text'] }]}>
        {translation[language][plant] || plant}
      </Text>
      <Text style={[styles.datesText, { color: colorMap[theme + 'Text2'] }]}>
        {`${translation[language]['Start']}: ${formatDate(date, language)}`}
      </Text>
    </View>
  );
};



// Styles with static sizes and adjusted margins/paddings
const styles = StyleSheet.create({
  gif: {
    width: 100, // Adjust size as needed
    height: 100,
  },
  container: {
    backgroundColor: colorMap['darkBackground'],
    flex: 1,
    paddingTop: 10
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 100,
    paddingHorizontal: 20,
    marginTop: 0,
  },
  dateText: {
    color: colorMap['darkText2'],
    fontSize: 13,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  titleText: {
    color: colorMap['darkText'],
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
  },
  menuIcon: {
    width: 38,
    height: 38,
    //tintColor: colorMap['darkText'],
  },
  bloomingContainer: {
    height: 190,
    backgroundColor: colorMap['darkWidget'],
    padding: 20,
    borderRadius: 30,
    marginHorizontal: 20, // Margin for left and right
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#aba9a9',
  },
  sectionTitle: {
    color: colorMap['darkText'],
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  allergyList: {
    width: 160,
  },
  gaugeContainer: {
    marginTop: 12,
    marginRight: 10,
    height: 120,
    //backgroundColor: 'red',
    alignItems: 'center',  // Keep horizontally centered
    justifyContent: 'center',
  },
  gaugeImage: {
    width: 110,
    height: 110,
    resizeMode: 'contain',
  },
  
  locationText: {
    color: colorMap['darkText'],
    fontSize: 15,
    fontWeight: 'bold',
  },
  placeText: {
    color: colorMap['darkText2'],
    fontSize: 14,
  },
  currentAllergyContainer: {
    width: 170,
    height: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 7,
    alignItems: 'center',
  },
  currentlyBlooming: {
    flexDirection: 'column'
  },
  allergyText: {
    color: colorMap['darkText'],
    fontSize: 14,
    fontWeight: 'semibold',
  },
  intensityText: {
    color: intensityColor['Very low'],
    fontSize: 14,
    fontWeight: 'semibold',
  },
  upcomingContainer: {
    height: 200, // Static height for upcoming container
    paddingHorizontal: 20, // Margin for left and right
    marginTop: 30,
  },
  upcomingAllergyContainer: {
    height: 60, // Static height for each upcoming allergy container
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: colorMap['darkWidget'],
    borderRadius: 17,
    marginVertical: 5,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#aba9a9',
  },
  datesText: {
    color: colorMap['darkText2'],
    fontSize: 14,
  },
  featuresContainer: {
    height: 150, // Static height for features container
    paddingHorizontal: 20, // Margin for left and right
    marginTop: 70,
  },
  featureButton: {
    height: 70, // Static height for feature buttons
    backgroundColor: colorMap['darkWidget'],
    borderRadius: 17,
    marginVertical: 7,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#aba9a9',
  },
  featureButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  supertext: {
    fontSize: 16,
    color: colorMap["darkText2"],
    width: 120
  },
  chart: {
    //marginVertical: 8,
    borderRadius: 60,
    backgroundColor: colorMap["darkWidget"],
    padding: 10,
    paddingLeft: 4,
    paddingBottom: 6,
    paddingTop: 18,
    marginLeft: -13,
    
  },
  container2: {
    backgroundColor: 'rgba(255, 255, 255, 0.93)',
    marginTop: 5,
    marginBottom: 0,
    //paddingRight: 20
    overflow: "hidden",
    borderRadius: 24,
    marginHorizontal: 24
  },
  mask: {
    //backgroundColor: "#ffffff",
    marginRight: 20,
    overflow: "hidden",
    marginLeft: -15
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Black tint
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    marginTop: 10,
  },
  video: {
    width: 100, // Adjust size as needed
    height: 100,
  },
  recommendationsContainer: {
    marginTop: 30,
    borderRadius: 30,
    borderWidth: 4,
    marginHorizontal: 20,
    paddingBottom: 20,
    marginBottom: -7
    //borderStyle: "dashed"
  }
});

export default HomePage;
