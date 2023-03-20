import {
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  TextStyle,
} from "react-native";
import { ReactNode, useContext } from "react";

import colors, { ColorMode as AlowedColorModes } from "../../config/colors";
import Text from "./Text";
import ColorMode from "../../contexts/colorMode";

interface Props {
  children?: ReactNode;
  style?: Object;
  text?: String;
  textStyle?: TextStyle;
  disabled?: boolean;
  onPress?: () => void;
  onPressWhenDisabled?: () => void;
}

function Button({
  children,
  style,
  text,
  textStyle,
  disabled,
  onPress = () => {},
  onPressWhenDisabled = () => {},
}: Props) {
  const colorMode = useContext(ColorMode);
  const styles = generateStyles(colorMode, !!disabled);
  return (
    <TouchableWithoutFeedback
      onPress={disabled ? onPressWhenDisabled : onPress}
    >
      <View style={[styles.button, style]}>
        {children && children}
        {text && <Text style={[styles.text, textStyle || {}]}>{text}</Text>}
      </View>
    </TouchableWithoutFeedback>
  );
}

const generateStyles = (mode: AlowedColorModes, disabled: boolean) => {
  return StyleSheet.create({
    button: {
      backgroundColor: colors[mode].primaryButton,
      borderRadius: 10,
      justifyContent: "center",
      padding: 10,
      alignItems: "center",
      opacity: disabled ? 0.3 : 1,
    },
    text: {
      color: colors[mode].background,
    },
  });
};

export default Button;
