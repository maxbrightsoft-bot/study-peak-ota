import { ScaledSheet } from 'react-native-size-matters'

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

export const styles = ScaledSheet.create({
  accordionContainer: {
    marginVertical: '4@ms',
    borderRadius: '12@ms',
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: '1@ms',
  },
  answerBox: {
    marginVertical: '8@ms',
    padding: '12@ms',
    borderRadius: '8@ms',
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerText: {
    fontSize: '18@ms',
    fontWeight: 'bold',
    color: '#fff',
  },
  flagBox: {
    width: '32@ms',
    height: '16@ms',
    borderRadius: '8@ms',
    backgroundColor: '#e0e0e0',
    marginTop: '4@ms',
  },
  flagBoxMarked: {
    backgroundColor: '#FAD144',
  },
})
