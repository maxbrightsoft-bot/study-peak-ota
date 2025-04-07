import { Dimensions } from "react-native";

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

export const WINDOW_WIDTH = Dimensions.get("window").width;
export const WINDOW_HEIGHT = Dimensions.get("window").height;

export const scaleSizeWidth = (size: number) =>
  (WINDOW_WIDTH / guidelineBaseWidth) * size;

export const scaleSizeHeight = (size: number) =>
  (WINDOW_HEIGHT / guidelineBaseHeight) * size;
