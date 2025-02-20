import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;

const AllergyLineChart = () => {
  const chartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43, 60], // Allergy intensity values
        strokeWidth: 2, // Line thickness
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // Line color
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#f7f7f7",
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Label color
    strokeWidth: 2, // Optional: Line thickness
    decimalPlaces: 1, // Number of decimal places
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#ffa726",
    },
  };

  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>Weekly Allergy Intensity</Text> */}
      <LineChart
        data={chartData}
        width={screenWidth - 16}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    backgroundColor: "#fff",
  },
  title: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
});

export default AllergyLineChart;
