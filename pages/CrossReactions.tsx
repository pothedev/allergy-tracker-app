import React, { useState, useEffect, useContext} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { colorMap, translation, intensityColor, plantDescriptions, crossReactions} from '../data';
import StorageContext from './StorageContext';

import { ImageSourcePropType } from 'react-native';


const translate: Record<string, Record<number, string>> = {
  "ua": {
    0: "Що таке перехресна реактивність?",
    1: 'При алергії на пилок певні продукти можуть викликати схожі алергічні реакції. Це називається перехресною реакцією. Вона відбувається через схожість білків, що містяться в пилку, з білками, які містяться в деяких продуктах харчування. Організм може сплутати ці продукти з пилком і почати реагувати, як на той самий алерген. Тому після вживання певних продуктів, які зазвичай не викликають алергії, можуть виникати симптоми, такі як свербіж або набряк.',
    2: "Поширені перехресні реакції",
    3: "Пилок берези",
    4: "Може викликати реакції на яблука, моркву, селеру, ліщину та персики.",
    5: "Пилок амброзії",
    6: "Може викликати реакції на банани, огірки, кавуни та кабачки.",
    7: "Пилок трав",
    8: "Часто пов'язаний з реакціями на помідори, картоплю та пшеницю.",
    9: "Не всі люди з алергією на пилок мають перехресні реакції, але це варто враховувати, особливо в періоди високої концентрації пилку. Під час піку сезонів алергії перехресна реактивність значно підвищується, і ви можете відчути сильніші реакції на перехресно-реактивні продукти. Тобто, навіть якщо продукт зазвичай не викликає алергії, він може спричинити значнішу реакцію під час піку сезону алергії."
  },
  "en": {
    0: "What is allergy cross-reactivity?",
    1: `When you're allergic to pollen, certain foods might trigger similar allergic reactions. This is known as a "cross-reaction." It happens because some proteins in pollen are similar to those found in certain foods. Your body may mistake these foods for pollen and react as if it’s the same allergen. This is why you might experience symptoms like itching or swelling after eating certain foods, even though they don't normally cause an allergy.`,
    2: "Common Cross-Reactions",
    3: "Birch Pollen",
    4: "May cause reactions to apples, carrots, celery, hazelnuts, and peaches.",
    5: "Ragweed Pollen",
    6: "Can trigger reactions to bananas, cucumbers, melons, and zucchini.",
    7: "Grass Pollen",
    8: "Often associated with reactions to tomatoes, potatoes, and wheat.",
    9: "Not everyone with a pollen allergy will experience cross-reactions, but it’s something to keep in mind, especially during high pollen seasons.",
  }
}

const CrossReactions: React.FC<{ route: any, navigation: any}> = ({ route, navigation }) => {
  const { plant } = route.params; // Extract the plant parameter

  const storage = useContext(StorageContext);
  if (!storage) return null;
  const { storedData } = storage

  const language = storedData.language
  const theme = storedData.theme

  return (
    <ScrollView>
      <View style={[styles.container, {backgroundColor: colorMap[theme+"Background"]}]}>
        <View style={[styles.header, {marginBottom: 20}]}>
          <Text style={[styles.headerText, {color: colorMap[theme+"Text"]}]}>{translation[language]["Cross reactivity"]}</Text>
          <TouchableOpacity onPress={() => navigation.navigate("PlantInfo", { plant })}>
            <Text style={styles.doneText}>{translation[language]["Back"]}</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.plantTitle, {color: colorMap[theme+"Text"], marginTop: 3}]}>{translate[language][0]}</Text>
        <Text style={[styles.text, {color: colorMap[theme+"Text3"]}]}>{translate[language][1]}</Text>

        {/* Common cross allergies */}
        <Text style={[styles.plantTitle, {color: colorMap[theme+"Text"]}]}>{translate[language][2]}</Text>
        <View style={styles.bulletContainer}>
          {/* First Bullet Point */}
          <Text style={[styles.bulletText, { color: colorMap[theme + "Text"], fontWeight: "500" }]}>
            {"\u2022 " + translate[language][3] + ": "}
          </Text>
          <Text style={[styles.indentText, { color: colorMap[theme + "Text3"] }]}>
            {translate[language][4]}
          </Text>
        </View>

        {/* Second Bullet Point */}
        <View style={styles.bulletContainer}>
          <Text style={[styles.bulletText, { color: colorMap[theme + "Text"], fontWeight: "500" }]}>
            {"\u2022 " + translate[language][5] + ": "}
          </Text>
          <Text style={[styles.indentText, { color: colorMap[theme + "Text3"] }]}>
            {translate[language][6]}
          </Text>
        </View>

        {/* Third Bullet Point */}
        <View style={styles.bulletContainer}>
          <Text style={[styles.bulletText, { color: colorMap[theme + "Text"], fontWeight: "500" }]}>
            {"\u2022 " + translate[language][7] + ": "}
          </Text>
          <Text style={[styles.indentText, { color: colorMap[theme + "Text3"] }]}>
            {translate[language][8]}
          </Text>
        </View>
        {/* <Text style={[styles.plantTitle, {color: colorMap[theme+"Text"]}]}>{}</Text> */}
        <Text style={[styles.text, {color: colorMap[theme+"Text3"], marginTop: 8, paddingBottom: 20}]}>{translate[language][9]}</Text>
      </View>
    </ScrollView>
  );  
};

export default CrossReactions;

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
    fontSize: 15,
    lineHeight: 24,
    paddingHorizontal: 5,
    //textAlign: "justify"
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
  plantTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8
  },
  bulletContainer: {
    flexDirection: "column",
    marginBottom: 10,
  },
  bulletText: {
    fontSize: 16,
    marginLeft: 5, // Adjust for bullet spacing
  },
  indentText: {
    fontSize: 15,
    marginLeft: 20, // Matches bullet's margin
    marginTop: 2,
  },
});