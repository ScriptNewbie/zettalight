import {
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  TextStyle,
} from "react-native";
import { ReactNode, useContext } from "react";

import colors, { ColorMode as AlowedColorModes } from "../../config/colors";

import ColorMode from "../../contexts/colorMode";
import Text from "./Text";
import fonts from "../../config/fonts";

type Options<T extends String> = {
  value: T;
  name: String;
};

interface Props<T extends String = String> {
  style?: Object;
  options: Options<T>[];
  textStyle?: TextStyle;
  onChange: (value: T) => void;
  picked: T;
  small?: boolean;
  vertical?: boolean;
}

function Picker<T extends String>({
  style,
  options,
  picked,
  textStyle,
  small,
  vertical,
  onChange = () => {},
}: Props<T>) {
  const colorMode = useContext(ColorMode);
  const styles = generateStyles(colorMode, small, vertical);
  return (
    <View>
      <View style={[styles.picker, style]}>
        {options.map((option) => (
          <TouchableWithoutFeedback
            onPress={() => {
              onChange(option.value);
            }}
            key={option.value.toString()}
          >
            <View
              style={[
                styles.option,
                picked === option.value ? styles.picked : {},
              ]}
            >
              <Text style={[styles.text, textStyle || {}]}>{option.name}</Text>
            </View>
          </TouchableWithoutFeedback>
        ))}
      </View>
    </View>
  );
}

const generateStyles = (
  mode: AlowedColorModes,
  small: boolean | undefined,
  vertical: boolean | undefined
) => {
  return StyleSheet.create({
    picker: {
      borderRadius: 10,
      justifyContent: "space-around",
      overflow: "hidden",
      flexDirection: vertical ? "column" : "row",
    },
    picked: {
      backgroundColor: colors[mode].secondaryButton,
    },
    option: {
      flex: 1,
      alignItems: "center",
      padding: 10,
      backgroundColor: colors[mode].primaryButton,
    },
    text: {
      color: colors[mode].background,
      fontSize: small ? fonts.sizeVerySmall : fonts.sizeDefault,
    },
  });
};

export default Picker;
