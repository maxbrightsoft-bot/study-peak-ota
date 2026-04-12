import { useRef } from 'react'
import { palette, TYPO } from '@/theme'
import { Ionicons } from '@expo/vector-icons'
import {
  StyleProp,
  TextInput,
  View,
  ViewStyle,
  TouchableOpacity,
  Pressable
} from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'

type Props = {
  placeholder?: string
  value: string
  style?: StyleProp<ViewStyle>
  onChangeText: (text: string) => void
}

const SearchInput = ({ style, value, placeholder, onChangeText }: Props) => {
  const inputRef = useRef<TextInput>(null)

  return (
    <Pressable 
      onPress={() => inputRef.current?.focus()}
    >
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

          <TextInput
            ref={inputRef}
            style={{ color: '#222222', }}
            value={value}
            onChangeText={onChangeText}
            placeholderTextColor={palette.grey[400]}
            placeholder={placeholder}
            pointerEvents="none"
          />
        </View>

        {value?.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              onChangeText('')
              inputRef.current?.focus()
            }}
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 4
            }}
          >
            <Ionicons name="close-circle" size={18} color={palette.grey[700]} />
          </TouchableOpacity>
        )}
      </View>
    </Pressable>
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
