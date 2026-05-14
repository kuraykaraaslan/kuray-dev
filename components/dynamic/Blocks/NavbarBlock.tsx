'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

interface NavLink {
  label: string
  href: string
}

const DEFAULT_NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Projects', href: '/projects' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
]

function parseNavLinks(raw: unknown): NavLink[] {
  if (Array.isArray(raw)) return raw as NavLink[]
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch {}
  }
  return DEFAULT_NAV_LINKS
}

function NavbarBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const siteTitle = (rawProps.siteTitle as string) || 'My Site'

  const navLinks = parseNavLinks(rawProps.navLinks)

  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (href?: string) => {
    if (!href) return false
    return href === '/' ? pathname === '/' : pathname?.startsWith(href)
  }

  return (
    <BaseBlock {...baseProps} as="div">
      <nav className="px-6 md:px-12 lg:px-20 py-4 w-full">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo / Site Title */}
          <Link href="/" className="text-xl font-bold text-primary">
            {siteTitle}
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((item, i) => (
              <Link
                key={i}
                href={item.href || '#'}
                className={`transition-colors ${
                  isActive(item.href) ? 'text-primary' : 'text-base-content/80 hover:text-base-content'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center">
            <button
              className="text-base-content"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="absolute top-0 right-0 h-full w-80 flex flex-col bg-base-200 shadow-2xl overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-base-content/10">
                <span className="text-xl font-bold text-primary">
                  {siteTitle}
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-base-content/80 hover:text-base-content"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col px-6 py-4 gap-1">
                {navLinks.map((item, i) => (
                  <Link
                    key={i}
                    href={item.href || '#'}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`py-3 border-b border-base-content/10 transition-colors ${
                      isActive(item.href) ? 'text-primary' : 'text-base-content/80 hover:text-base-content'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>
    </BaseBlock>
  )
}

export const NavbarBlockDefinition: BlockDefinition = {
  type: 'NavbarBlock',
  label: 'Navbar',
  description: 'Site navigation bar with desktop links and mobile drawer',
  category: 'Layout',
  defaultProps: {
    siteTitle: 'My Site',
    navLinks: DEFAULT_NAV_LINKS,
    blockClass: 'bg-base-100',
    sectionId: 'navbar',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    siteTitle: { label: 'Site Title / Logo Text', type: 'text' },
    navLinks: {
      label: 'Nav Links',
      type: 'repeater',
      fields: {
        label: { label: 'Label', type: 'text', value: '' },
        href:  { label: 'URL',   type: 'url',  value: '/' },
      },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: NavbarBlock as unknown as BlockDefinition['Component'],
}

export default NavbarBlock
