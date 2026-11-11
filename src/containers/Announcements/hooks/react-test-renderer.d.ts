// react-test-renderer ships without types and @types/react-test-renderer is not a dependency.
// Only what the hook tests use.
declare module 'react-test-renderer' {
  import type { ReactElement } from 'react'

  export type ReactTestRenderer = { unmount: () => void }
  export function create(element: ReactElement): ReactTestRenderer
  export function act(callback: () => void): void
}
