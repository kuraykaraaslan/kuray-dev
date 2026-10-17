'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import './styles/phoneInput.css'
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input'

//Fontawesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHourglass, faMessage } from '@fortawesome/free-solid-svg-icons'
import i18n from '@/libs/localize/localize'

// Any Unicode letter (José, Müller, Çelik, 李), plus spaces, apostrophes, dots and hyphens
const NAME_REGEX = /^[\p{L}\p{M}\s'’.-]{2,80}$/u
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const MESSAGE_MIN = 10
const MESSAGE_MAX = 2000
const isMessageLengthOk = (value: string) => value.trim().length >= MESSAGE_MIN && value.length <= MESSAGE_MAX

const ContactForm = (props: { className?: string; token: string; onSubmitted?: () => void }) => {
  const { t } = i18n
  //React states
  const token = props.token
  const [name, setName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [phone, setPhone] = useState<any>('')
  const [message, setMessage] = useState<string>('')

  // Honeypot field - bots will fill this, humans won't see it
  const [honeypot, setHoneypot] = useState<string>('')
  // Form load time for timing-based spam detection
  const [formLoadTime] = useState<number>(() => Date.now())

  //Validation states

  const [isEmailValid, setIsEmailValid] = useState<boolean>(true)
  const [isPhoneValid, setIsPhoneValid] = useState<boolean>(true)
  const [isNameValid, setIsNameValid] = useState<boolean>(true)
  const [isMessageValid, setIsMessageValid] = useState<boolean>(true)

  //Get country code
  const [geoInfo, setGeoInfo] = useState<any>([])
  const [defaultCountry, setDefaultCountry] = useState<any>(undefined)

  //Timer
  const [isSending, setIsSending] = useState<boolean>(false)

  useEffect(() => {
    if (geoInfo.length > 0) return
    const controller = new AbortController()
    axios
      .get('https://ipapi.co/json/', { signal: controller.signal, timeout: 5000 })
      .then((response) => {
        setGeoInfo(response.data)
        setDefaultCountry(response.data.country)
      })
      .catch(() => {})
    return () => controller.abort()
  }, [])

  const claases = props.className

  const onEmailChange = (e: any) => {
    setEmail(e.target.value)
    setIsEmailValid(EMAIL_REGEX.test(e.target.value))
  }

  const onPhoneChange = (value: any) => {
    setPhone(value)
    setIsPhoneValid(isValidPhoneNumber(value || ''))
  }

  const onNameChange = (e: any) => {
    setName(e.target.value)
    setIsNameValid(NAME_REGEX.test(e.target.value.trim()))
  }

  const onMessageChange = (e: any) => {
    setMessage(e.target.value)
    setIsMessageValid(isMessageLengthOk(e.target.value))
  }

  async function formSubmit() {
    if (isSending) return
    const date = new Date()

    // Validation checks
    const isNameOk = NAME_REGEX.test(name.trim())
    const isEmailOk = EMAIL_REGEX.test(email)
    const isPhoneOk = isValidPhoneNumber(phone || '')
    const isMessageOk = isMessageLengthOk(message)

    setIsNameValid(isNameOk)
    setIsEmailValid(isEmailOk)
    setIsPhoneValid(isPhoneOk)
    setIsMessageValid(isMessageOk)

    if (!token) {
      alert(t('shared.alert.can_not_verify_that_you_are_not_a_robot'))
      return
    }

    if (!isNameOk || !isEmailOk || !isPhoneOk || !isMessageOk) {
      alert(t('pages.contact.form.please_fill_in_all_fields'))
      return
    }

    setIsSending(true)

    const data = {
      name,
      email,
      phone,
      message,
      date,
      // Spam protection fields
      website: honeypot,
      _formLoadTime: formLoadTime,
      recaptchaToken: token,
    }

    try {
      await axios.post('/api/contact/form', data, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      setIsSending(false)
      alert(t('pages.contact.form.success'))

      // Clear the form so the same message can't be re-sent by accident, and let the page
      // discard the single-use reCAPTCHA token.
      setName('')
      setEmail('')
      setPhone('')
      setMessage('')
      props.onSubmitted?.()

      if (typeof window.gtag === 'function') {
        window.gtag('event', 'generate_lead')
      }
    } catch (error) {
      setIsSending(false)
      alert(t('pages.contact.form.error'))
    }
  }

  return (
    <div className={claases}>
      {/* Honeypot field - hidden from real users, bots will fill it */}
      <div className="absolute -left-[9999px] opacity-0 h-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          type="text"
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div className="mt-2">
        <label htmlFor="name" className="block mb-2 text-sm font-medium ">
          {t('pages.contact.form.name')}
        </label>
        <input
          type="text"
          id="name"
          className={
            'block p-3 w-full text-sm rounded-lg border border-1 border-gray-500 bg-gray-200 text-black placeholder:text-gray-600 ' +
            (isNameValid ? '' : 'text-red-500')
          }
          placeholder={t('pages.contact.form.enter_your_name')}
          required
          value={name}
          maxLength={80}
          onChange={onNameChange}
        />
      </div>
      <div className="mt-2">
        <label htmlFor="email" className="block mb-2 text-sm font-medium">
          {t('pages.contact.form.email')}
        </label>
        <input
          type="email"
          id="email"
          className={
            'block p-3 w-full text-sm rounded-lg border border-1 bg-gray-200 text-black placeholder:text-gray-600 ' +
            (isEmailValid ? '' : 'text-red-500')
          }
          placeholder={t('pages.contact.form.enter_your_email')}
          required
          value={email}
          maxLength={254}
          onChange={onEmailChange}
        />
      </div>
      <div className="mt-2">
        <label htmlFor="phone" className="block mb-2 text-sm font-medium">
          {t('pages.contact.form.phone')}
        </label>
        <PhoneInput
          international
          id="phone"
          className={
            'block pl-3 w-full text-sm rounded-lg border border-1 border-gray-500 bg-gray-200 p-3 text-black [&_.PhoneInputInput]:min-h-[44px] [&_.PhoneInputInput]:placeholder:text-gray-600 ' +
            (isPhoneValid ? '' : 'text-red-500')
          }
          placeholder={t('pages.contact.form.enter_your_phone')}
          required
          value={phone || undefined}
          // @ts-ignore
          defaultCountry={defaultCountry ? (defaultCountry as string) : 'TR'}
          onChange={onPhoneChange}
        />
      </div>
      <div className="mt-2">
        <label htmlFor="message" className="block mb-2 text-sm font-medium">
          {t('pages.contact.form.message')}
        </label>
        <textarea
          id="message"
          className={
            'block p-2.5 w-full text-sm rounded-lg border border-1 border-gray-500 min-h-[150px] bg-gray-200 resize-none text-black placeholder:text-gray-600 ' +
            (isMessageValid ? '' : 'text-red-500')
          }
          placeholder={t('pages.contact.form.enter_your_message')}
          required
          value={message}
          maxLength={MESSAGE_MAX}
          onChange={onMessageChange}
        ></textarea>
      </div>
      {isSending ? (
        <button
          type="submit"
          disabled
          className="mt-2 py-3 px-5 text-sm font-medium bg-base-300 rounded-lg hover:text-white focus-visible:ring-2 focus-visible:ring-primary border border-1 border-gray-500 light:placeholder-black"
        >
          <FontAwesomeIcon icon={faHourglass} spin className="w-3 h-3 mr-2" />
          {t('pages.contact.form.loading')}
        </button>
      ) : (
        <button
          type="submit"
          className="mt-2 py-3 px-5 text-sm font-medium bg-base-300 rounded-lg hover:text-white focus-visible:ring-2 focus-visible:ring-primary border border-1 border-gray-500 light:placeholder-black"
          onClick={formSubmit}
        >
          <FontAwesomeIcon icon={faMessage} className="w-3 h-3 mr-2" />
          {t('pages.contact.form.send')}
        </button>
      )}
    </div>
  )
}

export default ContactForm
