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

type Props = {
  preparedType?: PreparedType
  preparedFilterType?: PreparedFilterType
}
const TextbookList = ({ preparedType, preparedFilterType }: Props) => {
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
    handleOpenDialog
  } = useTextbook({ preparedType, preparedFilterType })

  const filterCount =
    (textbookFilter.subjectIds?.length ? 1 : 0) +
    (textbookFilter.months?.length ? 1 : 0) +
    (textbookFilter.endYear || textbookFilter.startYear ? 1 : 0)

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 37, marginBottom: 9, paddingHorizontal: 20 }}>
        <View style={{ flex: 1 }}>
          <SearchInput value={search} onChangeText={onChangeSearch} placeholder="오답노트 검색" />
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
          paddingBottom: 300,
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
          onStart={handleStartTextbookFromGuideModal}
        />
      )}
      <FilterModal
        t={t}
        textbookFilter={textbookFilter}
        open={openFilterModal}
        onClose={handleCloseFilterModal}
        handleChangeFilter={handleChangeFilter}
        title="필터"
      />
    </View>
  )
}

export default TextbookList

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 18
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: '#222222'
  },
  scrollView: {
    gap: 24,
    padding: 8
  },
  startButton: {
    paddingVertical: 6,
    borderRadius: 6,
    maxWidth: 200
  },
  filterButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 100,
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
    fontSize: 16,
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
    gap: 16
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
    width: 20,
    height: 20,
    borderRadius: 43,
    backgroundColor: '#3DC674',
    position: 'absolute',
    top: -10,
    right: -10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  filterButtonText: {
    fontSize: 12,
    color: '#fff'
  }
})
