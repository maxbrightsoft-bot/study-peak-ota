import { ms, scale, ScaledSheet, verticalScale } from "react-native-size-matters";

export default ScaledSheet.create({
    containerHeader: {
    //   backgroundColor: Colors.primary38,
    //   borderBottomWidth: '1@ms',
    },
    container: {
      flex: 1,
    },
    containerInputStyle: {
        marginHorizontal: scale(0),
        marginTop: verticalScale(2),
        marginBottom: verticalScale(10),
        borderRadius: ms(7)
      },
      textInput: {
        fontSize: ms(13),
        height: scale(45),
        lineHeight: scale(18),
        color: 'black',
      },
      labelInput: {
        fontSize: 14,
      },
  });
  