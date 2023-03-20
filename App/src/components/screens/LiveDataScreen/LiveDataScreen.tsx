import { useContext } from "react";
import colors, { ColorMode as AllowedColorMode } from "../../../config/colors";
import fonts from "../../../config/fonts";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import ColorMode from "../../../contexts/colorMode";
import Text from "../../basic/Text";
import { MaterialIcons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Screen from "../../basic/SafeBottomScrollableScreen";
import useLiveData from "../../../hooks/useLiveData";

export default function LiveDataScreen() {
  const colorMode: AllowedColorMode = useContext(ColorMode);
  const styles = generateStyles(colorMode);

  const { data, isLoading, isSuccess, dataUpdatedAt } = useLiveData();

  return (
    <Screen>
      {isSuccess ? (
        <View style={styles.container}>
          <View style={styles.textWithIcon}>
            <MaterialCommunityIcons
              name="solar-power"
              size={24}
              color={colors[colorMode].primary}
            />
            <Text>Moc: {data.powerW}W</Text>
          </View>
          <View style={styles.textWithIcon}>
            <MaterialIcons
              name="bolt"
              size={24}
              color={colors[colorMode].primary}
            />
            <Text>Napięcie: {(data.voltageMv / 1000).toFixed(3)}V</Text>
          </View>
          <View style={styles.textWithIcon}>
            <MaterialCommunityIcons
              name="current-dc"
              size={24}
              color={colors[colorMode].primary}
            />
            <Text>Prąd: {(data.currentMa / 1000).toFixed(3)}A</Text>
          </View>
          <View style={styles.textWithIcon}>
            <MaterialCommunityIcons
              name="percent"
              size={24}
              color={colors[colorMode].primary}
            />
            <Text>Wypełnienie PWM: {data.pwmDuty}%</Text>
          </View>
          <View style={styles.textWithIcon}>
            <MaterialCommunityIcons
              name="weather-sunny"
              size={24}
              color={colors[colorMode].primary}
            />
            <Text>Nasłonecznienie</Text>
          </View>
          {data.lightSensors.map((value: number, sensor: number) => (
            <Text key={sensor} style={styles.indent}>
              ● czujnik {sensor}: {value}lx
            </Text>
          ))}
          <View style={styles.textWithIcon}>
            <MaterialCommunityIcons
              name="thermometer"
              size={24}
              color={colors[colorMode].primary}
            />
            <Text>Temperatura</Text>
          </View>
          {data.temperatureSensors.map((value: number, sensor: number) => (
            <Text key={sensor} style={styles.indent}>
              ● czujnik {sensor}: {value}°C
            </Text>
          ))}
          <View style={styles.textWithIcon}>
            <MaterialIcons
              name="wifi"
              size={24}
              color={colors[colorMode].primary}
            />
            <Text>WiFi: </Text>
            {data.wifiConnection ? (
              <Text style={styles.working}>Połączono</Text>
            ) : (
              <Text style={styles.broken}>Brak połączenia</Text>
            )}
          </View>
          <View style={styles.textWithIcon}>
            <MaterialCommunityIcons
              name="database-outline"
              size={24}
              color={colors[colorMode].primary}
            />
            <Text>Baza danych: </Text>
            {data.databaseConnection ? (
              <Text style={styles.working}>Połączono</Text>
            ) : (
              <Text style={styles.broken}>Brak połączenia</Text>
            )}
          </View>
        </View>
      ) : (
        <ActivityIndicator
          style={styles.loading}
          size="large"
          color={colors[colorMode].primary}
        />
      )}
    </Screen>
  );
}

const generateStyles = (mode: AllowedColorMode) => {
  return StyleSheet.create({
    container: {
      margin: 15,
    },
    textWithIcon: {
      flexDirection: "row",
      alignItems: "center",
    },
    indent: { marginLeft: 28 },
    loading: { marginTop: 28 },
    working: {
      color: colors[mode].apply,
    },
    broken: {
      color: colors[mode].discard,
    },
  });
};
