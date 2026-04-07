import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Button, Text } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { navigate } from '@/navigators/NavigationHelpers'
import { Ionicons } from '@expo/vector-icons'
import { palette } from '@/theme'
import { Routes } from '@/navigators/RouteName'

interface NotFoundProps {
  title: string
  pathRedirect?: string
}

const NotFoundExam: React.FC<NotFoundProps> = ({ title, pathRedirect = Routes.Auth.Home }) => {
  const { t } = useTranslation()

  const handleGoBack = () => {
    navigate(pathRedirect)
  }

  return (
    <View style={styles.container}>
      <View style={styles.centerBox}>
        <Text variant="headlineMedium" style={styles.title}>
          {title}
        </Text>
        <Text variant="bodyMedium" style={styles.subTitle}>
          {t(title)}
        </Text>
        <Button
          icon={({ color, size }) => <Ionicons name="log-out" size={24} color={palette.main[500]} />}
          mode="contained"
          onPress={handleGoBack}
          style={styles.button}
        >
          {t('home')}
        </Button>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerBox: {
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    color: palette.grey[700],
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subTitle: {
    color: palette.grey[700],
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    marginTop: 12,
  },
})

export default NotFoundExam
