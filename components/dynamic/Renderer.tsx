import type { BlockData } from './types'
import DynamicPageBlockService from '@/services/DynamicPageBlockService'
import ClientBlockList from './partials/ClientBlockList'

interface Props {
  sections: BlockData[]
}

export default async function DynamicPageRenderer({ sections }: Props) {
  const dbDefs = await DynamicPageBlockService.getAll()
  return <ClientBlockList sections={sections} dbDefs={dbDefs} />
}
