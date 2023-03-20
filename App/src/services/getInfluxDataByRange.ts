import AsyncStorage from "@react-native-async-storage/async-storage";
import http from "../services/httpServices";
import { influxCsvToObjectArray } from "./influxCsvToObjectArray";

let influxBucket = AsyncStorage.getItem("influxBucket");
export const updateInfluxBucket = () => {
  influxBucket = AsyncStorage.getItem("influxBucket");
};

export default async (start: Date, end: Date) => {
  const bucket = await influxBucket;
  const { data } = await http.post("influxDb", "/api/v2/query", {
    query: `from(bucket: "${bucket}") |> range(start: ${start.toISOString()}, stop: ${end.toISOString()})`,
  });
  return influxCsvToObjectArray(data);
};
