export const SIZE_CLASS: Record<string, string> = {
  sm: 'max-w-sm', md: 'max-w-xl', lg: 'max-w-3xl', fullscreen: 'w-screen h-screen',
}

export const POS_CLASS: Record<string, string> = {
  center: 'items-center justify-center',
  'bottom-center': 'items-end justify-center pb-8',
  'bottom-right': 'items-end justify-end p-8',
  'top-center': 'items-start justify-center pt-8',
}

export const RADIUS_CLASS: Record<string, string> = {
  none: 'rounded-none', sm: 'rounded-sm', md: 'rounded-md', lg: 'rounded-lg', xl: 'rounded-xl',
}

export const CLOSE_POS_CLASS: Record<string, string> = {
  'top-right': 'top-2 right-2',
  'top-left': 'top-2 left-2',
  'bottom-right': 'bottom-2 right-2',
  'bottom-left': 'bottom-2 left-2',
}

export const CLOSE_SIZE: Record<string, { box: string; text: string }> = {
  sm: { box: 'w-6 h-6 text-sm', text: '' },
  md: { box: 'w-8 h-8 text-base', text: '' },
  lg: { box: 'w-10 h-10 text-lg', text: '' },
}
