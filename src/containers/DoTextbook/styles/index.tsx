import { StyleSheet } from 'react-native'
import { scale, verticalScale } from 'react-native-size-matters'

export const getStatusStyle = (status: string) => {
  switch (status) {
    case 'correct':
      return { backgroundColor: '#36C172' }
    case 'marked':
      return { backgroundColor: '#FAD144' }
    case 'unanswered':
    default:
      return { backgroundColor: '#f2f2f2' }
  }
}

export const styles = StyleSheet.create({
  accordionContainer: {
    marginVertical: verticalScale(4),
    borderRadius: scale(12),
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 1,
  },
  answerBox: {
    marginVertical: verticalScale(8),
    padding: scale(12),
    borderRadius: scale(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerText: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: '#fff',
  },
  flagBox: {
    width: scale(32),
    height: verticalScale(16),
    borderRadius: scale(8),
    backgroundColor: '#e0e0e0',
    marginTop: verticalScale(4),
  },
  flagBoxMarked: {
    backgroundColor: '#FAD144',
  },
})
