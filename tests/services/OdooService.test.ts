import OdooService from '@/services/OdooService'

jest.mock('@/libs/logger', () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}))

const ENV = {
  ODOO_SYNC_ENABLED: 'true',
  ODOO_URL: 'https://crm.example.com/',
  ODOO_DB: 'crm',
  ODOO_API_KEY: 'secret-key',
}

const INPUT = { name: 'Ada Lovelace', email: 'ada@example.com', phone: '+905551234567', message: 'Hi <b>there</b>\nSecond line' }

function jsonResponse(body: unknown, status = 200) {
  return { ok: status >= 200 && status < 300, status, text: async () => JSON.stringify(body) } as Response
}

describe('OdooService', () => {
  const fetchMock = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global as any).fetch = fetchMock
    ;(OdooService as any).utmCache.clear()
  })

  describe('isEnabled', () => {
    it('is off unless ODOO_SYNC_ENABLED is "true"', () => {
      expect(OdooService.isEnabled({})).toBe(false)
      expect(OdooService.isEnabled({ ODOO_SYNC_ENABLED: 'yes' })).toBe(false)
      expect(OdooService.isEnabled({ ODOO_SYNC_ENABLED: ' TRUE ' })).toBe(true)
    })
  })

  describe('getConfig', () => {
    it('names every missing required variable', () => {
      expect(() => OdooService.getConfig({ ODOO_URL: 'https://x' })).toThrow('ODOO_DB, ODOO_API_KEY')
    })

    it('trims the trailing slash and parses optional ids', () => {
      const config = OdooService.getConfig({ ...ENV, ODOO_LEAD_TEAM_ID: '3', ODOO_LEAD_USER_ID: 'abc' })
      expect(config.url).toBe('https://crm.example.com')
      expect(config.teamId).toBe(3)
      expect(config.userId).toBeUndefined()
      expect(config.leadType).toBe('lead')
    })
  })

  describe('toHtml', () => {
    it('escapes markup and keeps line breaks', () => {
      expect(OdooService.toHtml('a <b>&</b>\nb')).toBe('<p>a &lt;b&gt;&amp;&lt;/b&gt;<br>b</p>')
    })
  })

  describe('createLead', () => {
    it('creates a crm.lead with bearer auth and returns its id', async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse([11])) // utm.source search
        .mockResolvedValueOnce(jsonResponse([22])) // utm.medium search
        .mockResolvedValueOnce(jsonResponse([987])) // crm.lead create

      const id = await OdooService.createLead(INPUT, { ...ENV, ODOO_LEAD_TEAM_ID: '5' })

      expect(id).toBe(987)
      const leadCall = fetchMock.mock.calls.find(([url]) => String(url).endsWith('/json/2/crm.lead/create'))!
      expect(leadCall[0]).toBe('https://crm.example.com/json/2/crm.lead/create')
      expect(leadCall[1].headers).toMatchObject({
        Authorization: 'bearer secret-key',
        'X-Odoo-Database': 'crm',
      })
      const vals = JSON.parse(leadCall[1].body).vals_list[0]
      expect(vals).toMatchObject({
        name: 'Website contact – Ada Lovelace',
        type: 'lead',
        contact_name: 'Ada Lovelace',
        email_from: 'ada@example.com',
        phone: '+905551234567',
        team_id: 5,
        source_id: 11,
        medium_id: 22,
      })
      expect(vals.description).toBe('<p>Hi &lt;b&gt;there&lt;/b&gt;<br>Second line</p>')
    })

    it('creates the utm source/medium when they do not exist yet', async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse([])) // source search: none
        .mockResolvedValueOnce(jsonResponse([])) // medium search: none
        .mockResolvedValueOnce(jsonResponse([31])) // source create
        .mockResolvedValueOnce(jsonResponse([32])) // medium create
        .mockResolvedValueOnce(jsonResponse([1])) // lead create

      await OdooService.createLead(INPUT, ENV)

      const urls = fetchMock.mock.calls.map(([url]) => String(url))
      expect(urls).toEqual(
        expect.arrayContaining([
          'https://crm.example.com/json/2/utm.source/create',
          'https://crm.example.com/json/2/utm.medium/create',
        ])
      )
    })

    it('still creates the lead when the utm lookups are refused', async () => {
      fetchMock.mockImplementation(async (url: string) =>
        String(url).includes('crm.lead')
          ? jsonResponse([55])
          : jsonResponse({ name: 'odoo.exceptions.AccessError', message: 'denied' }, 403)
      )

      await expect(OdooService.createLead(INPUT, ENV)).resolves.toBe(55)
      const vals = JSON.parse(
        fetchMock.mock.calls.find(([url]) => String(url).includes('crm.lead'))![1].body
      ).vals_list[0]
      expect(vals.source_id).toBeUndefined()
      expect(vals.medium_id).toBeUndefined()
    })

    it('throws with the Odoo error message on a failed create', async () => {
      fetchMock.mockImplementation(async (url: string) =>
        String(url).includes('crm.lead')
          ? jsonResponse({ name: 'odoo.exceptions.AccessDenied', message: 'Invalid apikey' }, 401)
          : jsonResponse([1])
      )

      await expect(OdooService.createLead(INPUT, ENV)).rejects.toThrow('crm.lead.create failed (401): Invalid apikey')
    })

    it('throws when Odoo returns no id', async () => {
      fetchMock.mockImplementation(async (url: string) =>
        String(url).includes('crm.lead') ? jsonResponse([]) : jsonResponse([1])
      )

      await expect(OdooService.createLead(INPUT, ENV)).rejects.toThrow('returned no id')
    })

    it('rejects before any request when the config is incomplete', async () => {
      await expect(OdooService.createLead(INPUT, { ODOO_SYNC_ENABLED: 'true' })).rejects.toThrow('not configured')
      expect(fetchMock).not.toHaveBeenCalled()
    })
  })
})
