import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Image } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import { Ionicons } from '@expo/vector-icons'
import { palette } from '@/theme'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import PolicyViewer from './PolicyViewer'
import { PRIVACY_POLICY_CONTENT, TERMS_OF_SERVICE_CONTENT } from '../configs/policyContent'

type Props = {
  onAgree: () => void
}

const ConsentScreen = ({ onAgree }: Props) => {
  const { t } = useTranslation()

  const [agreeAll, setAgreeAll] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [agreePrivacy, setAgreePrivacy] = useState(false)

  const [viewingTerms, setViewingTerms] = useState(false)
  const [viewingPrivacy, setViewingPrivacy] = useState(false)

  const handleToggleAll = () => {
    const newVal = !agreeAll
    setAgreeAll(newVal)
    setAgreeTerms(newVal)
    setAgreePrivacy(newVal)
  }

  const handleToggleTerms = () => {
    const newVal = !agreeTerms
    setAgreeTerms(newVal)
    if (!newVal) setAgreeAll(false)
    else if (agreePrivacy) setAgreeAll(true)
  }

  const handleTogglePrivacy = () => {
    const newVal = !agreePrivacy
    setAgreePrivacy(newVal)
    if (!newVal) setAgreeAll(false)
    else if (agreeTerms) setAgreeAll(true)
  }

  const canProceed = agreeTerms && agreePrivacy

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeArea}>
          <View style={styles.logoContainer}>
            <Image source={require('@/assets/icons/app-icon.png')} style={styles.logoBadge} />
          </View>
          <Text style={styles.welcomeTitle}>{t('consent_welcome_title')}</Text>
          <Text style={styles.welcomeSubtitle}>{t('consent_welcome_subtitle')}</Text>
        </View>

        <View style={styles.consentArea}>
          <TouchableOpacity style={styles.agreeAllRow} onPress={handleToggleAll} activeOpacity={0.7}>
            <View style={[styles.checkbox, agreeAll && styles.checkboxChecked]}>
              {agreeAll && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
            <Text style={styles.agreeAllText}>{t('consent_agree_all')}</Text>
          </TouchableOpacity>

          <View style={styles.separator} />

          <View style={styles.consentItemRow}>
            <TouchableOpacity style={styles.consentItemLeft} onPress={handleToggleTerms} activeOpacity={0.7}>
              <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
                {agreeTerms && <Ionicons name="checkmark" size={16} color="#fff" />}
              </View>
              <Text style={styles.requiredBadge}>{t('consent_required')}</Text>
              <Text style={styles.consentItemText} numberOfLines={1}>{t('terms_of_service')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.chevronButton} onPress={() => setViewingTerms(true)}>
              <Ionicons name="chevron-forward" size={20} color={palette.grey[400]} />
            </TouchableOpacity>
          </View>

          <View style={styles.consentItemRow}>
            <TouchableOpacity style={styles.consentItemLeft} onPress={handleTogglePrivacy} activeOpacity={0.7}>
              <View style={[styles.checkbox, agreePrivacy && styles.checkboxChecked]}>
                {agreePrivacy && <Ionicons name="checkmark" size={16} color="#fff" />}
              </View>
              <Text style={styles.requiredBadge}>{t('consent_required')}</Text>
              <Text style={styles.consentItemText} numberOfLines={1}>{t('privacy_policy')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.chevronButton} onPress={() => setViewingPrivacy(true)}>
              <Ionicons name="chevron-forward" size={20} color={palette.grey[400]} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.noteText}>{t('consent_note')}</Text>
      </ScrollView>

      <View style={styles.bottomArea}>
        <TouchableOpacity
          style={[styles.agreeButton, !canProceed && styles.agreeButtonDisabled]}
          onPress={canProceed ? onAgree : undefined}
          activeOpacity={canProceed ? 0.7 : 1}
        >
          <Text style={[styles.agreeButtonText, !canProceed && styles.agreeButtonTextDisabled]}>
            {t('consent_agree_and_continue')}
          </Text>
        </TouchableOpacity>
      </View>

      <PolicyViewer
        open={viewingTerms}
        onClose={() => setViewingTerms(false)}
        title={t('terms_of_service')}
        content={TERMS_OF_SERVICE_CONTENT}
      />
      <PolicyViewer
        open={viewingPrivacy}
        onClose={() => setViewingPrivacy(false)}
        title={t('privacy_policy')}
        content={PRIVACY_POLICY_CONTENT}
      />
    </SafeAreaView>
  )
}

export default ConsentScreen

const styles = ScaledSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: '24@ms',
  },

  welcomeArea: {
    paddingTop: '40@ms',
    paddingBottom: '32@ms',
  },
  logoContainer: {
    marginBottom: '20@ms',
  },
  backButton: {
    width: 24
  },
  logoBadge: {
    width: '56@ms',
    height: '56@ms',
    borderRadius: '16@ms',
    backgroundColor: palette.main[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: '28@ms',
    fontWeight: '700',
    color: '#fff',
  },
  welcomeTitle: {
    fontSize: '24@ms',
    fontWeight: '700',
    color: '#111',
    marginBottom: '8@ms',
    lineHeight: '32@ms',
  },
  welcomeSubtitle: {
    fontSize: '14@ms',
    color: palette.grey[500],
    lineHeight: '20@ms',
  },

  consentArea: {
    backgroundColor: '#fff',
    borderRadius: '16@ms',
    borderWidth: 1,
    borderColor: palette.grey[200],
    paddingVertical: '4@ms',
  },
  agreeAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: '16@ms',
    paddingHorizontal: '16@ms',
    gap: '12@ms',
  },
  agreeAllText: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: '#111',
  },
  separator: {
    height: 1,
    backgroundColor: palette.grey[200],
    marginHorizontal: '16@ms',
  },

  consentItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: '14@ms',
    paddingHorizontal: '16@ms',
  },
  consentItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: '8@ms',
  },
  requiredBadge: {
    fontSize: '11@ms',
    fontWeight: '700',
    color: palette.main[600],
  },
  consentItemText: {
    fontSize: '14@ms',
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  chevronButton: {
    padding: '4@ms',
  },

  // Checkbox
  checkbox: {
    width: '22@ms',
    height: '22@ms',
    borderRadius: '6@ms',
    borderWidth: 2,
    borderColor: palette.grey[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: palette.main[600],
    borderColor: palette.main[600],
  },

  // Note
  noteText: {
    marginTop: '16@ms',
    fontSize: '12@ms',
    color: palette.grey[400],
    lineHeight: '18@ms',
    paddingHorizontal: '4@ms',
  },

  // Bottom
  bottomArea: {
    paddingHorizontal: '24@ms',
    paddingBottom: '24@ms',
    paddingTop: '12@ms',
    backgroundColor: '#fff',
  },
  agreeButton: {
    backgroundColor: palette.main[600],
    paddingVertical: '16@ms',
    borderRadius: '12@ms',
    alignItems: 'center',
  },
  agreeButtonDisabled: {
    backgroundColor: palette.grey[200],
  },
  agreeButtonText: {
    color: '#fff',
    fontSize: '16@ms',
    fontWeight: '600',
  },
  agreeButtonTextDisabled: {
    color: palette.grey[400],
  },
})
