import React, { useRef, useState } from 'react'
import { FlatList, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { TFunction } from 'i18next'
import { ScaledSheet } from 'react-native-size-matters'
import { palette } from '@/theme'
import TextField from '@/components/Input/TextField'
import useAcademySearch from '../hooks/useAcademySearch'
import { getGuestErrorMessage, isSameGuestAcademy, withStudySpaceFirst } from '../configs/helpers'
import { getAcademyPickerView, shouldShowStudySpace } from '../configs/academyPicker'
import { GuestAcademy } from '../configs/types'
import AcademyPickerRow from './AcademyPickerRow'
import { AcademyPickerEmpty, AcademyPickerError, AcademyPickerMore, AcademyPickerSkeleton } from './AcademyPickerStates'

type AcademyPickerModalProps = {
  t: TFunction<'translation', undefined>
  visible: boolean
  selected?: GuestAcademy
  onSelect: (academy: GuestAcademy) => void
  onClose: () => void
}

const AcademyPickerModal = ({ t, visible, selected, onSelect, onClose }: AcademyPickerModalProps) => {
  const { query, items, isLoading, isLoadingMore, error, moreError, setQuery, loadMore, retry } =
    useAcademySearch(visible)
  const [isFocused, setFocused] = useState<boolean>(false)
  const inputRef = useRef<TextInput>(null)

  const studySpace: GuestAcademy = { name: t('my_study_space'), domain: '', isLearningSpace: true }
  const studySpaceVisible = shouldShowStudySpace(studySpace.name, query)
  const view = getAcademyPickerView({
    query,
    isLoading,
    hasError: !!error,
    itemCount: items.length,
    studySpaceVisible
  })
  const [pinned, ...academies] = withStudySpaceFirst(items, studySpace)

  const handleClear = () => {
    setQuery('')
    inputRef.current?.focus()
  }

  const renderItem = ({ item }: { item: GuestAcademy }) => (
    <AcademyPickerRow t={t} item={item} selected={isSameGuestAcademy(selected, item)} onSelect={onSelect} />
  )

  const renderFooter = () => {
    if (view === 'loading') return <AcademyPickerSkeleton t={t} />
    if (view === 'error') return <AcademyPickerError t={t} message={getGuestErrorMessage(t, error)} onRetry={retry} />
    if (view === 'empty') return <AcademyPickerEmpty t={t} />
    if (moreError) {
      return <AcademyPickerError t={t} message={getGuestErrorMessage(t, moreError)} onRetry={loadMore} />
    }
    return isLoadingMore ? <AcademyPickerMore t={t} /> : null
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton} accessibilityLabel={t('close')}>
            <Ionicons name="close" size={24} color={palette.grey[900]} />
          </TouchableOpacity>
          <Text style={styles.title}>{t('guest_select_academy')}</Text>
          <View style={styles.headerButton} />
        </View>
        <Text style={styles.subtitle}>{t('guest_academy_subtitle')}</Text>
        <View style={styles.search}>
          <TextField
            inputRef={inputRef}
            style={[styles.field, isFocused && styles.fieldFocused]}
            placeholder={t('guest_academy_search_placeholder')}
            value={query}
            onChangeText={setQuery}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoFocus
            autoCorrect={false}
            spellCheck={false}
            autoCapitalize="none"
            rightComponent={
              <View style={styles.adornments}>
                {query ? (
                  <TouchableOpacity
                    onPress={handleClear}
                    style={styles.clearButton}
                    accessibilityLabel={t('guest_academy_clear_search')}
                  >
                    <Ionicons name="close-circle" size={20} color={palette.grey[400]} />
                  </TouchableOpacity>
                ) : null}
                <Ionicons name="search" size={20} color={isFocused ? palette.main[600] : palette.grey[500]} />
              </View>
            }
          />
        </View>
        {studySpaceVisible ? (
          <View style={styles.pinned}>
            <AcademyPickerRow
              t={t}
              item={pinned}
              selected={isSameGuestAcademy(selected, pinned)}
              onSelect={onSelect}
            />
          </View>
        ) : null}
        {academies.length ? <Text style={styles.sectionLabel}>{t('guest_academy_section_label')}</Text> : null}
        <FlatList
          data={academies}
          keyExtractor={item => item.domain}
          renderItem={renderItem}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={styles.list}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      </SafeAreaView>
    </Modal>
  )
}

export default AcademyPickerModal

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.grey[0]
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '16@ms',
    paddingVertical: '8@ms'
  },
  headerButton: {
    width: '44@ms',
    height: '44@ms',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: '17@ms',
    fontWeight: '700',
    color: palette.grey[900]
  },
  subtitle: {
    paddingHorizontal: '16@ms',
    fontSize: '13@ms',
    color: palette.grey[600]
  },
  search: {
    paddingHorizontal: '16@ms',
    paddingTop: '12@ms'
  },
  field: {
    backgroundColor: palette.grey[50],
    borderRadius: '12@ms',
    borderWidth: 1,
    borderColor: palette.grey[200]
  },
  fieldFocused: {
    borderColor: palette.main[600]
  },
  adornments: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '4@ms',
    paddingRight: '12@ms'
  },
  clearButton: {
    width: '44@ms',
    height: '44@ms',
    alignItems: 'center',
    justifyContent: 'center'
  },
  pinned: {
    paddingHorizontal: '16@ms',
    paddingTop: '4@ms'
  },
  sectionLabel: {
    marginTop: '12@ms',
    marginHorizontal: '16@ms',
    paddingTop: '12@ms',
    paddingHorizontal: '12@ms',
    borderTopWidth: 1,
    borderColor: palette.grey[100],
    fontSize: '12@ms',
    fontWeight: '700',
    letterSpacing: 0.4,
    color: palette.grey[600]
  },
  list: {
    paddingHorizontal: '16@ms',
    paddingVertical: '8@ms'
  }
})
