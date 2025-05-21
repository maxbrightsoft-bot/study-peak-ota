
export interface TooltipProps<T> {
    onClose: () => void
    onOpen: (note: T) => void
}