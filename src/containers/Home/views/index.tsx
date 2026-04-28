import React from 'react'
import { View } from 'react-native'
import useAuthStore from '@/store/useAuthStore'
import AcademyView from './AcademyView'
import StudySpaceView from './StudySpaceView'

const Home = () => {
  const { selectedAcademy } = useAuthStore()

  return (
    <View style={{ flex: 1 }}>
      {!!selectedAcademy?.domain ? <AcademyView /> : <StudySpaceView />}
    </View>
  )
}

export default Home

