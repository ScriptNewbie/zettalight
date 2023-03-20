import { useQuery } from "react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";

const fetchSettings = async () => {
  const liveDataUrl = await AsyncStorage.getItem("liveDataUrl");
  const influxUrl = await AsyncStorage.getItem("influxUrl");
  const influxBucket = await AsyncStorage.getItem("influxBucket");
  const influxOrg = await AsyncStorage.getItem("influxOrg");
  const token = await AsyncStorage.getItem("token");

  return {
    liveDataUrl: liveDataUrl
      ? liveDataUrl
      : "http://zettalight-device.local:5000",
    influxUrl: influxUrl ? influxUrl : "http://zettalight-database.local:8086",
    influxOrg: influxOrg ? influxOrg : "zettalight",
    influxBucket: influxBucket ? influxBucket : "zettalight",
    token: token ? token : "",
  };
};

const useSettings = () =>
  useQuery("AppSettings", fetchSettings, {
    refetchInterval: false,
  });
export default useSettings;
