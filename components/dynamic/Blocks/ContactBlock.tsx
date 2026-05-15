'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'
import {
  faXTwitter, faLinkedin, faTelegram, faFacebook, faInstagram, faWhatsapp,
} from '@fortawesome/free-brands-svg-icons'
import { CircleFlag } from 'react-circle-flags'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import BaseBlock, { BASE_BLOCK_DEFAULT_PROPS, BASE_BLOCK_SCHEMA_FIELDS, parseBaseBlockProps } from '../partials/BaseBlock'
import { usePreviewMode } from '../partials/PreviewContext'
import type { BlockDefinition } from '../types'

const Form = dynamic(
  () => import('@/components/frontend/Features/Hero/Contact/Partials/Form'),
  { ssr: false }
)

interface PhoneEntry {
  countryCode: string
  phoneNumber: string
  hasTelegram: boolean
  hasWhatsapp: boolean
}

interface MailEntry {
  mail: string
}

const DEFAULT_PHONES: PhoneEntry[] = [
  { countryCode: 'tr', phoneNumber: '+90 545 922 35 54', hasTelegram: true, hasWhatsapp: true },
]

const DEFAULT_MAILS: MailEntry[] = [
  { mail: 'kuraykaraaslan@gmail.com' },
]

function parsePhones(raw: unknown): PhoneEntry[] {
  if (Array.isArray(raw)) return raw as PhoneEntry[]
  if (typeof raw === 'string') { try { return JSON.parse(raw) } catch {} }
  return DEFAULT_PHONES
}

function parseMails(raw: unknown): MailEntry[] {
  if (Array.isArray(raw)) return raw as MailEntry[]
  if (typeof raw === 'string') { try { return JSON.parse(raw) } catch {} }
  return DEFAULT_MAILS
}

function ContactBlock(rawProps: Record<string, unknown>) {
  const previewMode = usePreviewMode()

  const title = (rawProps.title as string) || 'Get In Touch'
  const description = (rawProps.description as string) || "Have a project in mind? Let's talk."
  const sendMessageTitle = (rawProps.sendMessageTitle as string) || 'Send a Message'
  const phoneAndMailLabel = (rawProps.phoneAndMailLabel as string) || 'Phone & Email'
  const socialMediaLabel = (rawProps.socialMediaLabel as string) || 'Social Media'
  const baseProps = parseBaseBlockProps(rawProps)

  const whatsappUrl = (rawProps.whatsappUrl as string) || 'https://wa.me/905459223554'
  const telegramUrl = (rawProps.telegramUrl as string) || 'https://t.me/kuraykaraaslan'
  const linkedinUrl = (rawProps.linkedinUrl as string) || 'https://www.linkedin.com/in/kuraykaraaslan'
  const twitterUrl = (rawProps.twitterUrl as string) || 'https://twitter.com/kuraykaraaslan'
  const facebookUrl = (rawProps.facebookUrl as string) || 'https://www.facebook.com/kuraykaraaslan'
  const instagramUrl = (rawProps.instagramUrl as string) || 'https://www.instagram.com/kuraykaraaslan'

  const phones = parsePhones(rawProps.phones)
  const mails = parseMails(rawProps.mails)

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 container mx-auto mt-0 md:rounded-box md:shadow-2xl md:border-2 md:border-black contactHero">
        <div className="mx-4 md:mx-8 pt-2 rounded-box md:mb-4">
          <div className={`grid max-w-6xl grid-cols-1 px-6 mx-auto lg:px-8 ${previewMode !== 'mobile' ? 'md:grid-cols-2 md:divide-x' : ''} pt-12 pb-12 mb-2`}>

            {/* Left: contact info */}
            <div className="py-6 md:py-0 md:px-6">
              <h2 className="text-4xl font-bold">{title}</h2>
              <p className="pt-2 pb-4">{description}</p>

              <div className="space-y-4">
                <h3 className="text-xl font-bold">{phoneAndMailLabel}</h3>
                {mails.map((m, i) => (
                  <p key={i} className="flex items-center">
                    <FontAwesomeIcon icon={faEnvelope} className="w-5 h-5 mr-2 sm:mr-6 shrink-0" />
                    <Link href={`mailto:${m.mail}`} target="_blank" rel="noopener noreferrer">
                      {m.mail}
                    </Link>
                  </p>
                ))}
                {phones.map((p, i) => (
                  <p key={i} className="flex items-center">
                    <CircleFlag countryCode={p.countryCode} className="rounded-full w-5 h-5 mr-2 sm:mr-6 shrink-0" />
                    <Link href={`tel:${p.phoneNumber.replace(/\s/g, '')}`} target="_blank" rel="noopener noreferrer">
                      {p.phoneNumber}
                    </Link>
                    <span className="ms-2 flex items-center">
                      {p.hasWhatsapp && (
                        <Link href={`https://wa.me/${p.phoneNumber.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                          <FontAwesomeIcon icon={faWhatsapp} className="w-5 h-5 me-2 sm:me-3" />
                        </Link>
                      )}
                      {p.hasTelegram && (
                        <Link href={`https://t.me/${p.phoneNumber.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                          <FontAwesomeIcon icon={faTelegram} className="w-5 h-5 me-2 sm:me-3" />
                        </Link>
                      )}
                    </span>
                  </p>
                ))}
              </div>

              <div className="space-y-4 mt-4">
                <h3 className="text-xl font-bold">{socialMediaLabel}</h3>
                <p className="flex items-center text-green-500 animate-pulse">
                  <FontAwesomeIcon icon={faWhatsapp} className="w-5 h-5 mr-2 sm:mr-6" />
                  <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer">WhatsApp</Link>
                </p>
                <p className="flex items-center">
                  <FontAwesomeIcon icon={faTelegram} className="w-5 h-5 mr-2 sm:mr-6" />
                  <Link href={telegramUrl} target="_blank" rel="noopener noreferrer">Telegram</Link>
                </p>
                <p className="flex items-center">
                  <FontAwesomeIcon icon={faLinkedin} className="w-5 h-5 mr-2 sm:mr-6" />
                  <Link href={linkedinUrl} target="_blank" rel="noopener noreferrer">LinkedIn</Link>
                </p>
                <p className="flex items-center">
                  <FontAwesomeIcon icon={faXTwitter} className="w-5 h-5 mr-2 sm:mr-6" />
                  <Link href={twitterUrl} target="_blank" rel="noopener noreferrer">X (Twitter)</Link>
                </p>
                <p className="flex items-center">
                  <FontAwesomeIcon icon={faFacebook} className="w-5 h-5 mr-2 sm:mr-6" />
                  <Link href={facebookUrl} target="_blank" rel="noopener noreferrer">Facebook</Link>
                </p>
                <p className="flex items-center">
                  <FontAwesomeIcon icon={faInstagram} className="w-5 h-5 mr-2 sm:mr-6" />
                  <Link href={instagramUrl} target="_blank" rel="noopener noreferrer">Instagram</Link>
                </p>
              </div>
            </div>

            {/* Right: form */}
            <div className="flex flex-col py-6 space-y-6 md:py-0 md:px-6">
              <h2 className="text-4xl font-bold">{sendMessageTitle}</h2>
              <Form token="" />
            </div>

          </div>
        </div>
      </div>
    </BaseBlock>
  )
}

