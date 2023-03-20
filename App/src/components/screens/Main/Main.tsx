import { FlatList, View } from "react-native";
import Picker from "../../basic/Picker";
import Button from "../../basic/Button";
import Screen from "../../basic/FullScreen";
import { StyleSheet } from "react-native";
import ColorMode from "../../../contexts/colorMode";
import { useContext, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import fonts from "../../../config/fonts";
import colors, { ColorMode as AllowedColorMode } from "../../../config/colors";
import LiveData from "./LiveData";
import Graph from "./Chart";
import { StackNavigationProp } from "@react-navigation/stack";
import { RoutesProps } from "../../../../App";

export default function Main() {
  const navigation = useNavigation<NavigationProp>();
  const colorMode = useContext(ColorMode);
  const styles = generateStyles(colorMode);

  type NavigationProp = StackNavigationProp<RoutesProps>;

  const items = [
    { id: 20, content: <LiveData /> },
    { id: 40, content: <Graph /> },
    {
      id: 60,
      content: (
        <Button
          onPress={() => {
            navigation.navigate("Charts");
          }}
          style={styles.chartsButton}
          text="Więcej wykresów"
        />
      ),
    },
    { id: 999, content: <View style={styles.safeBottom} /> },
  ];
  return (
    <Screen>
      <FlatList
        refreshing={false}
        onRefresh={() => {}}
        style={styles.container}
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => item.content}
        ItemSeparatorComponent={() => {
          return <View style={styles.separator}></View>;
        }}
      />
    </Screen>
  );
}

const generateStyles = (mode: AllowedColorMode) => {
  return StyleSheet.create({
    container: { paddingLeft: 10, paddingRight: 10 },
    safeBottom: { height: 20 },
    separator: { height: 5 },
    chartsButton: {
      marginTop: 10,
      backgroundColor: colors[mode].secondaryButton,
    },
  });
};
