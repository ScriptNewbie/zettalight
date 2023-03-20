import { useMutation } from "react-query";
import http from "../services/httpServices";
import { SystemSettings } from "../components/screens/Settings/SystemSettings";

interface Props {
  onSuccess?: (response: any) => void;
  onError?: () => void;
}

const useModifyAppSettings = (props: Props) => {
  return useMutation(
    (data: SystemSettings) => {
      return http.post("configApi", "/config", data);
    },
    {
      onSuccess: props.onSuccess,
      onError: props.onError,
    }
  );
};
export default useModifyAppSettings;
