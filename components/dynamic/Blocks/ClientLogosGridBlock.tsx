'use client'

import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

interface ClientLogo {
  name: string
  logo?: string
  href?: string
}

const DEFAULT_CLIENTS: ClientLogo[] = [
  { name: 'Acme Corp' },
  { name: 'Nimbus'    },
  { name: 'Northstar' },
  { name: 'Vertex'    },
  { name: 'Orion'     },
  { name: 'Helix'     },
  { name: 'Atlas'     },
  { name: 'Quantum'   },
]

function parseClients(raw: unknown): ClientLogo[] {
  if (Array.isArray(raw)) return raw as ClientLogo[]
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch {}
  }
  return DEFAULT_CLIENTS
}

function ClientLogosGridBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const clients = parseClients(rawProps.clients)

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 max-w-7xl mx-auto">
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && (
              <h2 className="text-4xl md:text-5xl text-base-content mb-4">{heading}</h2>
            )}
            {subtitle && (
              <p className="text-lg text-base-content/70">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {clients.map((client, i) => (
            <div
              key={i}
              className="rounded-lg p-6 min-h-28 flex items-center justify-center text-center bg-base-200"
            >
              {client.href ? (
                <a
                  href={client.href}
                  className="flex items-center justify-center w-full h-full"
                >
                  {client.logo ? (
                    <img
                      src={client.logo}
                      alt={client.name}
                      className="max-h-12 object-contain"
                    />
                  ) : (
                    <span className="text-base-content font-semibold">{client.name}</span>
                  )}
                </a>
              ) : client.logo ? (
                <img
                  src={client.logo}
                  alt={client.name}
                  className="max-h-12 object-contain"
                />
              ) : (
                <span className="text-base-content font-semibold">{client.name}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </BaseBlock>
  )
}

export const ClientLogosGridBlockDefinition: BlockDefinition = {
  type: 'ClientLogosGridBlock',
  label: 'Client Logos Grid',
  category: 'Social Proof',
  description: 'Display client and partner logos in a responsive grid.',
  defaultProps: {
    heading: 'Trusted By',
    subtitle: 'Teams and enterprises that rely on us',
    clients: DEFAULT_CLIENTS,
    blockClass: 'bg-base-100 py-20 px-6 md:px-12 lg:px-20',
    sectionId: 'clients',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading:  { label: 'Heading',  type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    clients: {
      label: 'Clients',
      type: 'repeater',
      fields: {
        name: { label: 'Name',     type: 'text', value: '' },
        logo: { label: 'Logo URL', type: 'img',  value: '' },
        href: { label: 'Link URL', type: 'url',  value: '' },
      },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: ClientLogosGridBlock as unknown as BlockDefinition['Component'],
}

export default ClientLogosGridBlock
