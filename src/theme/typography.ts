import { Platform, TextStyle } from 'react-native';
import { ms } from '@/utils/sizeMatters';

type TypoStyle = TextStyle;

export const TYPO: Record<string, TypoStyle> = {
  // Headings
  heading1: {
    fontSize: ms(18),
    fontWeight: 'bold',
  },
  heading2: {
    fontSize: ms(16),
    fontWeight: 'bold',
  },
  heading3: {
    fontSize: ms(14),
    fontWeight: 'bold',
  },

  // Body
  body1: {
    fontSize: ms(16),
    fontWeight: Platform.OS === 'ios' ? '500' : '400',
  },
  body2: {
    fontSize: ms(14),
    fontWeight: Platform.OS === 'ios' ? '500' : '400',
  },
  body3: {
    fontSize: ms(12),
    fontWeight: Platform.OS === 'ios' ? '500' : '400',
  },
  body4: {
    fontSize: ms(10),
    fontWeight: Platform.OS === 'ios' ? '500' : '400',
  },

  // Captions
  caption: {
    fontSize: ms(Platform.OS === 'ios' ? 12 : 11),
    fontWeight: Platform.OS === 'ios' ? '400' : '500',
  },

  // Buttons
  button1: {
    fontSize: ms(Platform.OS === 'ios' ? 18 : 16),
    fontWeight: Platform.OS === 'ios' ? '700' : '500',
  },
  button2: {
    fontSize: ms(Platform.OS === 'ios' ? 16 : 15),
    fontWeight: Platform.OS === 'ios' ? '700' : '500',
  },
  button3: {
    fontSize: ms(Platform.OS === 'ios' ? 14 : 13),
    fontWeight: Platform.OS === 'ios' ? '700' : '500',
  },
  button4: {
    fontSize: ms(Platform.OS === 'ios' ? 12 : 11),
    fontWeight: Platform.OS === 'ios' ? '700' : '500',
  },
};
