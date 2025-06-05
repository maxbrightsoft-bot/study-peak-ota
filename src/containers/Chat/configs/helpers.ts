export function isHTMLContent(content: string): boolean {
  const htmlPattern = /<[^>]+>/;
  return htmlPattern.test(content.trim());
}