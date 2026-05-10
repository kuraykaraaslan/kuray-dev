'use client'
import i18n from '@/libs/localize/localize'
import { useState, useEffect, useMemo } from 'react'

interface Props {
  prefix?: string
  suffix?: string
  texts?: string[]
}

const TypingEffect = ({ prefix: prefixProp, suffix: suffixProp, texts: textsProp }: Props) => {
  const { t } = i18n

  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const prefix = prefixProp ?? t('pages.hero.typing_effect.prefix')
  const suffix = suffixProp ?? t('pages.hero.typing_effect.suffix')

  const texts = useMemo(
    () =>
      textsProp && textsProp.length > 0
        ? textsProp
        : [
            t('pages.hero.typing_effect.text1'),
            t('pages.hero.typing_effect.text2'),
            t('pages.hero.typing_effect.text3'),
            t('pages.hero.typing_effect.text4'),
            t('pages.hero.typing_effect.text5'),
            t('pages.hero.typing_effect.text6'),
          ],
    [textsProp, i18n.language]
  )

  const [textsIndex, setTextsIndex] = useState(0)
  const [letterIndex, setLetterIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [pause, setPause] = useState(false)
  const [renderedText, setRenderedText] = useState('')

  useEffect(() => {
    if (prefersReducedMotion) return

    const current = texts[textsIndex]
    const delay = isDeleting ? 30 : 80
    const pauseAfterFull = 1000

    const handleTyping = () => {
      if (pause) return
      if (!isDeleting && letterIndex < current.length) {
        setLetterIndex((i) => i + 1)
      } else if (isDeleting && letterIndex > 0) {
        setLetterIndex((i) => i - 1)
      } else if (!isDeleting && letterIndex === current.length) {
        setTimeout(() => setIsDeleting(true), pauseAfterFull)
      } else if (isDeleting && letterIndex === 0) {
        setIsDeleting(false)
        setTextsIndex((i) => (i + 1) % texts.length)
      }
    }

    const timeout = setTimeout(handleTyping, delay)
    setRenderedText(current.substring(0, letterIndex))
    return () => clearTimeout(timeout)
  }, [letterIndex, isDeleting, pause, textsIndex, texts, prefersReducedMotion])

  if (prefersReducedMotion) {
    return (
      <p className="text-3xl font-bold text-shadow-sm pb-2">
        {prefix}&nbsp;
        <span className="text-primary text-shadow-sm">{texts[0]}</span>
        {suffix && <>&nbsp;{suffix}</>}
      </p>
    )
  }

  return (
    <p className="text-3xl font-bold text-shadow-sm pb-2">
      {prefix}&nbsp;
      <span
        className="text-primary text-shadow-sm"
        onMouseEnter={() => setPause(true)}
        onMouseLeave={() => setPause(false)}
      >
        {renderedText === '' ? ' ' : renderedText}
      </span>
      {suffix && <>&nbsp;{suffix}</>}
    </p>
  )
}

export default TypingEffect
