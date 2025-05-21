import React from 'react'
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native'
import { Divider } from 'react-native-paper'
import { palette } from '@/theme'

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
        <Text style={{ ...styles.text, color: palette.error.main }}>{t('delete_schedule')}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 35,
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    fontWeight: '700',
    fontSize: 14,
    color: palette.main[500]
  }
})

export default ContentTooltip
