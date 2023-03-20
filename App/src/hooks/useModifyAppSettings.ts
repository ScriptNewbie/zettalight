import { useMutation } from "react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppSettings } from "../components/screens/Settings/AppSettings";

interface Props {
  onSuccess?: (response: AppSettings) => void;
  onError?: () => void;
}

const useModifyAppSettings = (props: Props) => {
  return useMutation(
    (data: AppSettings) => {
      const liveDataUrl =
        data.liveDataUrl[data.liveDataUrl.length - 1] !== "/"
          ? data.liveDataUrl
          : data.liveDataUrl.slice(0, -1);
      const influxUrl =
        data.influxUrl[data.influxUrl.length - 1] !== "/"
          ? data.influxUrl
          : data.influxUrl.slice(0, -1);
      AsyncStorage.setItem("influxUrl", influxUrl);
      AsyncStorage.setItem("liveDataUrl", liveDataUrl);
      AsyncStorage.setItem("influxOrg", data.influxOrg);
      AsyncStorage.setItem("influxBucket", data.influxBucket);
      AsyncStorage.setItem("token", data.token);
      return {
        liveDataUrl,
        influxUrl,
        token: data.token,
        influxOrg: data.influxOrg,
        influxBucket: data.influxBucket,
      };
    },
    {
      onSuccess: props.onSuccess,
      onError: props.onError,
    }
  );
};
export default useModifyAppSettings;
