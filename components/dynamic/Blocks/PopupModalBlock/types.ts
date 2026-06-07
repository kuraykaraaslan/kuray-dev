export interface PopupButton {
  text: string
  link: string
  openNewTab: boolean
  variant: 'filled' | 'outlined' | 'ghost'
  bgColor: string
  textColor: string
}

export type AnimPhase = 'entering' | 'visible' | 'exiting'

export interface CloseBtnProps {
  pos: string; style: string; size: string
  color: string; bgColor: string
  isEditor: boolean; onClose?: () => void
}

export interface CardProps {
  p: Record<string, unknown>
  isEditor: boolean
  onClose?: () => void
  animStyle?: React.CSSProperties
  onAnimEnd?: () => void
}
