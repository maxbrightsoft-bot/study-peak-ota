import { palette, TYPO } from '@/theme'
import React, { useState } from 'react'
import { View, TouchableOpacity, Text } from 'react-native'
import {useSafeAreaInsets } from 'react-native-safe-area-context'
import { TabList, DefaultTextbookFilter } from '../configs/constants'
import useTab from '@/hooks/useTab'
import { useTranslation } from 'react-i18next'
import TabPanel from '@/components/Tab/TabPanel'
import TextbookList from '../components/TextbookList'
import { PreparedFilterType, PreparedType, TextbookQuery } from '../configs/type'
import HeaderAction from '@/layouts/components/HeaderAction'
import { ScaledSheet } from 'react-native-size-matters'
import PopQuiz from '@/containers/PopQuiz'

const Textbook = () => {
  const { t } = useTranslation()
  const { selected, handleChangeTab } = useTab(TabList)
  const insets = useSafeAreaInsets()
  const [search, setSearch] = useState<string>('')
  const [textbookFilter, setTextbookFilter] = useState<TextbookQuery>(DefaultTextbookFilter)

  const handleTabChange = (value: any) => {
    handleChangeTab(value)
    setSearch('')
    setTextbookFilter(DefaultTextbookFilter)
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header]}>
        <Text style={styles.headerTitle}>{t('question_bank')}</Text>
        <View>
          <HeaderAction />
        </View>
      </View>
      <View style={styles.gridContainer}>
        {TabList.map(({ label, value }, index) => {
          const isSelected = value === selected
          return (
            <TouchableOpacity
              key={index}
              style={[styles.gridTabButton, isSelected ? styles.activeGridTab : styles.inactiveGridTab]}
              onPress={() => handleTabChange(value)}
            >
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
                style={[styles.gridTabText, isSelected ? styles.activeGridTabText : styles.inactiveGridTabText]}
              >
                {t(label)}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>

      <TabPanel value={selected} index={PreparedType.csat_past_questions} style={{ flex: 1 }}>
        <TextbookList
          preparedType={PreparedType.csat_past_questions}
          search={search}
          setSearch={setSearch}
          textbookFilter={textbookFilter}
          setTextbookFilter={setTextbookFilter}
        />
      </TabPanel>
      <TabPanel value={selected} index={PreparedType.official_mock_exam} style={{ flex: 1 }}>
        <TextbookList
          preparedType={PreparedType.official_mock_exam}
          search={search}
          setSearch={setSearch}
          textbookFilter={textbookFilter}
          setTextbookFilter={setTextbookFilter}
        />
      </TabPanel>
      <TabPanel value={selected} index={PreparedType.private_mock_exam} style={{ flex: 1 }}>
        <TextbookList
          preparedType={PreparedType.private_mock_exam}
          search={search}
          setSearch={setSearch}
          textbookFilter={textbookFilter}
          setTextbookFilter={setTextbookFilter}
        />
      </TabPanel>
      <TabPanel value={selected} index="pop_quiz" style={{ flex: 1 }}>
        <PopQuiz />
      </TabPanel>
      <TabPanel value={selected} index={PreparedType.workbook} style={{ flex: 1 }}>
        <TextbookList
          preparedType={PreparedType.workbook}
          search={search}
          setSearch={setSearch}
          textbookFilter={textbookFilter}
          setTextbookFilter={setTextbookFilter}
        />
      </TabPanel>
      <TabPanel value={selected} index={PreparedType.past_exam_questions} style={{ flex: 1 }}>
        <TextbookList
          preparedType={PreparedType.past_exam_questions}
          search={search}
          setSearch={setSearch}
          textbookFilter={textbookFilter}
          setTextbookFilter={setTextbookFilter}
        />
      </TabPanel>
      <TabPanel value={selected} index={PreparedFilterType.academy_questions} style={{ flex: 1 }}>
        <TextbookList
          preparedFilterType={PreparedFilterType.academy_questions}
          search={search}
          setSearch={setSearch}
          textbookFilter={textbookFilter}
          setTextbookFilter={setTextbookFilter}
        />
      </TabPanel>
    </View>
  )
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: '20@ms',
    paddingHorizontal: '18@ms'
  },
  headerTitle: {
    fontSize: '20@ms',
    fontWeight: '600',
    color: '#222222'
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: '16@ms',
    marginTop: '6@ms',
    marginBottom: '12@ms',
    rowGap: '8@ms',
    columnGap: '6@ms'
  },
  gridTabButton: {
    width: '23.5%',
    paddingVertical: '8@ms',
    paddingHorizontal: '2@ms',
    borderRadius: '6@ms',
    alignItems: 'center',
    justifyContent: 'center'
  },
  activeGridTab: {
    backgroundColor: palette.main[600] || '#7545FC'
  },
  inactiveGridTab: {
    backgroundColor: 'transparent'
  },
  gridTabText: {
    fontSize: '13@ms',
    textAlign: 'center'
  },
  activeGridTabText: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  inactiveGridTabText: {
    color: '#666666',
    fontWeight: '500'
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
  activeTab: {},
  inactiveTab: {},
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
  }
})

export default Textbook
