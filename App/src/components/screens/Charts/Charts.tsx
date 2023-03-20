import { useContext, useEffect, useRef, useState } from "react";
import colors, { ColorMode as AllowedColorMode } from "../../../config/colors";
import {
  StyleSheet,
  View,
  SafeAreaView,
  Dimensions,
  Platform,
  ScrollView,
} from "react-native";
import ColorMode from "../../../contexts/colorMode";
import * as ScreenOrientation from "expo-screen-orientation";

import TimeInput from "../../basic/TimeInput";
import Button from "../../basic/Button";
import fonts from "../../../config/fonts";
import getInfluxDataByRange from "../../../services/getInfluxDataByRange";
import Graph, { AllowedCharts, Point } from "../../basic/Graph";
import Picker from "../../basic/Picker";

const initialEnd = new Date();
initialEnd.setHours(23, 59, 59, 999);
const initialStart = new Date();
initialStart.setHours(0, 0, 0, 0);

export default function Charts() {
  const colorMode: AllowedColorMode = useContext(ColorMode);
  const styles = generateStyles(colorMode);
  const [data, setData] = useState<Point[]>([]);
  const dimensions = useRef(Dimensions.get("window"));
  const { height: width, width: height } = dimensions.current;
  const [picked, setPicked] = useState<AllowedCharts>("power");

  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);

  useEffect(() => {
    ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT
    ).then(() => {});
    return () => {
      ScreenOrientation.unlockAsync().then(() => {
        ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP
        ).then(() => {});
      });
    };
  }, []);

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.container}>
        <View style={styles.datePickersGroup}>
          <TimeInput
            style={styles.datePicker}
            value={start}
            updateDate={setStart}
          />
          <TimeInput
            style={styles.datePicker}
            value={end}
            updateDate={setEnd}
          />
          <Button
            style={styles.button}
            textStyle={styles.buttonText}
            text="OK"
            onPress={async () => {
              const data = await getInfluxDataByRange(start, end);
              setData(data);
            }}
          />
        </View>
        <View style={styles.graphPickerContainer}>
          <Graph
            picked={picked}
            height={height - (Platform.OS === "ios" ? 40 : 80)}
            width={width - (Platform.OS === "ios" ? 220 : 140)}
            data={data}
          />
          <ScrollView style={{ marginLeft: 5 }}>
            <Picker<AllowedCharts>
              vertical
              small
              picked={picked}
              onChange={(x: AllowedCharts) => {
                setPicked(x);
              }}
              options={[
                { name: "moc", value: "power" },
                { name: "temperatura", value: "temperature" },
                { name: "nasłonecznienie", value: "light" },
                { name: "napięcie", value: "voltage" },
                { name: "prąd", value: "current" },
                { name: "cz. światła 0", value: "lightSensor0" },
                { name: "cz. światła 1", value: "lightSensor1" },
                { name: "cz. światła 2", value: "lightSensor2" },
                { name: "cz. temperatury 0", value: "temperatureSensor0" },
                { name: "cz. temperatury 1", value: "temperatureSensor1" },
                { name: "cz. temperatury 2", value: "temperatureSensor2" },
              ]}
            />
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}

const generateStyles = (mode: AllowedColorMode) => {
  return StyleSheet.create({
    datePickersGroup: {
      flexDirection: "row",
    },
    container: { padding: 5, flex: 1 },
    datePicker: {
      margin: 5,
    },
    buttonText: {
      fontSize: fonts.sizeVerySmall,
    },
    button: {
      margin: 5,
      marginRight: 0,
      paddingTop: 5,
      paddingBottom: 5,
      paddingLeft: 11,
      paddingRight: 11,
      backgroundColor: colors[mode].apply,
    },
    screen: { backgroundColor: colors[mode].background, flex: 1 },
    graphPickerContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      flex: 1,
    },
  });
};
