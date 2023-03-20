import { TextInput, StyleSheet, View, TextInputProps } from "react-native";
import fonts from "../../config/fonts";
import colors, { ColorMode as AlowedColorModes } from "../../config/colors";
import Text from "./Text";
import { useContext } from "react";
import ColorMode from "../../contexts/colorMode";

interface Props extends TextInputProps {
  label?: string;
  style?: object;
  labelStyle?: object;
  disabled?: boolean;
}

function AppTextInput({
  label,
  style,
  labelStyle,
  disabled = false,
  ...otherProps
}: Props) {
  const colorMode = useContext(ColorMode);
  const styles = generateStyles(colorMode);

  const disabledColor = disabled ? styles.disabledColor : {};
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={labelStyle}>{label}</Text>}
      <TextInput
        editable={!disabled}
        selectTextOnFocus={!disabled}
        style={[styles.input, disabledColor]}
        {...otherProps}
      ></TextInput>
    </View>
  );
}

const generateStyles = (mode: AlowedColorModes) => {
  return StyleSheet.create({
    input: {
      borderWidth: 1,
      borderRadius: 5,
      padding: 5,
      fontFamily: fonts.default,
      fontSize: fonts.sizeDefault,
      borderColor: colors[mode].soft,
      color: colors[mode].primary,
    },
    container: {
      flex: 1,
    },
    disabledColor: { backgroundColor: colors[mode].disabled },
  });
};

export default AppTextInput;
