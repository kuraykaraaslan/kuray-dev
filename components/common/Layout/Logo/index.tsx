'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCode } from '@fortawesome/free-solid-svg-icons'
import Link from '@/libs/i18n/Link'
interface LogoProps {
  className?: string
  iconClassName?: string
  textClassName?: string
  href?: string
}

const Logo = ({
  href = '/',
  className = 'btn btn-ghost md:rounded-full hover:bg-transparent active:bg-transparent focus:bg-transparent',
  iconClassName = 'text-2xl w-6',
  textClassName = 'text-lg font-bold',
}: LogoProps) => {
  // No aria-label: the visible "kuray.dev" text is the accessible name. An
  // aria-label like "Go to homepage" would not contain the visible text and
  // trips the label-content-name-mismatch a11y audit.
  return (
    <Link className={className + ' !flex-row'} href={href} onClick={() => window.scrollTo(0, 0)} dir="ltr">
      <FontAwesomeIcon icon={faCode} className={iconClassName} aria-hidden="true" />
      <span className={textClassName + ' ml-1 select-none'}>kuray.dev</span>
    </Link>
  )
}

export default Logo
