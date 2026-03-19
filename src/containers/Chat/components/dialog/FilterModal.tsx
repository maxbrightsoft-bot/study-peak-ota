import { palette, TYPO } from '@/theme'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import SlideDrawerRoot from '@/components/ModalBase/SlideDrawerRoot'
import { Ionicons } from '@expo/vector-icons'
import { ScaledSheet } from 'react-native-size-matters'
import FilterForm from '../FilterForm'

interface Props {
  t: any
  title: string
  open: boolean
  onClose?: () => void
}

const FilterModal = ({ t, title, open, onClose = () => {} }: Props) => {
  return (
    <SlideDrawerRoot onClose={onClose} visible={open}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Ionicons name="close" size={20} color={palette.grey[900]} />
        </TouchableOpacity>
        <View>
          <Text style={{ fontSize: 16, fontWeight: 600, color: '#222222' }}>{title}</Text>
        </View>
        <View></View>
      </View>
      <FilterForm onSubmit={() => { }} />
    </SlideDrawerRoot>
  )
}


const styles = ScaledSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  examTitle: {
    ...TYPO.heading3,
    textAlign: 'center',
    marginBottom: 12
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  backText: {
    ...TYPO.button2,
    color: palette.main[500]
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: '16@ms',
    paddingHorizontal: '20@ms'
  },
})

export default FilterModal
