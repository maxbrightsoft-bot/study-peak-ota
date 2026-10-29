import React from 'react'
import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { ScaledSheet } from 'react-native-size-matters'
import { palette, TYPO } from '@/theme'

interface EmptyStateProps {
  title: string
  description: string
  instructionTitle: string
  steps: string[]
}

const EmptyState = ({
  title,
  description,
  instructionTitle,
  steps
}: EmptyStateProps) => {
  return (
    <View style={styles.container}>
      {/* Main Empty State Card */}
      <View style={styles.reqCard}>
        <View style={styles.iconCircle}>
          <Ionicons name="people-outline" size={32} color={palette.main[600]} />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </View>

      {/* Instruction/How-to Box */}
      <View style={styles.instructionCard}>
        <Text style={styles.instructionTitle}>{instructionTitle}</Text>
        {steps.map((step, index) => (
          <View key={index} style={styles.stepRow}>
            <Text style={styles.stepText}>
              {index + 1}. {step}
            </Text>
          </View>
        ))}
      </View>
    </View>
  )
}

export default EmptyState

const styles = ScaledSheet.create({
  container: {
    width: '100%'
  },
  reqCard: {
    backgroundColor: '#FFF',
    borderRadius: '16@ms',
    padding: '24@ms',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    marginTop: '20@ms'
  },
  iconCircle: {
    width: '64@ms',
    height: '64@ms',
    borderRadius: '32@ms',
    backgroundColor: palette.main[50] || '#F4F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16@ms'
  },
  cardTitle: {
    ...TYPO.heading3,
    fontSize: '18@ms',
    fontWeight: '800',
    color: palette.grey[900],
    textAlign: 'center',
    marginBottom: '10@ms'
  },
  cardDescription: {
    ...TYPO.body2,
    fontSize: '13@ms',
    color: palette.grey[500],
    textAlign: 'center',
    lineHeight: '20@ms'
  },
  instructionCard: {
    backgroundColor: palette.bg[100] || '#F7F7F7',
    borderRadius: '12@ms',
    padding: '16@ms',
    marginTop: '16@ms'
  },
  instructionTitle: {
    ...TYPO.subtitle2,
    fontSize: '13@ms',
    fontWeight: '700',
    color: palette.grey[700],
    marginBottom: '8@ms'
  },
  stepRow: {
    marginBottom: '6@ms'
  },
  stepText: {
    ...TYPO.body2,
    fontSize: '12@ms',
    color: palette.grey[500],
    lineHeight: '18@ms'
  }
})
