import { palette } from "@/theme";
import { Text, View } from "react-native";

const Checkbox = ({ checked }: { checked: boolean }) => (
  <View
    style={{
      width: 18,
      height: 18,
      borderWidth: 1,
      borderColor: "#999",
      borderRadius: 6,
      backgroundColor: checked ? palette.main[600] : "#fff",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {checked && <Text style={{ color: "#fff", fontSize: 12 }}>✓</Text>}
  </View>
);

export default Checkbox;