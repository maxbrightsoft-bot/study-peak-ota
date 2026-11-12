import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ScaledSheet } from 'react-native-size-matters'
import { palette } from '@/theme'

interface ParentLinkTabsProps {
  activeTab: 'code' | 'qr'
  onTabChange: (tab: 'code' | 'qr') => void
}

const ParentLinkTabs = ({ activeTab, onTabChange }: ParentLinkTabsProps) => {
  const { t } = useTranslation()

  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'code' && styles.tabButtonActive]}
        onPress={() => activeTab !== 'code' && onTabChange('code')}
        activeOpacity={activeTab === 'code' ? 1 : 0.8}
      >
        <Text style={[styles.tabText, activeTab === 'code' && styles.tabTextActive]}>
          {t('enter_code')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'qr' && styles.tabButtonActive]}
        onPress={() => activeTab !== 'qr' && onTabChange('qr')}
        activeOpacity={activeTab === 'qr' ? 1 : 0.8}
      >
        <Text style={[styles.tabText, activeTab === 'qr' && styles.tabTextActive]}>
          {t('scan_qr')}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default ParentLinkTabs

const styles = ScaledSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#EAEAEA',
    borderRadius: '12@ms',
    padding: '4@ms',
    marginHorizontal: '20@ms',
    marginTop: '10@ms',
    marginBottom: '6@ms'
  },
  tabButton: {
    flex: 1,
    paddingVertical: '9@ms',
    alignItems: 'center',
    borderRadius: '8@ms'
  },
  tabButtonActive: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2
  },
  tabText: {
    fontSize: '13@ms',
    fontWeight: '700',
    color: palette.grey[500]
  },
  tabTextActive: {
    color: '#5F30AA'
  }
})
