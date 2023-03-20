import { View, StyleSheet, ViewStyle } from "react-native";
import { Children, useContext } from "react";

import fonts from "../../config/fonts";
import ColorMode from "../../contexts/colorMode";
import colors, { ColorMode as AllowedColorMode } from "../../config/colors";
import Text from "./Text";

interface Props {
  color?: string;
  children: string;
  style?: ViewStyle;
}

const Alert = ({ color, children, style }: Props) => {
  const colorMode = useContext(ColorMode);
  const styles = generateStyles(colorMode, color);

  return (
    <View style={[styles.alert, style]}>
      <Text style={styles.text}>{children}</Text>
    </View>
  );
};

const generateStyles = (mode: AllowedColorMode, color: any) => {
  return StyleSheet.create({
    alert: {
      backgroundColor: color ? color : colors[mode].primaryButton,
      borderRadius: 10,
      justifyContent: "center",
      padding: 10,
      alignItems: "center",
    },
    text: { color: colors[mode].background, textAlign: "center" },
  });
};

export default Alert;
