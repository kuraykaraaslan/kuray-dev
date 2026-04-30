'use client'

import type { BlockDefinition } from '../types'

interface ClientLogo {
  name: string
  logo?: string
  href?: string
}

function ClientLogosGridBlock(rawProps: Record<string, unknown>) {
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const bg = (rawProps.bgColor as string) || 'oklch(var(--b2))'
  const cardBg = (rawProps.cardBgColor as string) || 'oklch(var(--b3))'

  let clients: ClientLogo[] = []
  try {
    const raw = rawProps.clients
    clients = typeof raw === 'string' ? JSON.parse(raw) : (raw as ClientLogo[]) ?? []
  } catch {
    clients = []
  }

  return (
    <section className="py-20 px-6 md:px-12 lg:px-20" style={{ backgroundColor: bg }}>
      <div className="max-w-7xl mx-auto">
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && <h2 className="text-4xl md:text-5xl text-base-content mb-4">{heading}</h2>}
            {subtitle && (
              <p className="text-lg" style={{ color: 'oklch(var(--bc) / 0.7)' }}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {clients.map((client, i) => (
            <div
              key={i}
              className="rounded-lg p-6 min-h-28 flex items-center justify-center text-center"
              style={{ backgroundColor: cardBg }}
            >
              {client.href ? (
                <a href={client.href} className="flex items-center justify-center w-full h-full">
                  {client.logo ? (
                    <img src={client.logo} alt={client.name} className="max-h-12 object-contain" />
                  ) : (
                    <span className="text-base-content font-semibold">{client.name}</span>
                  )}
                </a>
              ) : client.logo ? (
                <img src={client.logo} alt={client.name} className="max-h-12 object-contain" />
              ) : (
                <span className="text-base-content font-semibold">{client.name}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
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
    bgColor: '',
    cardBgColor: '',
    clients: JSON.stringify([
      { name: 'Acme Corp' },
      { name: 'Nimbus' },
      { name: 'Northstar' },
      { name: 'Vertex' },
      { name: 'Orion' },
      { name: 'Helix' },
      { name: 'Atlas' },
      { name: 'Quantum' },
    ]),
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    bgColor: { label: 'Background Color', type: 'color' },
    cardBgColor: { label: 'Card Background Color', type: 'color' },
    clients: { label: 'Clients (JSON)', type: 'json' },
  },
  Component: ClientLogosGridBlock,
}

export default ClientLogosGridBlock