import { palette, TYPO } from '@/theme'
import React from 'react'
import { View, StyleSheet, FlatList } from 'react-native'
import { Text } from 'react-native-paper'
import useTextbook from '../hooks/useTextbook'
import TextbookItem from '../components/TextbookItem'
import FilterModal from '../components/Dialog/FilterModal'
import TextbookDrawer from '../components/Dialog/TextbookDrawer'
import AudioGuideModal from '@/layouts/components/AudioGuideModal'

const Textbook = () => {
  const {
    t,
    textbookList,
    openFilterModal,
    isOpenAudioGuide,
    handleCloseAudioGuide,
    handleCloseFilterModal,
    handleOpenAudioGuide,
    selectedTextbook,
    isOpenDialog,
    handleStartTextbookFromGuideModal,
    handleCloseDialog,
    handleOpenDialog
  } = useTextbook({})

  return (
    <View style={styles.container}>
      <FlatList
        data={textbookList}
        renderItem={({ item }) => <TextbookItem textbook={item} t={t} handleOpenDialog={handleOpenDialog} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[styles.scrollView, { gap: 24, paddingBottom: 40 }]}
        ListEmptyComponent={<Text style={styles.emptyText}>{t('no_data')}</Text>}
        showsVerticalScrollIndicator={false}
      />
      {/* <Button
        mode="contained"
        style={styles.filterButton}
        buttonColor={palette.main[500]}
        onPress={handleOpenFilterModal}
      >
        <View style={styles.buttonContent}>
          <FontAwesome name="filter" size={24} color="#FFF" />
          <Text style={styles.buttonText}>필터로 검색</Text>
        </View>
      </Button> */}
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
      <FilterModal t={t} open={openFilterModal} onClose={handleCloseFilterModal} title="필터로 검색" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    flex: 1
  },
  scrollView: {
    backgroundColor: '#FFF',
    borderRadius: 6,
    margin: 24,
    gap: 24,
    padding: 8
  },
  startButton: {
    paddingVertical: 6,
    borderRadius: 6,
    maxWidth: 200
  },
  filterButton: {
    paddingVertical: 6,
    borderRadius: 6,
    position: 'fixed',
    bottom: 20,
    left: 0,
    marginHorizontal: 32,
    right: 0
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
  }
})

export default Textbook
