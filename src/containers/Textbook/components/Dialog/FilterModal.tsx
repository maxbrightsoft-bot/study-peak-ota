import CommonDialog from '@/components/ModalBase/CommonDialog'
import { palette, TYPO } from '@/theme'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import FilterForm from '../FilterForm'
import SlideDrawerRoot from '@/components/ModalBase/SlideDrawerRoot'
import { Ionicons } from '@expo/vector-icons'
import { ScaledSheet } from 'react-native-size-matters'
import { FilterValues, TextbookQuery } from '../../configs/type'

interface Props {
  t: any
  title: string
  open: boolean
  onClose?: () => void
  textbookFilter: TextbookQuery
  handleChangeFilter: (filter: FilterValues) => void
}

const FilterModal = ({ t, title, open, textbookFilter, onClose = () => {}, handleChangeFilter }: Props) => {
  return (
    <SlideDrawerRoot onClose={onClose} visible={open}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onClose}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="close" size={24} color={palette.grey[900]} />
        </TouchableOpacity>
        <View>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#222222' }}>{title}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>
      <FilterForm onSubmit={handleChangeFilter} textbookFilter={textbookFilter} />
    </SlideDrawerRoot>
  )
}


const styles = ScaledSheet.create({
  container: {
    paddingHorizontal: '24@ms',
    paddingTop: '24@ms',
    paddingBottom: '16@ms',
  },
  examTitle: {
    ...TYPO.heading3,
    textAlign: 'center',
    marginBottom: '12@ms',
  },
  backButton: {
    width: '40@ms',
    height: '40@ms',
    alignItems: 'center',
    justifyContent: 'center',
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