export const ContactBlockDefinition: BlockDefinition = {
  type: 'ContactBlock',
  label: 'Contact',
  description: 'Full contact section with phones, emails, social links, and a contact form.',
  category: 'Hero',
  defaultProps: {
    title: 'Get In Touch',
    description: "Have a project in mind? Let's talk.",
    sendMessageTitle: 'Send a Message',
    phoneAndMailLabel: 'Phone & Email',
    socialMediaLabel: 'Social Media',
    blockClass: 'min-h-screen md:pt-24 bg-base-100',
    sectionId: 'contact',
    ...BASE_BLOCK_DEFAULT_PROPS,
    phones: DEFAULT_PHONES,
    mails: DEFAULT_MAILS,
    whatsappUrl: 'https://wa.me/905459223554',
    telegramUrl: 'https://t.me/kuraykaraaslan',
    linkedinUrl: 'https://www.linkedin.com/in/kuraykaraaslan',
    twitterUrl: 'https://twitter.com/kuraykaraaslan',
    facebookUrl: 'https://www.facebook.com/kuraykaraaslan',
    instagramUrl: 'https://www.instagram.com/kuraykaraaslan',
  },
  schema: {
    title: { label: 'Title', type: 'text' },
    description: { label: 'Description', type: 'textarea' },
    sendMessageTitle: { label: 'Send Message Heading', type: 'text' },
    phoneAndMailLabel: { label: 'Phone & Mail Section Label', type: 'text' },
    socialMediaLabel: { label: 'Social Media Section Label', type: 'text' },
    mails: {
      label: 'Email Addresses',
      type: 'repeater',
      fields: {
        mail: { label: 'Email', type: 'text', value: '' },
      },
    },
    phones: {
      label: 'Phone Numbers',
      type: 'repeater',
      fields: {
        countryCode: { label: 'Country Code (2-letter, e.g. tr)', type: 'text', value: 'tr' },
        phoneNumber: { label: 'Phone Number', type: 'text', value: '' },
        hasWhatsapp: { label: 'WhatsApp', type: 'boolean', value: false },
        hasTelegram: { label: 'Telegram', type: 'boolean', value: false },
      },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
    whatsappUrl: { label: 'WhatsApp URL', type: 'url' },
    telegramUrl: { label: 'Telegram URL', type: 'url' },
    linkedinUrl: { label: 'LinkedIn URL', type: 'url' },
    twitterUrl: { label: 'X (Twitter) URL', type: 'url' },
    facebookUrl: { label: 'Facebook URL', type: 'url' },
    instagramUrl: { label: 'Instagram URL', type: 'url' },
  },
  Component: ContactBlock as unknown as BlockDefinition['Component'],
}

export default ContactBlock
