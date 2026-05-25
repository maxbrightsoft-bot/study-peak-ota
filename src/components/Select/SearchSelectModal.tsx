import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, SafeAreaView, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { palette, TYPO } from '@/theme'
import SlideDrawerRoot from '../ModalBase/SlideDrawerRoot'
import TextField from '@/components/Input/TextField'
import { ScaledSheet, ms } from 'react-native-size-matters'

interface Option {
  label: string
  value: any
  subtitle?: string
}

interface SearchSelectModalProps {
  visible: boolean
  onClose: () => void
  onSelect: (item: Option) => void
  options: Option[]
  onSearch: (text: string) => void
  placeholder?: string
  title?: string
  loading?: boolean
  searchValue?: string
}

const SearchSelectModal: React.FC<SearchSelectModalProps> = ({
  visible,
  onClose,
  onSelect,
  options,
  onSearch,
  placeholder,
  title,
  loading,
  searchValue
}) => {
  const { t } = useTranslation()
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    if (!visible) {
      setSearchText('')
    }
  }, [visible])

  useEffect(() => {
    if (searchValue !== undefined && searchValue !== searchText) {
      setSearchText(searchValue)
    }
  }, [searchValue, searchText])

  const handleSearchChange = (text: string) => {
    setSearchText(text)
    onSearch(text)
  }

  const renderItem = ({ item }: { item: Option }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => {
        onSelect(item)
        onClose()
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.itemText}>{item.label}</Text>
        {item.subtitle ? <Text style={styles.itemSubtitleFull}>{item.subtitle}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={16} color={palette.grey[400]} />
    </TouchableOpacity>
  )

  return (
    <SlideDrawerRoot visible={visible} onClose={onClose} position="right">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={palette.grey[900]} />
          </TouchableOpacity>
          <Text style={styles.title}>{title || t('search_find')}</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.searchContainer}>
          <View>
            <TextField
              placeholder={placeholder || t('search_for')}
              value={searchText}
              onChangeText={handleSearchChange}
              rightComponent={
                searchText.length > 0 ? (
                  <TouchableOpacity onPress={() => handleSearchChange('')}>
                    <Ionicons name="close-circle" size={20} color={palette.grey[400]} />
                  </TouchableOpacity>
                ) : null
              }
            />
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={palette.main[600]} />
          </View>
        ) : (
          <FlatList
            data={options}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${item.value}-${index}`}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{searchText.length > 0 ? t('no_data') : t('please_enter')}</Text>
              </View>
            }
            ListFooterComponent={
              searchText.length > 0 ? (
                <TouchableOpacity
                  style={styles.customBtn}
                  onPress={() => {
                    onSelect({ label: searchText, value: searchText })
                    onClose()
                  }}
                >
                  <Text style={styles.customBtnText}>{t('use_as_entered', { text: searchText })}</Text>
                </TouchableOpacity>
              ) : null
            }
          />
        )}
      </SafeAreaView>
    </SlideDrawerRoot>
  )
}

export default SearchSelectModal

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ms(16),
    paddingVertical: ms(12),
    borderBottomWidth: '1@ms',
    borderBottomColor: palette.grey[100]
  },
  backBtn: {
    padding: ms(4)
  },
  title: {
    ...TYPO.heading3,
    color: palette.grey[900]
  },
  searchContainer: {
    padding: ms(16)
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.grey[100],
    borderRadius: ms(12),
    paddingHorizontal: ms(12),
    height: ms(48)
  },
  searchIcon: {
    marginRight: ms(8)
  },
  searchInput: {
    flex: 1,
    fontSize: ms(16),
    color: palette.grey[900],
    paddingVertical: ms(8)
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listContent: {
    paddingBottom: ms(20)
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ms(20),
    paddingVertical: ms(16),
    borderBottomWidth: '1@ms',
    borderBottomColor: palette.grey[50]
  },
  itemText: {
    ...TYPO.body2,
    color: palette.grey[800],
    flex: 1,
    marginRight: ms(8)
  },
  emptyContainer: {
    padding: ms(40),
    alignItems: 'center'
  },
  emptyText: {
    ...TYPO.body3,
    color: palette.grey[500],
    textAlign: 'center'
  },
  itemSubtitle: {
    fontSize: ms(12),
    color: palette.grey[400],
    marginTop: ms(4)
  },
  itemSubtitleInline: {
    fontSize: ms(12),
    color: palette.grey[400],
    marginLeft: ms(6),
    fontWeight: '400'
  },
  itemSubtitleFull: {
    fontSize: ms(12),
    color: palette.grey[400],
    marginTop: ms(4),
    flexWrap: 'wrap'
  },
  customBtn: {
    marginHorizontal: ms(16),
    marginVertical: ms(12),
    paddingVertical: ms(12),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.main[600],
    borderRadius: ms(10),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2
  },
  customBtnText: {
    color: '#fff',
    fontSize: ms(14),
    fontWeight: '600'
  }
})
