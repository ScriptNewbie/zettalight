import { useContext, useState } from "react";
import colors, { ColorMode as AllowedColorMode } from "../../../config/colors";
import fonts from "../../../config/fonts";
import { StyleSheet, View, TouchableWithoutFeedback } from "react-native";
import ColorMode from "../../../contexts/colorMode";
import Text from "../../basic/Text";
import useGraphData from "../../../hooks/useGraphData";
import _ from "lodash";
import Picker from "../../basic/Picker";
import Graph, { AllowedCharts } from "../../basic/Graph";

const options = {
  month: { name: "miesiąc" },
  week: { name: "tydzień" },
  day: { name: "dzień" },
  hour: { name: "godzinę" },
};

type AllowedPeriods = "month" | "week" | "day" | "hour";

export default function Chart() {
  const { data: apiData } = useGraphData();
  const colorMode: AllowedColorMode = useContext(ColorMode);
  const styles = generateStyles(colorMode);
  const [picked, setPicked] = useState<AllowedCharts>("power");
  const [pickedChart, setPickedChart] = useState<AllowedPeriods>("day");

  const monthlyData = apiData ? apiData : [];

  const weeklyData = monthlyData.filter(
    (d) => d.time.getTime() >= new Date().getTime() - 7 * 24 * 60 * 60 * 1000
  );

  const dailyData = weeklyData.filter(
    (d) => d.time.getTime() >= new Date().getTime() - 24 * 60 * 60 * 1000
  );

  const hourlyData = dailyData.filter(
    (d) => d.time.getTime() >= new Date().getTime() - 60 * 60 * 1000
  );

  const data =
    pickedChart === "hour"
      ? hourlyData
      : pickedChart === "day"
      ? dailyData
      : pickedChart === "week"
      ? weeklyData
      : monthlyData;

  const produced =
    data.reduce((a, point) => {
      return a + point.power;
    }, 0) /
    (1000 * 20);

  return (
    <>
      <Picker<AllowedPeriods>
        picked={pickedChart}
        options={[
          { name: "miesiąc", value: "month" },
          { name: "tydzień", value: "week" },
          { name: "dzień", value: "day" },
          { name: "godzina", value: "hour" },
        ]}
        onChange={setPickedChart}
      />
      <Text style={styles.text}>
        W {pickedChart === "hour" ? "ostatnią" : "ostatni"}{" "}
        {options[pickedChart].name} wyprodukowano:
      </Text>
      <Text style={styles.kwh}>
        {produced.toFixed(
          pickedChart === "hour" ? 3 : pickedChart === "day" ? 2 : 1
        )}
        kWh
      </Text>
      <Graph key={pickedChart.toString()} picked={picked} data={data}></Graph>
      <Picker<AllowedCharts>
        small
        picked={picked}
        onChange={(x: AllowedCharts) => {
          setPicked(x);
        }}
        options={[
          { name: "moc", value: "power" },
          { name: "temperatura", value: "temperature" },
          { name: "nasłonecznienie", value: "light" },
        ]}
      />
    </>
  );
}

const generateStyles = (mode: AllowedColorMode) => {
  return StyleSheet.create({
    text: {
      color: colors[mode].primary,
      marginTop: 10,
    },
    kwh: {
      marginTop: 10,
      marginBottom: 10,
      alignSelf: "center",
      fontSize: 1.3 * fonts.sizeBig,
      color: colors[mode].apply,
    },
  });
};
