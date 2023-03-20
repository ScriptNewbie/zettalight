import { useContext, useState, useRef, useEffect } from "react";
import colors, { ColorMode as AllowedColorMode } from "../../config/colors";
import fonts from "../../config/fonts";
import { StyleSheet, View } from "react-native";
import ColorMode from "../../contexts/colorMode";
import { Fontisto } from "@expo/vector-icons";

import _ from "lodash";

import {
  VictoryAxis,
  VictoryChart,
  VictoryLine,
  VictoryScatter,
  VictoryZoomContainer,
  VictoryVoronoiContainer,
  createContainer,
} from "victory-native";
import AppText from "./Text";
import Button from "./Button";

const VictoryZoomVoronoiContainer = createContainer("zoom", "voronoi");

export type AllowedCharts =
  | "power"
  | "temperature"
  | "light"
  | "voltage"
  | "current"
  | "lightSensor0"
  | "lightSensor1"
  | "lightSensor2"
  | "temperatureSensor0"
  | "temperatureSensor1"
  | "temperatureSensor2";

const options = {
  power: { title: "Moc", unit: "W", color: "blue" },
  temperature: { title: "Temperatura", unit: "°C", color: "red" },
  light: { title: "Nasłonecznienie", unit: "lx", color: "orange" },
  voltage: { title: "Napięcie", unit: "V", color: "green" },
  current: { title: "Prąd", unit: "A", color: "purple" },
  lightSensor0: { title: "Czujnik światła 0", unit: "lx", color: "orange" },
  lightSensor1: { title: "Czujnik światła 1", unit: "lx", color: "orange" },
  lightSensor2: { title: "Czujnik światła 2", unit: "lx", color: "orange" },
  temperatureSensor0: {
    title: "Czujnik temperatury 0",
    unit: "°C",
    color: "red",
  },
  temperatureSensor1: {
    title: "Czujnik temperatury 1",
    unit: "°C",
    color: "red",
  },
  temperatureSensor2: {
    title: "Czujnik temperatury 2",
    unit: "°C",
    color: "red",
  },
};

export type Point = {
  time: Date;
  power: number;
  light: number;
  temperature: number;
  voltage: number;
  current: number;
  lightSensor0: number;
  lightSensor1: number;
  lightSensor2: number;
  temperatureSensor0: number;
  temperatureSensor1: number;
  temperatureSensor2: number;
};

interface Props {
  data: Point[];
  picked: AllowedCharts;
  width?: number;
  height?: number;
}

type Tuple<T> = [T, T];
type DateTuple = Tuple<number> | Tuple<Date>;

type Domain = {
  x: DateTuple;
  y: DateTuple;
};

export default function Graph({ data, picked, width, height }: Props) {
  const colorMode: AllowedColorMode = useContext(ColorMode);
  const styles = generateStyles(colorMode);
  const [inspecting, setInspecting] = useState(false);

  const prevDataLength = useRef(data.length);

  const getEntireDomain = () => {
    const minY = _.minBy(data, (d) => d[picked])?.[picked];
    const maxY = _.maxBy(data, (d) => d[picked])?.[picked];
    const domain: Domain = {
      y: [minY ? minY : 0, maxY ? maxY : 7],
      x: [
        data[0]?.time ? data[0].time : new Date(0),
        data[data.length - 1]?.time
          ? data[data.length - 1]?.time
          : new Date(12),
      ],
    };
    return domain;
  };

  const [domain, setDomain] = useState<DateTuple>(getEntireDomain().x);

  useEffect(() => {
    if (prevDataLength.current === 0) {
      setDomain(getEntireDomain().x);
    }
    prevDataLength.current = data.length;
  }, [data]);

  const cutToDomain = (array: Point[]) => {
    return array.filter(
      (d) =>
        d.time.getTime() >= domain[0].valueOf() - 3 * 60 * 1000 &&
        d.time.getTime() <= domain[1].valueOf() + 3 * 60 * 1000
    );
  };

  const getData = () => {
    const dataCut = cutToDomain(data);
    if (dataCut.length < 60) {
      return dataCut.map((data) => {
        return { x: data.time, y: data[picked] };
      });
    }
    const subdata = [];
    const subdataLength = Math.ceil(dataCut.length / 30);

    for (let i = 0; i < dataCut.length; i += subdataLength) {
      const chunk = dataCut.slice(i, i + subdataLength);
      subdata.push(chunk);
    }

    const points = subdata.map((data) => {
      const sum = data.reduce((a, point) => a + point[picked], 0);
      const average = sum / data.length;
      return { x: data[Math.floor(data.length / 2)].time, y: average };
    });

    return points;
  };
  return (
    <View style={styles.container}>
      <AppText style={styles.title}>
        {options[picked].title + " [" + options[picked].unit + "]"}
      </AppText>
      <View style={styles.graphContainer}>
        <VictoryChart
          width={width}
          height={height}
          domain={getEntireDomain()}
          containerComponent={
            <VictoryZoomVoronoiContainer
              labels={
                inspecting
                  ? ({ datum }) =>
                      `${datum.y.toFixed(2)}${options[picked].unit}`
                  : undefined
              }
              onZoomDomainChange={({ x }: Domain) => {
                setDomain(x);
              }}
              zoomDimension="x"
              zoomDomain={{ x: domain, y: getEntireDomain().y }}
              minimumZoom={{ x: 1, y: 1 }}
              allowZoom={!inspecting}
              allowPan={!inspecting}
              voronoiDimension="x"
            />
          }
        >
          <VictoryLine
            style={{ data: { stroke: options[picked].color } }}
            data={getData()}
            interpolation={"basis"}
          />
        </VictoryChart>
        <Button
          style={[
            styles.lock,
            {
              backgroundColor: inspecting
                ? colors[colorMode].discard
                : colors[colorMode].apply,
            },
          ]}
          onPress={() => {
            setInspecting(!inspecting);
          }}
        >
          <Fontisto
            name={inspecting ? "locked" : "unlocked"}
            size={20}
            color={colors[colorMode].white}
          />
        </Button>
      </View>
    </View>
  );
}

const generateStyles = (mode: AllowedColorMode) => {
  return StyleSheet.create({
    container: { overflow: "hidden" },
    title: {
      color: colors[mode].primary,
      fontSize: fonts.sizeVerySmall,

      alignSelf: "center",
    },
    graphContainer: {
      marginTop: -50,
    },
    lock: {
      top: 40,
      position: "absolute",
      width: 42,
      alignSelf: "flex-end",
    },
  });
};
