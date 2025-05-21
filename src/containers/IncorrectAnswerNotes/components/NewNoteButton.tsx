import React, { FC, PropsWithChildren } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { GestureResponderEvent, Text, TouchableOpacity, View } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import { useTranslation } from 'react-i18next'
import { palette } from '@/theme'

interface Props extends PropsWithChildren {
  onPress: (event: GestureResponderEvent) => void
}

const NewNoteButton: FC<Props> = ({ onPress }) => {
  const { t } = useTranslation()
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.container}>
        <Ionicons name='add-circle' size={13} color="#5d5d5b" />
        <Text>{t('write_a_note_of_incorrect_answers')}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = ScaledSheet.create({
  container: {
    width: 'auto',
    alignSelf: "flex-start",
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 20,
    gap: 8,
    marginTop: 12,
    borderColor: palette.grey[300]
  }
})

export default NewNoteButton
