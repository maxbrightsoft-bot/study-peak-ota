import AsyncStorage from "@react-native-async-storage/async-storage";

export const getDataStorage = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) return value
  } catch (e) {
    console.log("getData Storage fail", e);
  }
  return null;
};

export const setDataStorage = async (key: string, value: any) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    console.log("setData Storage fail");
  }
};

export const removeDataStorage = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (e) {
    console.log("remove Storage fail");
  }
};

export const checkKeyInclude = async (key: string) => {
  try {
    let value = await AsyncStorage.getItem(key);
    if (value != null) {
      return false;
    } else {
      return false;
    }
  } catch (error) {
    console.log("Check Key Storage fail");
  }
};
