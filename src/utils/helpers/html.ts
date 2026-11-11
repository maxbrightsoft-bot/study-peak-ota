// Pure (no native modules), so it can be imported from pure helpers and their jest tests.
export const stripHtml = (html?: string): string => {
  if (!html) return ''
  return html
    .replace(/<\/(p|div|h[1-6]|li|tr|table|blockquote)>|<(br|hr)\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, ' ')
    .trim()
}
