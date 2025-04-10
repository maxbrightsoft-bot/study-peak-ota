import React from "react";
import {
  View,
  SafeAreaView,
  Text,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ms } from "react-native-size-matters";
import styles from "./styles";
import Icon from "react-native-vector-icons/MaterialIcons";

interface HeaderProps {
  back?: boolean;
  onBack?: () => void;
  title?: string;
  right?: any;
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  left?: any;
  center?: any;
  hideLogo?: boolean;
  onlyHaq?: boolean;
}

const HeaderBar = ({
  back,
  onBack,
  title,
  right,
  containerStyle,
  titleStyle,
  left,
  center,
}: HeaderProps) => {
  const navigation = useNavigation();

  const onPressBack = () => {
    !!onBack ? onBack() : navigation.goBack();
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <SafeAreaView style={styles.wrapperHeader}>
        <View style={styles.headerLeft}>
          {back && (
            <TouchableOpacity onPress={onPressBack}>
              <Icon name="arrow-back-ios" size={ms(20)} />
            </TouchableOpacity>
          )}
          {left && <View>{left}</View>}
        </View>
        {!!title ? (
          <Text
            style={[styles.txtTitle, titleStyle]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title || ""}
          </Text>
        ) : (
          !!center && <View style={[styles.headerCenter]}>{center}</View>
        )}

        <View style={styles.headerRight}>{!!right && right}</View>
      </SafeAreaView>
    </View>
  );
};

export default HeaderBar;
