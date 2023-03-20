import { useQuery } from "react-query";
import getInfluxDataByRange from "../services/getInfluxDataByRange";

type Point = {
  time: Date;
  lightSensor0: number;
  lightSensor1: number;
  lightSensor2: number;
};

const fetchGraphData = async () => {
  const now = new Date();
  const data = await getInfluxDataByRange(
    new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000),
    now
  );
  return data;
};

const useGraphData = () =>
  useQuery("GraphsData", fetchGraphData, {
    refetchInterval: 60000,
  });
export default useGraphData;
