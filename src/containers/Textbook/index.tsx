import { palette, TYPO } from '@/theme'
import React from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { Text, Button } from 'react-native-paper'
import { FontAwesome } from '@expo/vector-icons'
import useTextbook from './hooks/useTextbook'
import { PreparedFilterType } from './configs/type'
import TextbookItem from './components/TextbookItem'
import FilterModal from './components/Dialog/FilterModal'

const Textbook = () => {
  const { t, textbookList, handleDoTextbook, openFilterModal, handleCloseFilterModal, handleOpenFilterModal } =
    useTextbook({
      preparedFilterType: PreparedFilterType.recently_solved_questions
    })

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {textbookList.map((textbook) => (
          <TextbookItem textbook={textbook} t={t} />
        ))}
        {textbookList?.length === 0 && <Text style={styles.emptyText}>{t('no_data')}</Text>}
      </ScrollView>
      <Button
        mode="contained"
        style={styles.filterButton}
        buttonColor={palette.main[500]}
        onPress={handleOpenFilterModal}
      >
        <View style={styles.buttonContent}>
          <FontAwesome name="filter" size={24} color="#FFF" />
          <Text style={styles.buttonText}>필터로 검색</Text>
        </View>
      </Button>
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
    padding: 8,
    gap: 8
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
