import { useEffect, useRef, useState } from "react"

/**
 * Current time in ms. While `active`, re-renders the caller every `intervalMs`
 * so deadline countdowns stay fresh. The value is also refreshed on any render
 * once an interval has elapsed, so it never goes stale while inactive.
 */
const useNowTick = (active: boolean, intervalMs = 60000): number => {
    const [, setTick] = useState(0)
    const nowRef = useRef<number>(Date.now())

    useEffect(() => {
        if (!active) return undefined
        nowRef.current = Date.now()
        const id = setInterval(() => {
            nowRef.current = Date.now()
            setTick(n => n + 1)
        }, intervalMs)
        return () => clearInterval(id)
    }, [active, intervalMs])

    if (Date.now() - nowRef.current >= intervalMs) nowRef.current = Date.now()
    return nowRef.current
}

export default useNowTick
