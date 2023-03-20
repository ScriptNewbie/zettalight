import React, { ReactNode, useContext } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import colors, { ColorMode as AllowedColorMode } from "../../config/colors";
import ColorMode from "../../contexts/colorMode";

interface Props {
  style?: Object;
  children: ReactNode;
}
function Screen({ style, children }: Props) {
  const colorMode = useContext(ColorMode);
  const styles = generateStyles(colorMode);

  return (
    <ScrollView style={[styles.screen, style]}>
      {children}
      <View style={styles.safe}></View>
    </ScrollView>
  );
}

const generateStyles = (mode: AllowedColorMode) => {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors[mode].background,
    },
    safe: {
      height: 50,
    },
  });
};

export default Screen;
