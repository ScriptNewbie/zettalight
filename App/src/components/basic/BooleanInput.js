import { StyleSheet, View, Switch, Platform } from "react-native";
import Text from "./Text";

function BooleanInput({ label, style, value, onChange, ...otherProps }) {
  return (
    <View style={[styles.container, style]}>
      {label && isAndroid && (
        <Text style={styles.label} value={value}>
          {label}:
        </Text>
      )}
      <Switch onValueChange={onChange} value={value} {...otherProps} />
      {label && !isAndroid && (
        <Text style={styles.label} value={value}>
          {label}.
        </Text>
      )}
    </View>
  );
}

const isAndroid = Platform.OS === "android" ? true : false;

const styles = StyleSheet.create({
  label: {
    marginLeft: Platform.OS === "android" ? 0 : 5,
  },
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: Platform.OS === "android" ? "space-between" : "flex-start",
  },
});

export default BooleanInput;
