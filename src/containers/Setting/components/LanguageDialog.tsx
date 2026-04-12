import React from 'react'
import { Modal, View, Text, TouchableOpacity, Pressable } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import { palette } from '@/theme'
import { LANGUAGES } from '@/utils/constants/language'
import { LanguageResponse } from '@/utils/types'
import useAuthStore from '@/store/useAuthStore'

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

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />
          <Text style={styles.title}>언어 선택 / Language</Text>
          <View style={styles.list}>
            {LANGUAGES.map((lang) => {
              const isActive = language.code === lang.code
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
        </Pressable>
      </Pressable>
    </Modal>
  )
}

export default LanguageDialog

const styles = ScaledSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: '20@ms',
    paddingBottom: '32@ms',
    paddingTop: '12@ms',
  },
  handle: {
    width: '40@ms',
    height: '4@ms',
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: '16@ms',
  },
  title: {
    fontSize: '16@ms',
    fontWeight: '600',
    color: '#222',
    textAlign: 'center',
    marginBottom: '20@ms',
  },
  list: {
    gap: '10@ms',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: '14@ms',
    paddingHorizontal: '16@ms',
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    gap: '12@ms',
  },
  itemActive: {
    backgroundColor: palette.main[50] ?? '#e8f0fe',
    borderWidth: 1.5,
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
    borderRadius: 4,
    backgroundColor: palette.main[600],
  },
})
