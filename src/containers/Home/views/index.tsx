import React from 'react'
import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import useAuthStore from '@/store/useAuthStore'
import { checkIsParent } from '@/utils/helpers'
import AcademyView from './AcademyView'
import StudySpaceView from './StudySpaceView'

const Home = () => {
  const { t } = useTranslation()
  const { selectedAcademy, linkedStudents } = useAuthStore()
  const isParent = checkIsParent()
  const isParentNoChildren = isParent && linkedStudents?.length === 0

  if (isParentNoChildren) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#FFFFFF' }}>
        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#F3E5F5', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Ionicons name="people-outline" size={36} color="#5F30AA" />
        </View>
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#222222', textAlign: 'center', marginBottom: 8 }}>
          {t('no_linked_children_in_academy')}
        </Text>
        <Text style={{ fontSize: 13, color: '#666666', textAlign: 'center', lineHeight: 18 }}>
          {t('select_another_academy_desc')}
        </Text>
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      {!!selectedAcademy?.domain ? <AcademyView /> : <StudySpaceView />}
    </View>
  )
}

export default Home

