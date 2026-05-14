'use client'
import { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons'
import {
  faXTwitter, faLinkedin, faTelegram, faFacebook, faInstagram, faWhatsapp,
} from '@fortawesome/free-brands-svg-icons'
import { CircleFlag } from 'react-circle-flags'
import Link from 'next/link'
import axios from 'axios'
import dynamic from 'next/dynamic'
import ReCAPTCHA from 'react-google-recaptcha'
import type { BlockDefinition } from '../types'

const Form = dynamic(
  () => import('@/components/frontend/Features/Hero/Contact/Partials/Form'),
  { ssr: false }
)

const recaptchaSiteKey = process.env.RECAPTCHA_CLIENT_KEY || ''

interface Phone {
  CountryCode: string
  PhoneNumber: string
  noSpacePhoneNumber: string
  hasTelegram: boolean
  hasWhatsapp: boolean
}

interface Mail {
  mail: string
}

function ContactBlock(rawProps: Record<string, unknown>) {
  const title = (rawProps.title as string) || 'Get In Touch'
  const description = (rawProps.description as string) || 'Have a project in mind? Let\'s talk.'
  const sendMessageTitle = (rawProps.sendMessageTitle as string) || 'Send a Message'
  const phoneAndMailLabel = (rawProps.phoneAndMailLabel as string) || 'Phone & Email'
  const socialMediaLabel = (rawProps.socialMediaLabel as string) || 'Social Media'
  const backgroundColor = (rawProps.backgroundColor as string) || 'bg-base-100'
  const whatsappUrl = (rawProps.whatsappUrl as string) || 'https://wa.me/905459223554'
  const telegramUrl = (rawProps.telegramUrl as string) || 'https://t.me/kuraykaraaslan'
  const linkedinUrl = (rawProps.linkedinUrl as string) || 'https://www.linkedin.com/in/kuraykaraaslan'
  const twitterUrl = (rawProps.twitterUrl as string) || 'https://twitter.com/kuraykaraaslan'
  const facebookUrl = (rawProps.facebookUrl as string) || 'https://www.facebook.com/kuraykaraaslan'
  const instagramUrl = (rawProps.instagramUrl as string) || 'https://www.instagram.com/kuraykaraaslan'
  const revealMailLabel = (rawProps.revealMailLabel as string) || 'Reveal Email'
  const revealPhoneLabel = (rawProps.revealPhoneLabel as string) || 'Reveal Phone'

  const [phoneNumbers, setPhoneNumbers] = useState<Phone[]>([])
  const [mails, setMails] = useState<Mail[]>([])
  const [token, setToken] = useState<string>('x')
  const recaptchaRef = useRef<ReCAPTCHA>(null)

  useEffect(() => {
    const val = recaptchaRef.current?.getValue()
    setToken(val as string)
  }, [])

  useEffect(() => {
    if (token === '') return
    getMails()
  }, [token])

  const getMails = () => {
    if (token === '') return
    if (mails.length === 0) {
      axios.get('/api/contact/info/mail').then((res) => setMails(res.data.mails))
    }
  }

  const getPhoneNumbers = () => {
    if (token === '') return
    if (phoneNumbers.length === 0) {
      axios.get('/api/contact/info/phone').then((res) => setPhoneNumbers(res.data.phones))
    }
  }

  return (
    <section className={`min-h-screen md:pt-24 ${backgroundColor}`} id="contact">
      <div className="container mx-auto mt-0 md:rounded-box md:shadow-2xl md:border-2 md:border-black contactHero">
        <div className="mx-4 md:mx-8 pt-2 rounded-box md:mb-4">
          <div className="grid max-w-6xl grid-cols-1 px-6 mx-auto lg:px-8 md:grid-cols-2 md:divide-x pt-12 pb-12 mb-2">
            <div className="py-6 md:py-0 md:px-6">
              <h2 className="text-4xl font-bold">{title}</h2>
              <p className="pt-2 pb-4">{description}</p>

              <div className="space-y-4">
                <h3 className="text-xl font-bold">{phoneAndMailLabel}</h3>
                {token !== '' ? (
                  <>
                    {mails.length === 0 && (
                      <button className="flex transform transition-transform hover:scale-105" onClick={getMails}>
                        <FontAwesomeIcon icon={faEnvelope} className="w-5 h-5 mr-2 sm:mr-6" />
                        <span>{revealMailLabel}</span>
                      </button>
                    )}
                    {mails.map((mail, i) => (
                      <p key={i} className="flex">
                        <FontAwesomeIcon icon={faEnvelope} className="w-5 h-5 mr-2 sm:mr-6" />
                        <Link href={`mailto:${mail.mail}`} target="_blank" rel="noopener noreferrer">
                          {mail.mail}
                        </Link>
                      </p>
                    ))}
                    {phoneNumbers.length === 0 && (
                      <button className="flex transform transition-transform hover:scale-105" onClick={getPhoneNumbers}>
                        <FontAwesomeIcon icon={faPhone} className="w-5 h-5 mr-2 sm:mr-6" />
                        <span>{revealPhoneLabel}</span>
                      </button>
                    )}
                    {phoneNumbers.map((phone, i) => (
                      <p key={i} className="flex">
                        <CircleFlag countryCode={phone.CountryCode} className="rounded-full w-5 h-5 mr-2 sm:mr-6" />
                        <Link href={`tel:${phone.noSpacePhoneNumber}`} target="_blank" rel="noopener noreferrer">
                          {phone.PhoneNumber}
                        </Link>
                        <span className="ms-2">
                          {phone.hasWhatsapp && (
                            <Link href={`https://wa.me/${phone.noSpacePhoneNumber}`}>
                              <FontAwesomeIcon icon={faWhatsapp} className="w-5 h-5 me-2 sm:me-3" />
                            </Link>
                          )}
                          {phone.hasTelegram && (
                            <Link href={`https://t.me/${phone.noSpacePhoneNumber}`}>
                              <FontAwesomeIcon icon={faTelegram} className="w-5 h-5 me-2 sm:me-3" />
                            </Link>
                          )}
                        </span>
                      </p>
                    ))}
                  </>
                ) : (
                  <ReCAPTCHA ref={recaptchaRef} size="normal" sitekey={recaptchaSiteKey} />
                )}
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

            <div className="flex flex-col py-6 space-y-6 md:py-0 md:px-6">
              <h2 className="text-4xl font-bold">{sendMessageTitle}</h2>
              <Form token={token} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export const ContactBlockDefinition: BlockDefinition = {
  type: 'ContactBlock',
  label: 'Contact',
  description: 'Full contact section with phone/email reveal, social links, and contact form.',
  category: 'Hero',
  defaultProps: {
    title: 'Get In Touch',
    description: "Have a project in mind? Let's talk.",
    sendMessageTitle: 'Send a Message',
    phoneAndMailLabel: 'Phone & Email',
    socialMediaLabel: 'Social Media',
    revealMailLabel: 'Reveal Email',
    revealPhoneLabel: 'Reveal Phone',
    backgroundColor: 'bg-base-100',
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
    revealMailLabel: { label: 'Reveal Email Button Label', type: 'text' },
    revealPhoneLabel: { label: 'Reveal Phone Button Label', type: 'text' },
    backgroundColor: { label: 'Background Color Class', type: 'text', placeholder: 'bg-base-100' },
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
