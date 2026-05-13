import { useEffect, useState } from 'react'
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { PreparedFilterType, PreparedType } from '../configs/type'
import useTextbook from '../hooks/useTextbook'
import TextbookItem from '../components/TextbookItem'
import FilterModal from '../components/Dialog/FilterModal'
import TextbookDrawer from '../components/Dialog/TextbookDrawer'
import AudioGuideModal from '@/layouts/components/AudioGuideModal'
import SearchInput from '@/components/Input/SearchInput'
import FilterIcon from '@/assets/iconJSX/filter'
import { palette, TYPO } from '@/theme'
import SelectTimeDialog from '@/layouts/components/SelectTimeDialog'
import { ScaledSheet } from 'react-native-size-matters'

type Props = {
  preparedType?: PreparedType
  preparedFilterType?: PreparedFilterType
}
const TextbookList = ({ preparedType, preparedFilterType }: Props) => {
  const [enableAudio, setEnableAudio] = useState(true)
  const {
    t,
    search,
    onChangeSearch,
    textbookList,
    scrollViewRef,
    textbookFilter,
    openFilterModal,
    isOpenAudioGuide,
    handleChangeFilter,
    handleCloseAudioGuide,
    handleCloseFilterModal,
    handleOpenAudioGuide,
    handleOpenFilterModal,
    selectedTextbook,
    isOpenDialog,
    handleStartTextbookFromGuideModal,
    handleCloseDialog,
    handleOpenDialog,
    isOpenTimeSelectModal,
    handleCloseTimeSelectModal,
    handleStartTextbook
  } = useTextbook({ preparedType, preparedFilterType })

  const filterCount =
    (!!textbookFilter.grade ? 1 : 0) +
    (textbookFilter.subjectIds?.length ? 1 : 0) +
    (textbookFilter.fromMonths?.length || textbookFilter.toMonths?.length ? 1 : 0) +
    (textbookFilter.fromDate || textbookFilter.toDate ? 1 : 0)

  useEffect(() => {
    if (isOpenAudioGuide) setEnableAudio(true)
  }, [isOpenAudioGuide, selectedTextbook?.id])

  const handleStartAudioGuide = (enable: boolean) => {
    setEnableAudio(enable)
    handleStartTextbookFromGuideModal(enable)
  }

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 37, marginBottom: 9, paddingHorizontal: 20 }}>
        <View style={{ flex: 1 }}>
          <SearchInput value={search} onChangeText={onChangeSearch} placeholder={t('search_for')} />
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={handleOpenFilterModal}>
          {!!filterCount && <View style={styles.filterCountButton}>
            <Text style={styles.filterButtonText}>{filterCount}</Text>
          </View>}
          <FilterIcon />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={scrollViewRef}
        data={textbookList}
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: 350,
          paddingHorizontal: 20
        }}
        renderItem={({ item }) => <TextbookItem textbook={item} t={t} handleOpenDialog={handleOpenDialog} />}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text style={styles.emptyText}>{t('no_data')}</Text>}
        showsVerticalScrollIndicator={false}
      />
      {isOpenDialog && (
        <TextbookDrawer
          isOpen={isOpenDialog}
          onClose={handleCloseDialog}
          textbookId={selectedTextbook?.id}
          onOpenAudioGuide={handleOpenAudioGuide}
        />
      )}
      {isOpenAudioGuide && (
        <AudioGuideModal
          open={isOpenAudioGuide}
          audioUrls={selectedTextbook?.subject?.audioUrls ?? []}
          onClose={handleCloseAudioGuide}
          onStart={handleStartAudioGuide}
        />
      )}
      {isOpenTimeSelectModal && (
        <SelectTimeDialog
          open={isOpenTimeSelectModal}
          t={t}
          title={t('select_timer_limit')}
          onClose={handleCloseTimeSelectModal}
          onSubmit={(minutes, skipPreAlarm) => {
            if (selectedTextbook) handleStartTextbook(enableAudio, selectedTextbook, minutes, skipPreAlarm)
          }}
          initialValue={selectedTextbook?.subject?.limitedTimeInMinutes || selectedTextbook?.limitedTimeInMinutes}
        />
      )}
      <FilterModal
        t={t}
        textbookFilter={textbookFilter}
        open={openFilterModal}
        onClose={handleCloseFilterModal}
        handleChangeFilter={(values) => {
          handleChangeFilter(values)
        }}
        title={t('filter')}
      />
    </View>
  )
}

export default TextbookList

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  header: {
    paddingVertical: '20@ms',
    paddingHorizontal: '18@ms'
  },
  headerTitle: {
    fontSize: '20@ms',
    fontWeight: 600,
    color: '#222222'
  },
  scrollView: {
    gap: '24@ms',
    padding: '8@ms'
  },
  startButton: {
    paddingVertical: '6@ms',
    borderRadius: '6@ms',
    maxWidth: '200@ms'
  },
  filterButton: {
    width: '40@ms',
    height: '40@ms',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: '10@ms',
    borderRadius: '100@ms',
    backgroundColor: palette.grey[100]
  },
  tabButton: {},
  activeTab: {
    borderBottomColor: palette.main[500]
  },
  inactiveTab: {
    borderBottomColor: '#D0D5DD'
  },
  tabText: {
    fontSize: '16@ms',
    fontWeight: '700',
    textAlign: 'center'
  },
  tabContent: {
    flex: 1
  },
  buttonContent: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16@ms'
  },
  buttonText: {
    ...TYPO.button1,
    color: '#FFF'
  },
  emptyText: {
    ...TYPO.caption,
    color: palette.grey[500],
    textAlign: 'center'
  },
  filterCountButton: {
    width: '20@ms',
    height: '20@ms',
    borderRadius: '43@ms',
    backgroundColor: '#3DC674',
    position: 'absolute',
    top: '-10@ms',
    right: '-10@ms',
    justifyContent: 'center',
    alignItems: 'center'
  },
  filterButtonText: {
    fontSize: '12@ms',
    color: '#fff'
  }
})
