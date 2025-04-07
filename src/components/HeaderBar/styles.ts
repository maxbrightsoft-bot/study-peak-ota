import { Platform } from "react-native";

import { ScaledSheet } from "react-native-size-matters";
import { WINDOW_HEIGHT } from "@/utils/scaler";

export default ScaledSheet.create({
  container: {
    paddingHorizontal: "15@ms",
  },
  wrapperHeader: {
    width: "100%",
    height: (WINDOW_HEIGHT / 100) * (Platform.OS === "android" ? 7 : 9.5),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  txtTitle: {
    fontSize: "17@ms",
    fontWeight: "bold",
    width: "70%",
    textAlign: "center",
  },
  headerCenter: {
    flex: 3,
  },
  headerLeft: {
    flexDirection: "row",
    flex: 1,
    alignItems: "flex-start",
  },
  headerRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  viewIcon: {
    alignSelf: "center",
  },
});
