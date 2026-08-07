import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { Divider } from 'react-native-paper'
import { palette } from '@/theme'
import { ScaledSheet } from 'react-native-size-matters'

type Props = {
  onEdit: () => void
  onDelete: () => void
  t: any
}

const ContentTooltip = ({ t, onEdit, onDelete }: Props) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onEdit} style={styles.button}>
        <Text style={styles.text}>{t('edit_schedule')}</Text>
      </TouchableOpacity>

      <Divider />

      <TouchableOpacity onPress={onDelete} style={styles.button}>
        <Text style={[styles.text, { color: palette.error.main }]}>{t('delete_schedule')}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = ScaledSheet.create({
  container: {
    paddingVertical: '8@ms'
  },
  button: {
    paddingVertical: '12@ms',
    paddingHorizontal: '35@ms',
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    fontWeight: '700',
    fontSize: '14@ms',
    color: palette.main[500]
  }
})

export default ContentTooltip
