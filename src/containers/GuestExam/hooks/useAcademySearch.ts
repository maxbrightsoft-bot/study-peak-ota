import { useCallback, useEffect, useRef, useState } from 'react'
import { getGuestAcademiesApi } from '../apiClients'
import { GUEST_ACADEMY_FIRST_PAGE, GUEST_ACADEMY_PAGE_SIZE, GUEST_ACADEMY_SEARCH_DEBOUNCE_MS } from '../configs/constants'
import {
  canLoadMoreAcademies,
  getAcademySearchDelay,
  isCurrentRequest,
  mergeAcademyPages
} from '../configs/academyPicker'
import { GuestAcademy } from '../configs/types'

/**
 * Paged academy list for the picker: page 0 loads when it opens (empty query = all academies), typing
 * debounces and restarts at page 0, `loadMore` appends the next page. One request at a time; a response for
 * an older query is dropped.
 */
const useAcademySearch = (open: boolean) => {
  const [query, setQuery] = useState<string>('')
  const [items, setItems] = useState<GuestAcademy[]>([])
  const [hasMore, setHasMore] = useState<boolean>(false)
  const [isLoading, setLoading] = useState<boolean>(false)
  const [isLoadingMore, setLoadingMore] = useState<boolean>(false)
  const [error, setError] = useState<unknown>()
  const [moreError, setMoreError] = useState<unknown>()
  const [reloadNonce, setReloadNonce] = useState<number>(0)
  const requestIdRef = useRef<number>(0)
  const inFlightRef = useRef<boolean>(false)
  const pageRef = useRef<number>(GUEST_ACADEMY_FIRST_PAGE)
  const appliedQueryRef = useRef<string>('')
  const immediateRef = useRef<boolean>(true)

  useEffect(() => {
    requestIdRef.current += 1
    inFlightRef.current = false
    pageRef.current = GUEST_ACADEMY_FIRST_PAGE
    setItems([])
    setHasMore(false)
    setError(undefined)
    setMoreError(undefined)
    setLoadingMore(false)
    if (!open) {
      setQuery('')
      setLoading(false)
      immediateRef.current = true
      return
    }
    const q = query.trim()
    const requestId = requestIdRef.current
    appliedQueryRef.current = q
    setLoading(true)
    const delay = getAcademySearchDelay(immediateRef.current, GUEST_ACADEMY_SEARCH_DEBOUNCE_MS)
    immediateRef.current = false
    const timer = setTimeout(async () => {
      inFlightRef.current = true
      try {
        const res = await getGuestAcademiesApi(q, GUEST_ACADEMY_FIRST_PAGE, GUEST_ACADEMY_PAGE_SIZE)
        if (!isCurrentRequest(requestId, requestIdRef.current)) return
        setItems(mergeAcademyPages([], res.data?.items ?? []))
        setHasMore(!!res.data?.hasMore)
      } catch (err) {
        if (!isCurrentRequest(requestId, requestIdRef.current)) return
        setError(err)
      } finally {
        if (isCurrentRequest(requestId, requestIdRef.current)) {
          inFlightRef.current = false
          setLoading(false)
        }
      }
    }, delay)
    return () => clearTimeout(timer)
  }, [open, query, reloadNonce])

  const loadMore = useCallback(async () => {
    if (inFlightRef.current || !canLoadMoreAcademies({ hasMore, isLoading, isLoadingMore, hasError: !!error })) return
    const requestId = requestIdRef.current
    const nextPage = pageRef.current + 1
    inFlightRef.current = true
    setLoadingMore(true)
    setMoreError(undefined)
    try {
      const res = await getGuestAcademiesApi(appliedQueryRef.current, nextPage, GUEST_ACADEMY_PAGE_SIZE)
      if (!isCurrentRequest(requestId, requestIdRef.current)) return
      pageRef.current = nextPage
      setItems(current => mergeAcademyPages(current, res.data?.items ?? []))
      setHasMore(!!res.data?.hasMore)
    } catch (err) {
      if (!isCurrentRequest(requestId, requestIdRef.current)) return
      setMoreError(err)
    } finally {
      if (isCurrentRequest(requestId, requestIdRef.current)) {
        inFlightRef.current = false
        setLoadingMore(false)
      }
    }
  }, [hasMore, isLoading, isLoadingMore, error])

  /** Re-run the first page at once (first-page error). */
  const retry = useCallback(() => {
    immediateRef.current = true
    setReloadNonce(n => n + 1)
  }, [])

  return { query, items, hasMore, isLoading, isLoadingMore, error, moreError, setQuery, loadMore, retry }
}

export default useAcademySearch
