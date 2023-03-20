import { useQuery } from "react-query";
import http from "../services/httpServices";

const fetchLiveData = async () => {
  const { data } = await http.get("liveData", "");
  return data;
};

const useLiveData = () =>
  useQuery("LiveData", fetchLiveData, {
    refetchInterval: 1000,
  });
export default useLiveData;
