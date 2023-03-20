import { useContext, useState } from "react";
import colors, { ColorMode as AllowedColorMode } from "../../../config/colors";
import { StyleSheet, View } from "react-native";
import ColorMode from "../../../contexts/colorMode";

import Screen from "../../basic/SafeBottomScrollableScreen";
import Picker from "../../basic/Picker";
import AppSettings from "./AppSettings";
import SystemSettings from "./SystemSettings";

export default function Settings() {
  const colorMode: AllowedColorMode = useContext(ColorMode);
  const styles = generateStyles(colorMode);

  const [tab, setTab] = useState<String>("app");

  return (
    <Screen>
      <View style={styles.container}>
        <Picker
          style={styles.marginBottom}
          picked={tab}
          options={[
            { name: "Aplikacja", value: "app" },
            { name: "System", value: "system" },
          ]}
          onChange={(value) => {
            setTab(value);
          }}
        />
        {tab === "app" ? <AppSettings /> : <SystemSettings />}
      </View>
    </Screen>
  );
}

const generateStyles = (mode: AllowedColorMode) => {
  return StyleSheet.create({
    container: {
      margin: 15,
    },
    submit: {
      backgroundColor: colors[mode].apply,
      marginTop: 10,
      marginBottom: 10,
    },
    marginBottom: {
      marginBottom: 10,
    },
  });
};
