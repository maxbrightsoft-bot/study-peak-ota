import { Dimensions } from "react-native";

export const GRID_COLUMNS = 12;
const screenWidth = Dimensions.get("window").width;

export const getColumnWidth = (columns: number) =>
  (columns / GRID_COLUMNS) * screenWidth;