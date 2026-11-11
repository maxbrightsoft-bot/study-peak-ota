const toBytes = (value: string): number[] =>
    Array.from(atob(value), char => char.charCodeAt(0))

// RowVersion is an 8 byte big-endian counter encoded as base64.
// Comparing the bytes lexicographically equals comparing them as a big-endian integer.
export const isNewerRowVersion = (incoming: string, current?: string): boolean => {
    if (!incoming) return false
    if (!current) return true
    try {
        const a = toBytes(incoming)
        const b = toBytes(current)
        const length = Math.max(a.length, b.length)
        for (let i = 0; i < length; i++) {
            const diff = (a[i] ?? 0) - (b[i] ?? 0)
            if (diff !== 0) return diff > 0
        }
        return false
    } catch {
        return false
    }
}
