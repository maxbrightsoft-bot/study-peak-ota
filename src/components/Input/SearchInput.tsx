import { palette, TYPO } from '@/theme'
import { Ionicons } from '@expo/vector-icons'
import { StyleProp, TextInput, View, ViewStyle } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'

type Props = {
  placeholder?: string
  value: string
  ref?: any
  style?: StyleProp<ViewStyle>
  onChangeText: (text: string) => void
}

const SearchInput = ({ ref, style, value, placeholder, onChangeText }: Props) => {
  return (
    <View style={[styles.searchBox, style]}>
      <View style={styles.container}>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            width: 50,
            height: 50
          }}
        >
          <Ionicons name="search" size={18} color={palette.grey[700]} />
        </View>
        <TextInput style={{ color: "#222222" }} ref={ref} value={value} onChangeText={onChangeText} placeholderTextColor={palette.grey[400]} placeholder={placeholder} />
      </View>
      {value?.length > 0 && (
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center', marginRight: 4
          }}
        >
          <Ionicons onPress={() => onChangeText('')} name="close-circle" size={18} color={palette.grey[700]} />
        </View>
      )}
    </View>
  )
}

export default SearchInput

const styles = ScaledSheet.create({
  searchBox: {
    flexDirection: 'row',
    alignContent: 'center',
    backgroundColor: palette.grey[100],
    borderRadius: '255@ms',
    paddingVertical: '2@ms',
    paddingHorizontal: "4@ms",
    justifyContent: 'space-between'
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'center'
  },
  titleText: {
    ...TYPO.button3,
    color: palette.grey[300]
  },
  scoreText: {
    ...TYPO.button3,
    color: palette.grey[900]
  }
})
