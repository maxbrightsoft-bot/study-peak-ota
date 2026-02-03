import { Platform, TextStyle } from 'react-native';

type TypoStyle = TextStyle;

export const TYPO: Record<string, TypoStyle> = {
  // Headings
  heading1: {
    fontSize: Platform.OS === 'ios' ? 24 : 18,
    fontWeight: 'bold',
  },
  heading2: {
    fontSize: Platform.OS === 'ios' ? 20  : 16,
    fontWeight: 'bold',
  },
  heading3: {
    fontSize: Platform.OS === 'ios'  ? 16 : 14,
    fontWeight: 'bold',
  },

  // Body
  body1: {
    fontSize: Platform.OS === 'ios' ? 24 : 16,
    fontWeight: Platform.OS === 'ios' ? '500' : '400',
  },
  body2: {
    fontSize: Platform.OS === 'ios' ? 20 : 14,
    fontWeight: Platform.OS === 'ios' ? '500' : '400',
  },
  body3: {
    fontSize: Platform.OS === 'ios' ? 16 : 12,
    fontWeight: Platform.OS === 'ios' ? '500' : '400',
  },
  body4: {
    fontSize: Platform.OS === 'ios' ? 14 : 10,
    fontWeight: Platform.OS === 'ios' ? '500' : '400',
  },

  // Captions
  caption: {
    fontSize: Platform.OS === 'ios' ? 12 : 9,
    fontWeight: Platform.OS === 'ios' ? '400' : '500',
  },

  // Buttons
  button1: {
    fontSize: Platform.OS === 'ios' ? 20 : 16,
    fontWeight: Platform.OS === 'ios' ? 700 : 500,
  },
  button2: {
    fontSize: Platform.OS === 'ios' ? 16 : 14,
    fontWeight: Platform.OS === 'ios' ? 700 : 500,
  },
  button3: {
    fontSize: Platform.OS === 'ios' ? 14 : 12,
    fontWeight: Platform.OS === 'ios' ? 700 : 500,
  },
  button4: {
    fontSize: Platform.OS === 'ios' ? 12 : 10,
    fontWeight: Platform.OS === 'ios' ? 700 : 500,
  },
};
