import { useQuery } from "react-query";
import http from "../services/httpServices";

const fetchSystemSettings = async () => {
  const { data } = await http.get("configApi", "/config");
  return data;
};

const useSystemSettings = () =>
  useQuery("SystemSettings", fetchSystemSettings, {
    refetchInterval: false,
  });
export default useSystemSettings;
