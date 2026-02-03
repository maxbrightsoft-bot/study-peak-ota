import React from 'react'
import { View, Text, Pressable } from 'react-native'

import { TabList } from '../configs/constants'
import { Ionicons } from '@expo/vector-icons'
import useMyData from '../hooks/useMyData'
import { palette } from '@/theme'
import { ScaledSheet } from 'react-native-size-matters'
import PerformanceData from '../components/PerformanceDataTab'
import TabPanel from '@/components/Tab/TabPanel'
import TimeData from '../components/TimeDataTab'

const MyData = () => {
  const {
    t,
    selected,
    contentRef,
    handleReadyPrint,
    handleChangeTab,
    isAdminOrNonAcademy
  } = useMyData()

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.tabs}>
          {TabList.map(({ label, value }, index) => {
            if (value === 1 && isAdminOrNonAcademy) return null

            const active = value === selected

            return (
              <Pressable
                key={index}
                onPress={() => handleChangeTab(value)}
                style={[styles.tabButton, active && styles.tabButtonActive]}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{t(label)}</Text>
              </Pressable>
            )
          })}
        </View>

        {/* <Pressable
          onPress={() => {
            handleTogglePrint()
            handlePrint()
          }}
          style={styles.printButton}
        >
          <Ionicons name="print-outline" size={14} color="#6d6e6f" />
          <Text style={styles.printText}>{t('print')}</Text>
        </Pressable> */}
      </View>

      <TabPanel value={selected} index={0}>
        <TimeData contentRef={contentRef} handleReadyPrint={handleReadyPrint} />
      </TabPanel>

      <TabPanel value={selected} index={1}>
        <PerformanceData contentRef={contentRef} handleReadyPrint={handleReadyPrint} />
      </TabPanel>
    </View>
  )
}

export default MyData

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: "24@ms",
    borderBottomWidth: 1,
    borderBottomColor: palette.grey[100]
  },
  tabs: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  tabButton: {
    width: '50%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: "24@ms",
    paddingBottom: "12@ms",
    borderBottomWidth: 1,
    borderBottomColor: palette.grey[100]
  },
  tabButtonActive: {
    borderBottomColor: palette.main[500]
  },
  tabText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280'
  },
  tabTextActive: {
    color: palette.main[500]
  },
  printButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#D0D0C8',
    borderRadius: 6,
    gap: 4
  },
  printText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6d6e6f'
  }
})
