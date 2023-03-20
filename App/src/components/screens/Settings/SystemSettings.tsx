import { useContext, useState, useEffect, useRef } from "react";
import colors, { ColorMode as AllowedColorMode } from "../../../config/colors";
import fonts from "../../../config/fonts";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Modal,
  SafeAreaView,
  View,
} from "react-native";
import ColorMode from "../../../contexts/colorMode";
import Text from "../../basic/Text";
import { MaterialIcons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Screen from "../../basic/SafeBottomScrollableScreen";
import useSystemSettings from "../../../hooks/useSystemSettings";
import TextInput from "../../basic/TextInput";
import Button from "../../basic/Button";
import useModifySettings from "../../../hooks/useModifySystemSettings";
import AppAlert from "../../basic/Alert";
import { WebView } from "react-native-webview";
import isEqual from "lodash/isEqual";
import useAppSettings from "../../../hooks/useAppSettings";

export type SystemSettings = {
  wifiSsid: string;
  influxUrl: string;
  wifiPsk: string;
  apPsk: string;
  token: string;
  influxBucket: string;
  influxOrg: string;
  phone: string;
};

export default function SystemSettings() {
  const colorMode: AllowedColorMode = useContext(ColorMode);
  const styles = generateStyles(colorMode);

  const { data, isSuccess, isLoading, isError, isFetching, refetch } =
    useSystemSettings();
  const { data: appSettings, isSuccess: appSettingsAvailable } =
    useAppSettings();

  const [blocked, setBlocked] = useState(false);
  const fieldsBlocked = blocked || isFetching;

  const [updateVisible, setUpdateVisible] = useState(false);
  const [settings, setSettings] = useState({
    wifiSsid: "",
    wifiPsk: "",
    influxUrl: "",
    token: "",
    influxBucket: "",
    apPsk: "",
    phone: "",
    influxOrg: "",
  });

  const settingsCopy = useRef<SystemSettings>();

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

  useEffect(() => {
    refetch();
  }, []);

  const alertSuccess = () => {
    Alert.alert("Udało się!", "Ustawienia zostały zapisane w systemie!");
  };

  const { mutate: modifySettings } = useModifySettings({
    onSuccess: (response: any) => {
      const data: SystemSettings = response.data;
      setBlocked(false);
      setSettings(data);
      alertSuccess();
    },
    onError: async () => {
      const { data: currentData } = await refetch();
      if (isEqual(currentData, settingsCopy.current)) {
        alertSuccess();
      } else Alert.alert("Ups!", "Coś poszło nie tak!");
      setBlocked(false);
    },
  });

  return (
    <>
      {!isSuccess && (
        <AppAlert color={colors[colorMode].apply}>
          Musisz być podłączony do tej samej sieci co instalacja fotowoltaiczna!
        </AppAlert>
      )}
      {isSuccess && (
        <>
          <Button
            onPress={async () => {
              setBlocked(true);
              setSettings({ ...settings, ...appSettings });
              setBlocked(false);
            }}
            text="Kopiuj z aplikacji"
            style={styles.submit}
            disabled={fieldsBlocked || !appSettingsAvailable}
          />
          <TextInput
            disabled={fieldsBlocked}
            label="Nazwa sieci WiFi:"
            value={settings.wifiSsid}
            onChangeText={(value: string) => {
              updateField("wifiSsid", value);
            }}
          />
          <TextInput
            secureTextEntry={true}
            disabled={fieldsBlocked}
            label="Hasło WiFi:"
            value={settings.wifiPsk}
            onChangeText={(value: string) => {
              updateField("wifiPsk", value);
            }}
          />

          <TextInput
            placeholder="http://zettalight-database.local:8086"
            disabled={fieldsBlocked}
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
            label="Token (InfluxDB i dane na żywo):"
            value={settings.token}
            secureTextEntry={true}
            onChangeText={(value: string) => {
              updateField("token", value);
            }}
          />
          <TextInput
            disabled={fieldsBlocked}
            label="Telefon:"
            value={settings.phone}
            onChangeText={(value: string) => {
              updateField("phone", value);
            }}
          />
          <TextInput
            secureTextEntry={true}
            disabled={fieldsBlocked}
            label="Hasło hotspota konfiguracji:"
            value={settings.apPsk}
            onChangeText={(value: string) => {
              updateField("apPsk", value);
            }}
          />
          <Button
            disabled={fieldsBlocked}
            onPress={() => {
              setBlocked(true);
              settingsCopy.current = { ...settings };
              modifySettings(settings);
            }}
            text="Zapisz ustawienia"
            style={styles.submit}
          />

          <Button
            onPress={() => {
              setUpdateVisible(true);
            }}
            text="Aktualizacja oprogramowania systemu"
            style={styles.submit}
          />
        </>
      )}
      {isError && (
        <>
          <AppAlert style={styles.topMargin} color={colors[colorMode].discard}>
            Problem z połączeniem z instalacją fotowoltaiczną!
          </AppAlert>
          <Text style={[styles.topMargin, styles.text]}>
            Upewnij się, że jesteś w tej samej sieci, co instalacja
            fotowoltaiczna.
          </Text>
        </>
      )}
      {isLoading && (
        <ActivityIndicator
          style={styles.loading}
          size="large"
          color={colors[colorMode].primary}
        />
      )}

      <Text style={[styles.topMargin, styles.text]}>
        Konfiguracja systemu oraz aktualizacja oprogramowania są również
        dostępne z poziomu przeglądarki pod adresem:
      </Text>
      <Text style={[styles.topMargin, styles.address]}>
        http://zettalight-device.local
      </Text>

      <Text style={[styles.topMargin, styles.text, styles.info]}>
        Pamiętaj, że musisz być podłączony do tej samej sieci co instalacja
        fotowoltaiczna!
      </Text>
      <Text style={[styles.topMargin, styles.text]}>
        Jeżeli przeglądarka nie jest w stanie połączyć się ze wskazanym adresem,
        wprowadź w pole adresowe przeglądarki adres IP instalacji
        fotowoltaicznej (192.168.4.1 w przypadku hotspotu konfiguracyjnego)!
      </Text>
      <Modal animationType="slide" transparent={true} visible={updateVisible}>
        <View style={styles.modalContainer}>
          <SafeAreaView style={styles.modalContainer}>
            <Button
              style={styles.close}
              text="Zamknij"
              onPress={() => {
                setUpdateVisible(false);
              }}
            />
            <WebView
              source={{ uri: "http://zettalight-device.local/update" }}
            />
          </SafeAreaView>
        </View>
      </Modal>
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
    loading: { marginTop: 28, alignSelf: "center" },
    topMargin: { marginTop: 10 },

    address: { alignSelf: "center" },
    text: { textAlign: "justify" },
    info: { color: colors[mode].discard },
    modalContainer: {
      flex: 1,
      backgroundColor: colors[mode].background,
    },
    close: {
      marginTop: 10,
      marginBottom: 10,
      marginLeft: 50,
      marginRight: 50,
    },
  });
};
