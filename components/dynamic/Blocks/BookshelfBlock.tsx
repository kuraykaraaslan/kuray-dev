'use client'

import Link from 'next/link'
import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

// Literal column map — dynamic Tailwind class generation is forbidden
const COLS: Record<string, string> = {
  '2': 'sm:grid-cols-2',
  '3': 'sm:grid-cols-2 lg:grid-cols-3',
  '4': 'sm:grid-cols-2 lg:grid-cols-4',
  '5': 'sm:grid-cols-3 lg:grid-cols-5',
}

type BookStatus = 'read' | 'reading' | 'wishlist'

// Literal status → badge classes map (no dynamic Tailwind)
const STATUS_BADGE: Record<BookStatus, string> = {
  read:     'bg-success/15 text-success',
  reading:  'bg-warning/15 text-warning',
  wishlist: 'bg-info/15 text-info',
}

const STATUS_LABEL: Record<BookStatus, string> = {
  read:     'Okundu',
  reading:  'Okunuyor',
  wishlist: 'Listede',
}

interface Book {
  title: string
  author?: string
  cover?: string
  status?: BookStatus
  rating?: number
  category?: string
  year?: string
  href?: string
}

function normalizeStatus(value: unknown): BookStatus {
  return value === 'reading' || value === 'wishlist' ? value : 'read'
}

function parseBooks(raw: unknown): Book[] {
  let list: Book[] = []
  try {
    list = typeof raw === 'string' ? JSON.parse(raw) : (raw as Book[]) ?? []
  } catch {
    list = []
  }
  return Array.isArray(list) ? list : []
}

function Stars({ rating }: { rating: number }) {
  const rounded = Math.max(0, Math.min(5, Math.round(rating)))
  if (!rounded) return null
  return (
    <div className="text-warning text-sm tracking-tight" aria-label={`${rounded} / 5`}>
      {'★'.repeat(rounded)}
      <span className="text-base-content/20">{'★'.repeat(5 - rounded)}</span>
    </div>
  )
}

function BookshelfBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const heading = rawProps.heading as string | undefined
  const headingAccent = rawProps.headingAccent as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const columns = (rawProps.columns as string) || '4'

  const books = parseBooks(rawProps.books)
  const gridCols = COLS[columns] ?? COLS['4']

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-20">
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && (
              <h2 className="text-4xl md:text-5xl text-base-content mb-4">
                {heading}
                {headingAccent && (
                  <> <span className="text-primary">{headingAccent}</span></>
                )}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg max-w-3xl mx-auto text-base-content/70">{subtitle}</p>
            )}
          </div>
        )}

        <div className={`grid grid-cols-1 ${gridCols} gap-8`}>
          {books.map((book, i) => {
            const status = normalizeStatus(book.status)
            const inner = (
              <>
                {/* Cover */}
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-base-300 shadow-md ring-1 ring-base-content/5 transition-transform group-hover:scale-[1.03]">
                  {book.cover ? (
                    // Plain <img> — book covers come from arbitrary external URLs not in next/image remotePatterns
                    <img
                      src={book.cover}
                      alt={book.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center">
                      <span className="text-3xl opacity-40">📖</span>
                      <span className="text-sm font-medium leading-tight text-base-content/60">
                        {book.title}
                      </span>
                    </div>
                  )}
                  <span
                    className={`absolute left-2 top-2 rounded px-2 py-0.5 text-[11px] font-medium ${STATUS_BADGE[status]}`}
                  >
                    {STATUS_LABEL[status]}
                  </span>
                </div>

                {/* Meta */}
                <div className="mt-3">
                  <h3 className="text-base font-semibold leading-snug text-base-content line-clamp-2">
                    {book.title}
                  </h3>
                  {book.author && (
                    <p className="mt-0.5 text-sm text-base-content/60 line-clamp-1">{book.author}</p>
                  )}
                  <div className="mt-1.5 flex items-center gap-2">
                    {book.rating ? <Stars rating={Number(book.rating)} /> : null}
                    {(book.category || book.year) && (
                      <span className="text-xs text-base-content/40">
                        {[book.category, book.year].filter(Boolean).join(' · ')}
                      </span>
                    )}
                  </div>
                </div>
              </>
            )

            return book.href ? (
              <Link key={i} href={book.href} className="group block">
                {inner}
              </Link>
            ) : (
              <div key={i} className="group block">
                {inner}
              </div>
            )
          })}
        </div>
      </div>
    </BaseBlock>
  )
}

const DEFAULT_BOOKS: Book[] = [
  {
    title: 'Suç ve Ceza',
    author: 'Fyodor Dostoyevski',
    cover: '',
    status: 'read',
    rating: 5,
    category: 'Roman',
    year: '1866',
  },
  {
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    cover: '',
    status: 'read',
    rating: 4,
    category: 'Tarih',
    year: '2011',
  },
  {
    title: 'Dune',
    author: 'Frank Herbert',
    cover: '',
    status: 'reading',
    rating: 5,
    category: 'Bilim Kurgu',
    year: '1965',
  },
  {
    title: 'Atomik Alışkanlıklar',
    author: 'James Clear',
    cover: '',
    status: 'wishlist',
    rating: 0,
    category: 'Kişisel Gelişim',
    year: '2018',
  },
]

export const BookshelfBlockDefinition: BlockDefinition = {
  type: 'BookshelfBlock',
  label: 'Bookshelf',
  category: 'Content',
  description: 'Evdeki kitapları kapak, yazar, puan ve okuma durumuyla listeleyen kitaplık ızgarası.',
  defaultProps: {
    heading: 'Kitaplığım',
    headingAccent: '',
    subtitle: 'Evimde okuduğum, okuduğum ve okumak istediğim kitaplar.',
    columns: '4',
    books: DEFAULT_BOOKS,
    blockClass: 'bg-base-100',
    sectionId: 'bookshelf',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading: { label: 'Heading (main part)', type: 'text' },
    headingAccent: { label: 'Heading Accent (primary-colored part)', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'textarea' },
    columns: { label: 'Columns', type: 'select', options: ['2', '3', '4', '5'] },
    books: {
      label: 'Books',
      type: 'repeater',
      fields: {
        title:    { label: 'Title',          type: 'text',   value: '' },
        author:   { label: 'Author',         type: 'text',   value: '' },
        cover:    { label: 'Cover',          type: 'img',    uploadFolder: 'content', value: '' },
        status:   { label: 'Status',         type: 'select', options: ['read', 'reading', 'wishlist'], value: 'read' },
        rating:   { label: 'Rating (0–5)',   type: 'number', min: 0, max: 5, step: 1, value: 0 },
        category: { label: 'Category/Genre', type: 'text',   value: '' },
        year:     { label: 'Year',           type: 'text',   value: '' },
        href:     { label: 'Link URL',       type: 'url',    value: '' },
      },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: BookshelfBlock as unknown as BlockDefinition['Component'],
}

export default BookshelfBlock
