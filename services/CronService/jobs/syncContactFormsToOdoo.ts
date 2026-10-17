import Logger from '@/libs/logger'
import ContactFormService from '@/services/ContactFormService'

/** Retries contact-form submissions that have not been created as Odoo leads yet. */
export async function syncContactFormsToOdoo(): Promise<void> {
    const { synced, failed } = await ContactFormService.syncPendingToOdoo()
    if (synced > 0 || failed > 0) {
        Logger.info(`syncContactFormsToOdoo: ${synced} synced, ${failed} still pending`)
    }
}
