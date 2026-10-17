import { flushClickBuffer } from '../jobs/flushClickBuffer'
import { syncContactFormsToOdoo } from '../jobs/syncContactFormsToOdoo'

export const fiveMinJobs: Array<{ name: string; handler: () => Promise<void> }> = [
    { name: 'flushClickBuffer', handler: flushClickBuffer },
    { name: 'syncContactFormsToOdoo', handler: syncContactFormsToOdoo },
]
