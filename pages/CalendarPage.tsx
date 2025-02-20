import React, { useState, useEffect, useContext} from "react";
import { CalendarList } from "react-native-calendars";
import { VStack, Box, Select, CheckIcon } from "native-base";
import { translation, intensityColor2, bloomingDates } from "../data";
import { colorMap, levels} from "../data"; // Import color map
import { StyleSheet } from "react-native";
import { LogBox } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import StorageContext from "./StorageContext"

// Ignore all log notifications
LogBox.ignoreAllLogs(true);

const levelToIntensity: Record<number, string> = {
  0: "Not in season",
  1: "Very low",
  2: "Low",
  3: "Moderate",
  4: "High",
  5: "Very high"
}

const CalendarPage: React.FC = () => {
  const [selectedPlant, setSelectedPlant] = useState<string>("All");
  const [markedDates, setMarkedDates] = useState<{ [date: string]: any }>({});
  const [bloomingDates, setDates] = useState<{ [key: string]: any }>({}); 

  const storage = useContext(StorageContext);
  if (!storage) return null;
  const { storedData } = storage

  const { 
    language,
    theme,
    adjustedBloomingDates
  } = storedData;



  useEffect(() => {
    generateMarkedDates(selectedPlant);
  }, [selectedPlant, adjustedBloomingDates]);

  
  useEffect(() => {
    generateMarkedDates(selectedPlant);
  }, [selectedPlant, adjustedBloomingDates]);


  const translate = (key: string): string => translation[language]?.[key] || key;

  const generateMarkedDates = (plant: string) => {
    if (!adjustedBloomingDates) return;
    const dates: { [date: string]: any } = {};

    let plantList = plant === "All" ? Object.keys(adjustedBloomingDates) : [plant.toLowerCase()];

    plantList.forEach((plantName) => {
        if (!adjustedBloomingDates[plantName]) return;
        const plantDates = adjustedBloomingDates[plantName];
        const allDates = Object.keys(plantDates).sort();

        let prevIntensity = 0;

        allDates.forEach((date, index) => {
            let intensityLevel = plantDates[date] ?? -1;
            
            // When "All" is selected, ignore intensity -1 completely
            if (plant === "All") {
                if (intensityLevel === -1) return;
                // Merge highest intensity when multiple plants bloom on the same day
                if (dates[date]) {
                    intensityLevel = Math.max(dates[date].intensity, intensityLevel);
                }
            }

            if (intensityLevel === 0) return;

            const prevDate = allDates[index - 1] || null;
            const nextDate = allDates[index + 1] || null;

            // Determine if this date is a starting or ending day
            const isStartingDay =
                (intensityLevel === 1) &&
                (prevIntensity === 0 || prevDate === null || plantDates[prevDate] === 0);
            const isEndingDay =
                intensityLevel === 1 &&
                (nextDate === null || plantDates[nextDate] === 0);

            // Check if the date is the first or last day of the month
            const currentDate = new Date(date);
            const isFirstDayOfMonth = currentDate.getDate() === 1;
            const isLastDayOfMonth =
                currentDate.getDate() === new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

            // Calculate week boundaries (rounded corners)
            const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
            const isWeekStart = dayOfWeek === 1; // Monday
            const isWeekEnd = dayOfWeek === 0; // Sunday

            if (!dates[date] || intensityLevel > dates[date].intensity) {
                dates[date] = {
                    intensity: intensityLevel,
                    color: intensityColor2[levelToIntensity[intensityLevel] || "Not selected"] || "#ffffff",
                    textColor: colorMap["darkText"],
                    startingDay: isStartingDay || isWeekStart || isFirstDayOfMonth,
                    endingDay: isEndingDay || isWeekEnd || isLastDayOfMonth,
                };
            }

            prevIntensity = intensityLevel;
        });
    });

    setMarkedDates(dates);
};

   
  
  useEffect(() => {
    generateMarkedDates(selectedPlant);
  }, [selectedPlant, bloomingDates]);

  return (
    <VStack style={[styles.container, {backgroundColor: colorMap[theme+"Background"]}]} space={4}>
      <Box style={[styles.dropdown, {backgroundColor: colorMap[theme+"Background"]}]}>
        <Select
          selectedValue={selectedPlant}
          minWidth="200"
          placeholder={translate("Select Plant")}
          onValueChange={(itemValue) => setSelectedPlant(itemValue)}
          style={[styles.text, { color: colorMap[theme + "Text"] }]} // Selected item text color
          _selectedItem={{
            bg: colorMap[theme + "Widget2"], // Background color for the selected item
            color: colorMap[theme + "Text"], // Text color for the selected item
            endIcon: <CheckIcon size="5" color={colorMap[theme + "Text"]} />, // Checkmark color
          }}
          _item={{
            bg: colorMap[theme + "Background"], // Background color for dropdown items
            color: colorMap[theme + "Text"], // Text color for dropdown items
            _hover: { bg: colorMap[theme + "Widget3"] }, // Hover effect color
            _pressed: { bg: colorMap[theme + "Widget2"] }, // Pressed effect color
          }}
          dropdownIcon={
            <CheckIcon size="5" color={colorMap[theme + "Text"]} /> // Dropdown arrow icon color
          }
        >
        {["All", "Ragweed", "Mugwort", "Birch", "Poplar", "Timothy", "Goosefoot", "Nettle", "Alder"].map((plant) => (
          <Select.Item
            key={plant}
            label={translate(plant)}
            value={plant}
            _text={{ color: colorMap[theme + "Text"], fontSize: 16 }} // Explicit text color for dropdown items
          />
        ))}
        </Select>
      </Box>
      <CalendarList
        firstDay={1}
        key={theme} // Force re-mount when theme changes
        markingType={"period"}
        markedDates={markedDates}
        theme={{
          calendarBackground: colorMap[theme + "Background"],
          textSectionTitleColor: colorMap[theme + "Text"],
          selectedDayBackgroundColor: colorMap[theme + "Widget2"],
          selectedDayTextColor: colorMap[theme+"Text"],
          todayTextColor: "#ff6347",
          dayTextColor: colorMap[theme + "Text"],
          textDisabledColor: colorMap[theme + "Text2"],
          dotColor: colorMap[theme + "Text"],
          arrowColor: colorMap[theme + "Text"],
          monthTextColor: colorMap[theme + "Text"],
          textMonthFontWeight: "bold",
          textDayFontWeight: "300",
          textDayHeaderFontWeight: "500",
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 14,
        }}
        horizontal={false}
        pagingEnabled={false}
      />

    </VStack>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorMap.lightBackground,
  },
  dropdown: {
    marginTop: 15,
    padding: 10,
  },
  text: {
    color: "#fff",
    fontSize: 16
  }
});

export default CalendarPage;