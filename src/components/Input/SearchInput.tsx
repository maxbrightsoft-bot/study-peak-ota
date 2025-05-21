import { palette, TYPO } from '@/theme'
import { Ionicons } from '@expo/vector-icons'
import { TextInput, View } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'

type Props = {
  placeholder?: string
  value: string
  ref?: any
  onChangeText: (text: string) => void
}

const SearchInput = ({ ref, value, placeholder, onChangeText }: Props) => {
  return (
    <View style={styles.searchBox}>
      <View style={styles.container}>
        <Ionicons name="search-outline" size={24} color={palette.grey[700]} />
        <TextInput ref={ref} value={value} onChangeText={onChangeText} placeholder={placeholder} />
      </View>
      {value?.length > 0 && <Ionicons onPress={() => onChangeText('')} name="close-circle" size={24} color={palette.grey[700]} />}
    </View>
  )
}

export default SearchInput

const styles = ScaledSheet.create({
  searchBox: {
    flexDirection: 'row',
    alignContent: 'center',
    borderWidth: 1,
    borderColor: palette.grey[100],
    borderRadius: '255@ms',
    paddingHorizontal: '12@ms',
    paddingVertical: '8@ms',
    justifyContent: 'space-between'
  },
  container: {
    flexDirection: 'row',
    alignContent: 'center',
    gap: "12@ms",
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
