import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import { palette } from '@/theme'
import { LANGUAGES } from '@/utils/constants/language'
import { LanguageResponse } from '@/utils/types'
import useAuthStore from '@/store/useAuthStore'
import { useTranslation } from 'react-i18next'
import BottomSheet from '@/components/ModalBase/BottomSheet'

type Props = {
  open: boolean
  onClose: () => void
  onSelect: (lang: LanguageResponse) => void
}

const LANG_FLAGS: Record<string, string> = {
  ko: '🇰🇷',
  en: '🇺🇸',
  vi: '🇻🇳',
}

const LANG_LABELS: Record<string, string> = {
  ko: '한국어',
  en: 'English',
  vi: 'Tiếng Việt',
}

const LanguageDialog = ({ open, onClose, onSelect }: Props) => {
  const { language } = useAuthStore()
  const { t } = useTranslation()

  return (
    <BottomSheet
      isVisible={open}
      onClose={onClose}
      title={t('language')}
    >
      <View style={styles.list}>
        {LANGUAGES.map((lang) => {
          const isActive = language?.code === lang.code
          return (
            <TouchableOpacity
              key={lang.code}
              style={[styles.item, isActive && styles.itemActive]}
              onPress={() => {
                onSelect(lang)
                onClose()
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.flag}>{LANG_FLAGS[lang.code]}</Text>
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {LANG_LABELS[lang.code]}
              </Text>
              {isActive && <View style={styles.dot} />}
            </TouchableOpacity>
          )
        })}
      </View>
    </BottomSheet>
  )
}

export default LanguageDialog

const styles = ScaledSheet.create({
  list: {
    gap: '10@ms',
    paddingHorizontal: '20@ms',
    paddingBottom: '20@ms',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: '14@ms',
    paddingHorizontal: '16@ms',
    borderRadius: '12@ms',
    backgroundColor: '#f5f5f5',
    gap: '12@ms',
  },
  itemActive: {
    backgroundColor: palette.main[50] ?? '#e8f0fe',
    borderWidth: '1.5@ms',
    borderColor: palette.main[600],
  },
  flag: {
    fontSize: '22@ms',
  },
  label: {
    flex: 1,
    fontSize: '15@ms',
    fontWeight: '500',
    color: '#333',
  },
  labelActive: {
    color: palette.main[600],
    fontWeight: '700',
  },
  dot: {
    width: '8@ms',
    height: '8@ms',
    borderRadius: '4@ms',
    backgroundColor: palette.main[600],
  },
})
