import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { colorMap, intensityColor, translation, intensityColor3} from '../data';
import { LogBox } from 'react-native';
import { ScrollView, useSafeArea } from 'native-base';
import StorageContext from '../pages/StorageContext'; 

// Ignore all log notifications
LogBox.ignoreAllLogs(true);



const themeMap: Record<string, string> = {
  dark: "Dark",
  light: "Light",
};

const langMap: Record<string, string> = {
  ua: "🇺🇦 Українська",
  en: "🇬🇧 English",
};

var account = "example@gmail.com";
//var location = "Kyiv";
var currentTheme = "dark";
var theme = "dark";

const defaultlevels: Record<string, number> = {
  ragweed: 5,
  mugwort: 4,
  birch: 2,
  poplar: 1,
  timothy: 3,
  nettle: 1,
  goosefoot: 0,
  alder: 3
};

const Settings: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [language, setLanguage] = useState<string>("ua");
  const [editingLanguage, setEditingLanguage] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("ua");

  const [location, setLocation] = useState<string>("Kyiv");
  const [theme, setTheme] = useState<string>("dark");
  const [editingTheme, setEditingTheme] = useState<boolean>(false);
  const [selectedTheme, setSelectedTheme] = useState<string>("dark");


  const [editing, setEditing] = useState<boolean>(false); // State for editing mode
  
  

  const storage = useContext(StorageContext);
  if (!storage) return null
  const { updateStoredData, storedData} = storage;

  const [editingLevels, setEditingLevels] = useState(false);
  //const currentLevels = storedData.levels || defaultlevels;
  const [currentLevels, setCurrentLevels] = useState(storedData.levels || defaultlevels)


  
  // Retrieve language and theme from AsyncStorage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedLanguage = storedData.language
        const savedTheme = storedData.theme
        const savedLocation = storedData.city

        if (savedLocation) setLocation(savedLocation)

        // Load saved language or fallback to default
        if (savedLanguage) {
          setLanguage(savedLanguage);
          setSelectedLanguage(savedLanguage); 
          //console.log("lang: ", language)
        }

        // Load saved theme or fallback to "dark" and save it 
        if (savedTheme) { 
          setTheme(savedTheme);
          setSelectedTheme(savedTheme);
          currentTheme = savedTheme;
        } else {
          // Default theme is "dark"
          setTheme("dark");
          setSelectedTheme("dark");
          await AsyncStorage.setItem("theme", "dark"); // Save default theme
        }
      } catch (e) {
        console.error("Failed to load settings from storage", e);
      }
    };

    loadSettings();
  }, [storedData.language, storedData.theme, storedData.city]);

  

  const saveLevels = async () => {
    if (editingLevels) {
      try {
        updateStoredData("levels", currentLevels);
        console.log("Levels saved:", currentLevels);
      } catch (e) {
        console.error("Failed to save levels to storage", e);
      }
    }
  };

  // Handle toggle of plant checkbox
  const togglePlant = (plant: string) => {
    const newLevels = { ...currentLevels };
    newLevels[plant] = newLevels[plant] === 0 ? defaultlevels[plant] : 0;
    setCurrentLevels(newLevels)
    //updateStoredData("levels", newLevels);
  };
  
  // Increase or decrease intensity level
  const adjustIntensity = (plant: string, delta: number) => {
    const newLevels = { ...currentLevels };
    newLevels[plant] = Math.max(0, Math.min(5, newLevels[plant] + delta));
    setCurrentLevels(newLevels)
    //updateStoredData("levels", newLevels);
  }


  // Updated done function in Settings
  const done = async () => {
    try {
      if (editingLevels) {
        await saveLevels(); // Save if editing
      }
      navigation.navigate("Home");
    } catch (error) {
      console.error("Failed to save before navigation:", error);
    } finally {
      setEditing(false);
    }
  };

  // Save language to AsyncStorage
  const saveLanguage = async () => {
    try {
      //await AsyncStorage.setItem("language", selectedLanguage);
      setEditingLanguage(false);
      updateStoredData("language", selectedLanguage);
      setLanguage(selectedLanguage);
      
    } catch (e) {
      console.error("Failed to save language to storage", e);
    }
  };

  // Save theme to AsyncStorage
  const saveTheme = async () => {
    try {
      //await AsyncStorage.setItem("theme", selectedTheme);
      setTheme(selectedTheme);
      setEditingTheme(false);
      updateStoredData("theme", selectedTheme);
    } catch (e) {
      console.error("Failed to save theme to storage", e);
    }
  };

  const translate = (key: string): string => translation[language]?.[key] || key;

  //const done = () => navigation.navigate("Home");
  const editAccount = () => {};
  const editLocation = () => {
    navigation.navigate("LocationSettings");
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colorMap[theme + "Background"] }]}>
    {/* Header */}
    <View style={styles.headerContainer}>
      <Text style={[styles.header, { color: colorMap[theme + "Text"] }]}>
        {translate("Settings")}
      </Text>
      <TouchableOpacity style={styles.done} onPress={done}>
        <Text style={[styles.doneText, { color: colorMap["green"] }]}>
          {translate("Done")}
        </Text>
      </TouchableOpacity>
    </View>

    {/* Account Setting */}
    <View style={[ styles.settingBox, { backgroundColor: colorMap[theme + "Widget"] }]}>
      <View style={styles.settingBox1}>
        <Image source={require("../assets/account.png")} style={styles.icon} />
        <View style={styles.detailContainer}>
          <Text style={[styles.settingName, { color: colorMap[theme + "Text"] }]}>
            {translate("Account")}
          </Text>
          <Text style={[styles.settingText, { color: colorMap[theme + "Text2"] }]}>
            {translate(account)}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.edit} onPress={editAccount}>
        <Text style={styles.editText}>{translate("Edit")}</Text>
      </TouchableOpacity>
    </View>

    {/* Language Setting */}
    <View style={[[styles.settingBox, { backgroundColor: colorMap[theme + "Widget"] }], editingLanguage && styles.expandedSettingBox]}>
      <View style={styles.settingBox1}>
        <Image source={require("../assets/globe.png")} style={styles.icon} />
        <View style={styles.detailContainer}>
          <Text style={[styles.settingName, { color: colorMap[theme + "Text"] }]}>{translate("Language")}</Text>
          <Text style={[styles.settingText, { color: colorMap[theme + "Text2"] }]}>{langMap[language]}</Text>
        </View>
      </View>

      {editingLanguage && (
        <View style={styles.options}>
          <TouchableOpacity
            onPress={() => setSelectedLanguage("ua")}
            style={styles.option}
          >
            <Text
              style={
                selectedLanguage === "ua"
                  ? [styles.activeOption, { color: colorMap[theme + "Text"] }]
                  : [styles.inactiveOption, { color: colorMap[theme + "Text2"] }]
              }
            >
              {langMap["ua"]}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedLanguage("en")}
            style={styles.option}
          >
            <Text
              style={
                selectedLanguage === "en"
                  ? [styles.activeOption, { color: colorMap[theme + "Text"] }]
                  : [styles.inactiveOption, { color: colorMap["lightText2"] }]
              }
            >
              {langMap["en"]}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={styles.edit}
        onPress={editingLanguage ? saveLanguage : () => setEditingLanguage(true)}
      >
        <Text style={styles.editText}>{translate(editingLanguage ? "Done" : "Edit")}</Text>
      </TouchableOpacity>
    </View>

    {/* Theme Setting */}
    <View style={[[styles.settingBox, { backgroundColor: colorMap[theme + "Widget"] }], editingTheme && styles.expandedSettingBox]}>
      <View style={styles.settingBox1}>
        <Image source={require("../assets/theme.png")} style={styles.icon} />
        <View style={styles.detailContainer}>
          <Text style={[styles.settingName, { color: colorMap[theme + "Text"] }]}>{translate("Theme")}</Text>
          {!editingTheme && (
            <Text style={[styles.settingText, { color: colorMap[theme + "Text2"] }]}>{translate(themeMap[theme])}</Text>
          )}
        </View>
      </View>

      {editingTheme && (
        <View style={styles.options}>
          <TouchableOpacity
            onPress={() => setSelectedTheme("dark")}
            style={styles.option}
          >
            <Text
              style={
                selectedTheme === "dark"
                  ? [styles.activeOption, { color: colorMap[theme + "Text"] }]
                  : [styles.inactiveOption, { color: colorMap[theme + "Text2"] }]
              }
            >
              {themeMap["dark"]}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedTheme("light")}
            style={styles.option}
          >
            <Text
              style={
                selectedTheme === "light"
                  ? [styles.activeOption, { color: colorMap[theme + "Text"] }]
                  : [styles.inactiveOption, { color: colorMap[theme + "Text2"] }]
              }
            >
              {themeMap["light"]}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={styles.edit}
        onPress={editingTheme ? saveTheme : () => setEditingTheme(true)}
      >
        <Text style={styles.editText}>{translate(editingTheme ? "Done" : "Edit")}</Text>
      </TouchableOpacity>
    </View>
    {/* Location Setting */}
    <View style={[ styles.settingBox, { backgroundColor: colorMap[theme + "Widget"] }]}>
      <View style={styles.settingBox1}>
        <Image source={require('../assets/location.png')} style={styles.icon} />
        <View style={styles.detailContainer}>
          <Text style={[styles.settingName, { color: colorMap[theme + "Text"] }]}>{translate("Location")}</Text>
          <Text style={[styles.settingText, { color: colorMap[theme + "Text2"] }]}>{translate(location)}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.edit} onPress={editLocation}>
        <Text style={styles.editText}>{translate("Edit")}</Text>
      </TouchableOpacity>
    </View>


    {/* Allergy List Setting */}
    <View
        style={[
          styles.settingBox,
          { backgroundColor: colorMap[theme + "Widget"], height: 300, marginBottom: 50}
        ]}
      >
        <View style={styles.detailContainer1}> 
          <Text style={[styles.settingName, { color: colorMap[theme + "Text"] }]}>
            {translate("Allergenic Plants")}
          </Text>
          <View style={styles.listPlantContainer}>
            {Object.keys(currentLevels).map((plant) => {
              const isActive = currentLevels[plant] > 0;
              const checkboxStyle = isActive
                ? [styles.activeCheckbox, { backgroundColor: intensityColor3[currentLevels[plant]] }]
                : [styles.inactiveCheckbox, { borderColor: intensityColor3[currentLevels[plant]] }];
              const plantLabelStyle = isActive
                ? [styles.activeOption, { color: colorMap[theme + "Text"] }]
                : [styles.inactiveOption, { color: colorMap[theme + "Text2"] }];
              return (
                <View key={plant} style={[styles.listPlant, { marginBottom: editingLevels ? 0 : 6 }]}>
                  <TouchableOpacity onPress={() => togglePlant(plant)} style={checkboxStyle} />
                  <Text style={plantLabelStyle}>{translate(plant)}</Text>
                  {editingLevels && (
                    <View style={styles.intensityControls}>
                      <TouchableOpacity onPress={() => adjustIntensity(plant, 1)}>
                        <Text style={[styles.intensityButton, {color: colorMap[theme+"Text2"]}]}>+</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => adjustIntensity(plant, -1)}>
                        <Text style={[styles.intensityButton, {color: colorMap[theme+"Text2"]}]}>-</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
        <TouchableOpacity style={styles.edit} onPress={() => [setEditingLevels(!editingLevels), saveLevels()]}>
          <Text style={styles.editText}>{translate(editingLevels ? "Done" : "Edit")}</Text>
        </TouchableOpacity>
      </View>
  </ScrollView>
  );
};

export default Settings;
 
const styles = StyleSheet.create({
  container: { 
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    position: "relative",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    marginTop: 30,
  },
  header: {
    fontSize: 24,
    textAlign: "center",
  },
  done: {
    position: "absolute",
    right: 0,
  },
  doneText: {
    fontSize: 20,
  },
  settingBox: {
    //paddingVertical: 30,
    height: 85,
    borderRadius: 20,
    flexDirection: "row",
    marginBottom: 20,
    backgroundColor: colorMap[currentTheme+"Widget"]
  },
  expandedSettingBox: {
    height: 150,
  },
  settingBox1: {
    alignItems: "center",
    flexDirection: "row",
  },
  settingName: {
    fontSize: 18,
    color: colorMap[currentTheme+"Text"]
  },
  settingText: {
    fontSize: 16,
    color: colorMap[currentTheme+"Text2"]
  },
  icon: {
    marginHorizontal: 15,
    height: 44,
    width: 44,
  },
  detailContainer: {},
  edit: {
    position: "absolute",
    right: 0,
    marginTop: 15,
    marginRight: 20,
  },
  editText: {
    fontSize: 16,
    color: colorMap["green"],
  },
  options: {
    marginTop: 10,
    marginLeft: 60,
    flexDirection: "column",
    alignSelf: "center"
  },
  option: {
    marginBottom: 10,
  },
  activeOption: {
    fontSize: 16,
    color: colorMap[theme+"Text"],
  },
  inactiveOption: {
    fontSize: 16,
    color: colorMap[theme+"Text2"],
  },
  listPlant: {
    flexDirection: "row",
    //justifyContent: "center",
    alignContent: "center",
    marginBottom: 3
  },
  activeCheckbox: {
    backgroundColor: colorMap["green"],
    borderRadius: 3,
    height: 15,
    width: 15,
    marginRight: 10,
    alignSelf: "center"
  },
  inactiveCheckbox: {
    //backgroundColor: colorMap["green"],
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: colorMap["green"],
    height: 15,
    width: 15,
    marginRight: 10,
    alignSelf: "center"
  },
  detailContainer1: {
    marginLeft: 20,
    marginTop: 20
  },
  intensityControls: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  intensityButton: {
    fontSize: 20,
    color: colorMap["text"],
    paddingHorizontal: 10,
  },
  listPlantContainer: {
    marginTop: 15,
  },
});
