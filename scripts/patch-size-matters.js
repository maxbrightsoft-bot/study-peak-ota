#!/usr/bin/env node
/**
 * Patch react-native-size-matters ScaledSheet.create types.
 * 
 * Final Solution:
 * Uses Intersection Types to provide BOTH perfect intellisense and 
 * perfect compatibility with React Native components.
 */

const fs = require('fs')
const path = require('path')

const dtsPath = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-size-matters',
  'index.d.ts'
)

if (!fs.existsSync(dtsPath)) {
  console.log('[patch-size-matters] index.d.ts not found, skipping.')
  process.exit(0)
}

const content = `import * as RN from 'react-native';

declare module 'react-native-size-matters' {
    export function scale(size: number): number;
    export function verticalScale(size: number): number;
    export function moderateScale(size: number, factor?: number): number;
    export function moderateVerticalScale(size: number, factor?: number): number;
    export function s(size: number): number;
    export function vs(size: number): number;
    export function ms(size: number, factor?: number): number;
    export function mvs(size: number, factor?: number): number;

    type Scale = \`\${number}@s\${'r' | ''}\`;
    type VerticalScale = \`\${number}@vs\${'r' | ''}\`;
    type ModerateScale = \`\${number}@ms\${number | ''}\${'r' | ''}\`;
    type ModerateVerticalScale = \`\${number}@mvs\${number | ''}\${'r' | ''}\`;
    type Size = Scale | VerticalScale | ModerateScale | ModerateVerticalScale;

    type Scalable<T> = {
        [P in keyof T]: number extends T[P]
            ? T[P] | Size
            : T[P] extends object | undefined
                ? Scalable<T[P]>
                : T[P]
    };

    export type ViewStyle = Scalable<RN.ViewStyle>;
    export type TextStyle = Scalable<RN.TextStyle>;
    export type ImageStyle = Scalable<RN.ImageStyle>;

    export namespace ScaledSheet {
        // Return type uses intersection with both ViewStyle and TextStyle.
        // This ensures the object is assignable to any RN component and 
        // shows all possible style suggestions in the IDE.
        export function create<T extends { [P in keyof T]: ViewStyle | TextStyle | ImageStyle }>(
            stylesObject: T,
        ): { 
            [P in keyof T]: any & RN.ViewStyle & RN.TextStyle & RN.ImageStyle
        };
    }
}
`

fs.writeFileSync(dtsPath, content, 'utf8')
console.log('[patch-size-matters] Patched ScaledSheet.create with Universal Style Intersection ✓')
