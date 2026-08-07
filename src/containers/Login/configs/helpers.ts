export const urlSafeFormat = (text: string) => {
  return text.replaceAll(' ', "+")
}