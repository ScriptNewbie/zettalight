import { Text, StyleSheet, TextStyle, TextProps } from "react-native";
import { useContext } from "react";

import fonts from "../../config/fonts";
import ColorMode from "../../contexts/colorMode";
import colors, { ColorMode as AllowedColorMode } from "../../config/colors";

interface Props extends TextProps {
  style?: TextStyle | TextStyle[];
}

const AppText = ({ style, ...otherProps }: Props) => {
  const colorMode = useContext(ColorMode);
  const styles = generateStyles(colorMode);

  return <Text style={[styles.defaultFonts, style]} {...otherProps} />;
};

const generateStyles = (mode: AllowedColorMode) => {
  return StyleSheet.create({
    defaultFonts: {
      fontFamily: fonts.default,
      fontSize: fonts.sizeDefault,
      color: colors[mode].primary,
    },
  });
};

export default AppText;
