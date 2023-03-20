import {
  TouchableWithoutFeedback,
  StyleSheet,
  View,
  Platform,
  Modal,
  Button,
  SafeAreaView,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React, { useState, useContext } from "react";

import colors, { ColorMode as AllowedColorMode } from "../../config/colors";
import Text from "./Text";

import fonts from "../../config/fonts";
import ColorMode from "../../contexts/colorMode";

interface Props {
  label?: String;
  style?: Object;
  value: Date;
  disabled?: boolean;
  updateDate: (newDate: Date) => void;
}

type CustomConfirmation = {
  type: String;
};

function TimeInput({
  label,
  style,
  updateDate,
  value,
  disabled = false,
  ...otherProps
}: Props) {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const colorMode = useContext(ColorMode);
  const styles = generateStyles(colorMode);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
    if (Platform.OS === "ios") setTempValue(value);
  };
  const handleChange = (
    e: DateTimePickerEvent | CustomConfirmation,
    date?: Date
  ) => {
    setDatePickerVisibility(false);
    if (e.type === "set") {
      updateDate(date ? date : new Date());
    }
  };
  const handleTempChange = (e: DateTimePickerEvent, date?: Date) => {
    setTempValue(date ? date : new Date());
  };

  const disabledColor = disabled ? styles.disabledColor : {};
  return (
    <View style={[styles.container, style]}>
      {label && <Text>{label}</Text>}

      <TouchableWithoutFeedback onPress={showDatePicker}>
        <View style={[styles.inputContainer, disabledColor]}>
          <Text style={styles.input} {...otherProps}>
            {Platform.OS === "ios"
              ? value.toLocaleString("pl-PL", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : value.toLocaleString("pl-PL", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
          </Text>
        </View>
      </TouchableWithoutFeedback>
      {!disabled &&
        (Platform.OS === "android" ? (
          isDatePickerVisible && (
            <DateTimePicker
              onChange={handleChange}
              mode="date"
              value={value}
            ></DateTimePicker>
          )
        ) : (
          <Modal
            transparent={true}
            visible={isDatePickerVisible}
            animationType="slide"
            supportedOrientations={["portrait", "landscape"]}
          >
            <SafeAreaView style={styles.modal}>
              <View style={styles.modalContent}>
                <DateTimePicker
                  onChange={handleTempChange}
                  mode="datetime"
                  value={tempValue}
                  display="spinner"
                  themeVariant={colorMode}
                ></DateTimePicker>
                <View style={styles.buttonGroup}>
                  <Button
                    title="Zamknij"
                    onPress={() => {
                      setDatePickerVisibility(false);
                    }}
                  />
                  <Button
                    title="Zatwierdź"
                    onPress={() => {
                      const input = {
                        type: "set",
                      };
                      handleChange(input, tempValue);
                    }}
                  />
                </View>
              </View>
            </SafeAreaView>
          </Modal>
        ))}
    </View>
  );
}

const generateStyles = (mode: AllowedColorMode) => {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    input: {
      textAlign: "center",
      fontSize: fonts.sizeVerySmall,
    },
    inputContainer: {
      borderWidth: 1,
      borderRadius: 5,
      borderColor: colors[mode].soft,
      padding: 5,
    },
    disabledColor: { backgroundColor: colors[mode].disabled },
    buttonGroup: {
      flexDirection: "row",
      borderTopWidth: 1,
      borderColor: colors[mode].soft,
      justifyContent: "space-evenly",
      padding: 10,
    },
    modal: {
      flexDirection: "row",
      flex: 1,
      justifyContent: "center",
    },
    modalContent: {
      backgroundColor: colors[mode].background,
      alignSelf: "flex-end",
      marginBottom: 10,
      flex: 1,
      borderRadius: 30,
      marginLeft: 15,
      marginRight: 15,
      borderWidth: 1,
      borderColor: colors[mode].soft,
    },
  });
};

export default TimeInput;
