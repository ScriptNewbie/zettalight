import { useContext, useState, useEffect } from "react";
import colors, { ColorMode as AllowedColorMode } from "../../../config/colors";
import { Alert, StyleSheet, View } from "react-native";
import ColorMode from "../../../contexts/colorMode";
import useAppSettings from "../../../hooks/useAppSettings";
import TextInput from "../../basic/TextInput";
import Button from "../../basic/Button";
import useModifyAppSettings from "../../../hooks/useModifyAppSettings";
import {
  updateLiveDataUrl,
  updateToken,
  updateInfluxUrl,
  updateInfluxOrg,
} from "../../../services/httpServices";
import { updateInfluxBucket } from "../../../services/getInfluxDataByRange";
import useSystemSettings from "../../../hooks/useSystemSettings";

export type AppSettings = {
  liveDataUrl: string;
  influxUrl: string;
  influxBucket: string;
  influxOrg: string;
  token: string;
};

export default function DeviceSettings() {
  const colorMode: AllowedColorMode = useContext(ColorMode);
  const styles = generateStyles(colorMode);

  const [blockFields, setBlockFields] = useState(false);

  const { data, isLoading, isSuccess, dataUpdatedAt } = useAppSettings();

  const fieldsBlocked = blockFields || !isSuccess;

  const { isSuccess: systemSettingsAvailable, refetch: fetchSystemSettings } =
    useSystemSettings();

  const [settings, setSettings] = useState({
    liveDataUrl: "",
    influxUrl: "",
    influxBucket: "",
    influxOrg: "",
    token: "",
  });

  const updateField = (target: keyof typeof settings, value: string) => {
    const newSettings = { ...settings };
    newSettings[target] = value;
    setSettings(newSettings);
  };

  useEffect(() => {
    if (isSuccess) {
      setSettings(data);
    }
  }, [data]);

  const { mutate: modifySettings } = useModifyAppSettings({
    onSuccess: (response: AppSettings) => {
      Alert.alert("Sukces!", "Udało się zapisać ustawienia!");
      setSettings(response);
      updateToken();
      updateLiveDataUrl();
      updateInfluxUrl();
      updateInfluxOrg();
      updateInfluxBucket();
    },
    onError: () => {
      Alert.alert("Błąd", "Wystąpił błąd podczas zapisywania ustawień!");
    },
  });

  return (
    <>
      <Button
        onPress={async () => {
          setBlockFields(true);
          const { data } = await fetchSystemSettings();
          setSettings({ ...settings, ...data });
          setBlockFields(false);
        }}
        onPressWhenDisabled={() => {
          Alert.alert(
            "",
            "Musisz być w tej samej sieci co instalacja fotowoltaiczna!"
          );
        }}
        text="Kopiuj z systemu"
        style={styles.submit}
        disabled={!isSuccess || !systemSettingsAvailable || blockFields}
      />
      <TextInput
        disabled={fieldsBlocked}
        placeholder="http://zettalight-device.local:5000"
        label="Adres danych na żywo:"
        value={settings.liveDataUrl}
        onChangeText={(value: string) => {
          updateField("liveDataUrl", value);
        }}
      />
      <TextInput
        disabled={fieldsBlocked}
        placeholder="http://zettalight-database.local:8086"
        label="Adres bazy danych InfluxDB:"
        value={settings.influxUrl}
        onChangeText={(value: string) => {
          updateField("influxUrl", value);
        }}
      />
      <TextInput
        disabled={fieldsBlocked}
        label="InfluxDB - organizacja:"
        value={settings.influxOrg}
        onChangeText={(value: string) => {
          updateField("influxOrg", value);
        }}
      />
      <TextInput
        disabled={fieldsBlocked}
        label="InfluxDB - koszyk:"
        value={settings.influxBucket}
        onChangeText={(value: string) => {
          updateField("influxBucket", value);
        }}
      />
      <TextInput
        disabled={fieldsBlocked}
        secureTextEntry={true}
        label="Token (InfluxDB i dane na żywo):"
        value={settings.token}
        onChangeText={(value: string) => {
          updateField("token", value);
        }}
      />
      <Button
        onPress={() => {
          modifySettings(settings);
        }}
        text="Zapisz ustawienia"
        style={styles.submit}
        disabled={fieldsBlocked}
      />
      <View style={styles.space} />
    </>
  );
}

const generateStyles = (mode: AllowedColorMode) => {
  return StyleSheet.create({
    submit: {
      backgroundColor: colors[mode].apply,
      marginTop: 10,
      marginBottom: 10,
    },
    space: {
      height: 250,
    },
  });
};
