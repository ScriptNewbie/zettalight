import { useContext } from "react";
import colors, { ColorMode as AllowedColorMode } from "../../../config/colors";
import fonts from "../../../config/fonts";
import { StyleSheet, View, TouchableWithoutFeedback } from "react-native";
import ColorMode from "../../../contexts/colorMode";
import Text from "../../basic/Text";
import { MaterialIcons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { RoutesProps } from "../../../../App";
import { StackNavigationProp } from "@react-navigation/stack";
import useLiveData from "../../../hooks/useLiveData";
import Button from "../../basic/Button";

type NavigationProp = StackNavigationProp<RoutesProps>;
//type LiveDataScreenRouteProp = RouteProp<RoutesProps, "LiveData">;

export default function LiveData() {
  const navigation = useNavigation<NavigationProp>();
  const colorMode: AllowedColorMode = useContext(ColorMode);
  const styles = generateStyles(colorMode);

  const { data, isSuccess } = useLiveData();

  const avgTemperature = isSuccess
    ? data.temperatureSensors.reduce((sum: number, current: number) => {
        return sum + current;
      }) / data.temperatureSensors.length
    : 0;

  const avgLight = isSuccess
    ? data.lightSensors.reduce((sum: number, current: number) => {
        return sum + current;
      }) / data.lightSensors.length
    : 0;

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        navigation.navigate("LiveData");
      }}
    >
      <View style={styles.container}>
        <View style={styles.powerDatabase}>
          <View>
            {isSuccess && !data.databaseConnection && (
              <View style={styles.databaseError}>
                <MaterialCommunityIcons
                  name="database-alert-outline"
                  size={24}
                  color={colors[colorMode].white}
                />
              </View>
            )}
          </View>
          <View style={styles.textWithIcon}>
            <MaterialIcons
              style={styles.powerIcon}
              name="bolt"
              size={styles.power.fontSize}
              color={colors[colorMode].primary}
            />
            <Text style={styles.power}>{isSuccess ? data.powerW : "⧖"}W</Text>
          </View>
          <Button
            onPress={() => {
              navigation.navigate("Settings");
            }}
          >
            <MaterialIcons
              name="settings"
              size={24}
              color={colors[colorMode].white}
            />
          </Button>
        </View>
        <View style={styles.textWithIcon}>
          <MaterialCommunityIcons
            name="current-dc"
            size={24}
            color={colors[colorMode].primary}
          />
          <Text>{isSuccess ? (data.voltageMv / 1000).toFixed(1) : "⧗"}V </Text>
          <Text>{isSuccess ? (data.currentMa / 1000).toFixed(1) : "⧗"}A</Text>
        </View>
        <View style={styles.textWithIcon}>
          <MaterialCommunityIcons
            name="weather-sunny"
            size={24}
            color={colors[colorMode].primary}
          />
          <Text>{isSuccess ? avgLight.toFixed(0) : "⧗"}lx </Text>
          <MaterialCommunityIcons
            name="thermometer"
            size={24}
            color={colors[colorMode].primary}
            style={styles.temperatureIcon}
          />
          <Text>{isSuccess ? avgTemperature.toFixed(1) : "⧗"}°C</Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const generateStyles = (mode: AllowedColorMode) => {
  return StyleSheet.create({
    container: {
      alignItems: "center",
    },
    powerDatabase: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      alignSelf: "stretch",
    },
    textWithIcon: {
      flexDirection: "row",
      alignItems: "center",
    },
    power: {
      fontSize: 3 * fonts.sizeBig,
      color: colors[mode].primary,
    },
    powerIcon: {
      marginRight: -16,
    },
    temperatureIcon: { marginRight: -5 },
    databaseError: {
      width: 30,
      height: 30,
      borderRadius: 30,
      backgroundColor: colors[mode].discard,
      alignItems: "center",
      justifyContent: "center",
    },
    flex: { flex: 1, alignItems: "center" },
  });
};
