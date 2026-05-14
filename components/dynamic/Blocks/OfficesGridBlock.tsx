'use client'

import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

interface Office {
  region: string
  city: string
  address: string
  phone: string
}

function parseOffices(raw: unknown): Office[] {
  if (Array.isArray(raw)) return raw as Office[]
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch {}
  }
  return []
}

function OfficesGridBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const heading = rawProps.heading as string | undefined
  const offices = parseOffices(rawProps.offices)

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 max-w-7xl mx-auto">
        {heading && <h2 className="text-3xl text-base-content mb-8">{heading}</h2>}
        <div className="space-y-4">
          {offices.map((office, i) => (
            <div key={i} className="p-5 rounded-lg bg-base-200">
              <div className="flex items-start gap-4">
                <span className="mt-1 flex-shrink-0 text-base text-primary">📍</span>
                <div>
                  <p className="text-sm font-medium mb-1 text-primary">
                    {office.region} — {office.city}
                  </p>
                  <p className="text-sm mb-1 text-base-content/60">{office.address}</p>
                  <p className="text-sm text-base-content/80">
                    <span className="mr-2 text-primary">📞</span>
                    {office.phone}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </BaseBlock>
  )
}

export const OfficesGridBlockDefinition: BlockDefinition = {
  type: 'OfficesGridBlock',
  label: 'Global Offices',
  category: 'Company',
  description: 'Editable list of global office cards — region, city, address, phone',
  defaultProps: {
    heading: 'Global Offices',
    offices: [
      { region: 'USA',       city: 'Irvine',        address: '300 Spectrum Center Drive, Suite 400, Irvine, CA 92618',                             phone: '(800) 376-8551'    },
      { region: 'UAE',       city: 'Dubai',         address: '2020, A5 building, Dubai Digital Park, Dubai Silicon Oasis',                         phone: '+971 4-264-5799'   },
      { region: 'Qatar',     city: 'Doha',          address: 'Commercial Bank Plaza Tower, Floor 14, Doha Corniche',                               phone: '+974-50-511055'    },
      { region: 'KSA',       city: 'Riyadh',        address: 'AI Zein Tower, Office 26. 5th Floor, Salahuddin Ayoubi Street',                      phone: '+966-57-682-2981'  },
      { region: 'Caribbean', city: 'Santo Domingo', address: 'Edificio Plaza Long Beach, Suite 4, Puerto Plata, Dominican Republic',               phone: '(829) 860-8272'    },
      { region: 'Europe',    city: 'Belgium',       address: 'Rue Guillemins 139, 4000 Liège',                                                     phone: '+32 497 34 34 34'  },
      { region: 'Turkey',    city: 'Ankara',        address: 'Üniversiteler Mah, Galyum Blok 27/108 ODTÜ Teknokent/Ankara',                        phone: '+90 538 447 20 48' },
    ],
    blockClass: 'px-6 md:px-12 lg:px-20 py-16 bg-base-100',
    sectionId: 'offices',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading: { label: 'Section Heading', type: 'text' },
    offices: {
      label: 'Offices',
      type: 'repeater',
      fields: {
        region:  { label: 'Region',  type: 'text', value: '' },
        city:    { label: 'City',    type: 'text', value: '' },
        address: { label: 'Address', type: 'text', value: '' },
        phone:   { label: 'Phone',   type: 'text', value: '' },
      },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: OfficesGridBlock as unknown as BlockDefinition['Component'],
}

export default OfficesGridBlock
