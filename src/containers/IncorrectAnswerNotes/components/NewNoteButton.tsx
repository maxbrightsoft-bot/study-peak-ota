import React, { FC, PropsWithChildren } from 'react'
import { GestureResponderEvent, Text, TouchableOpacity, View } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import { useTranslation } from 'react-i18next'
import EditIcon from '@/assets/iconJSX/edit'

interface Props extends PropsWithChildren {
  onPress: (event: GestureResponderEvent) => void
}

const NewNoteButton: FC<Props> = ({ onPress }) => {
  const { t } = useTranslation()
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.container}>
        <Text style={{ color: "#222222"}}>{t('write_a_note_of_incorrect_answers')}</Text>
        <EditIcon />
      </View>
    </TouchableOpacity>
  )
}

const styles = ScaledSheet.create({
  container: {
    alignSelf: "flex-end",
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: '1@ms',
    borderRadius: '26@ms',
    paddingVertical: '7@ms',
    paddingHorizontal: '12@ms',
    gap: '8@ms',
    borderColor: "#222222"
  }
})

export default NewNoteButton
