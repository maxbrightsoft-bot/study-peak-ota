import React, { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { palette, TYPO } from '@/theme'
import { ms } from 'react-native-size-matters'
import { searchSchools, NeisSchool } from '@/services/neisService'
import { debounce } from 'lodash'
import SearchSelectModal from './SearchSelectModal'

type Props = {
  value: string
  onValueChange: (value: string) => void
  style?: any
  placeholder?: string
}

const SchoolSearchSelect = ({ value, onValueChange, style, placeholder }: Props) => {
  const { t } = useTranslation()
  const [options, setOptions] = useState<{ label: string; value: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)

  const handleSearch = useCallback(
    debounce(async (keyword: string) => {
      if (!keyword || keyword.length < 2) {
        setOptions([])
        return
      }

      setLoading(true)
      try {
        const schools = await searchSchools(keyword)
        const newOptions = schools.map((school: NeisSchool) => ({
          label: school.SCHUL_NM,
          value: school.SCHUL_NM,
        }))
        setOptions(newOptions)
      } finally {
        setLoading(false)
      }
    }, 500),
    []
  )

  const handleSelect = (item: { label: string; value: string }) => {
    onValueChange(item.value)
    setIsModalVisible(false)
  }

  return (
    <View style={style}>
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={[styles.triggerText, !value && styles.placeholder]}>
          {value || placeholder || t('select_placeholder')}
        </Text>
        <Ionicons name="search" size={20} color={palette.grey[400]} />
      </TouchableOpacity>

      <SearchSelectModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSelect={handleSelect}
        options={options}
        onSearch={handleSearch}
        loading={loading}
        title={t('search_find')}
        placeholder={t('type_at_least_{number}_characters_to_search', { number: 2 })}
      />

    </View>
  )
}

export default SchoolSearchSelect

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.grey[100],
    borderRadius: ms(10),
    height: ms(50),
    paddingHorizontal: ms(12),
  },
  triggerText: {
    fontSize: ms(14),
    color: '#222222',
    fontWeight: '500',
    flex: 1,
  },
  placeholder: {
    color: palette.grey[500],
    fontWeight: '400',
  },

})

