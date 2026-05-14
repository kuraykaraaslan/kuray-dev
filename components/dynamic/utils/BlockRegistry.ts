import type { BlockDefinition, DynamicPageBlockRecord } from '../types'
import { CustomBlockDefinition } from '../Blocks/CustomBlock'
import { ProseBlockDefinition } from '../Blocks/ProseBlock'
import { WelcomeBlockDefinition } from '../Blocks/WelcomeBlock'
import { PlatformsBlockDefinition } from '../Blocks/PlatformsBlock'
import { GitContributionsBlockDefinition } from '../Blocks/GitContributionsBlock'
import { ServicesBlockDefinition } from '../Blocks/ServicesBlock'
import { TimelineBlockDefinition } from '../Blocks/TimelineBlock'
import { HireMeBlockDefinition } from '../Blocks/HireMeBlock'
import { ToolboxBlockDefinition } from '../Blocks/ToolboxBlock'
import { TestimonialsBlockDefinition } from '../Blocks/TestimonialsBlock'
import { ProjectsBlockDefinition } from '../Blocks/ProjectsBlock'
import { ContactBlockDefinition } from '../Blocks/ContactBlock'
import { CTABannerBlockDefinition } from '../Blocks/CTABannerBlock'
import { HowWeWorkBlockDefinition } from '../Blocks/HowWeWorkBlock'
// Migrated from avantleap-web
import { AboutHeroBlockDefinition } from '../Blocks/AboutHeroBlock'
import { AchievementsBlockDefinition } from '../Blocks/AchievementsBlock'
import { AnnouncementStripBlockDefinition } from '../Blocks/AnnouncementStripBlock'
import { AppDownloadBlockDefinition } from '../Blocks/AppDownloadBlock'
import { BenefitsGridBlockDefinition } from '../Blocks/BenefitsGridBlock'
import { BlogGridBlockDefinition } from '../Blocks/BlogGridBlock'
import { BlogPostBlockDefinition } from '../Blocks/BlogPostBlock'
import { CardGridBlockDefinition } from '../Blocks/CardGridBlock'
import { CaseStudyBlockDefinition } from '../Blocks/CaseStudyBlock'
import { ChallengeGridBlockDefinition } from '../Blocks/ChallengeGridBlock'
import { ChecklistBlockDefinition } from '../Blocks/ChecklistBlock'
import { ClientLogosGridBlockDefinition } from '../Blocks/ClientLogosGridBlock'
import { ComparisonBlockDefinition } from '../Blocks/ComparisonBlock'
import { ContactFormBlockDefinition } from '../Blocks/ContactFormBlock'
import { ContactMethodsBlockDefinition } from '../Blocks/ContactMethodsBlock'
import { DemoRequestBlockDefinition } from '../Blocks/DemoRequestBlock'
import { DownloadResourcesBlockDefinition } from '../Blocks/DownloadResourcesBlock'
import { FAQBlockDefinition } from '../Blocks/FAQBlock'
import { FeatureGridDefinition } from '../Blocks/FeatureGrid'
import { FooterCtaBlockDefinition } from '../Blocks/FooterCtaBlock'
import { HeroBlockDefinition } from '../Blocks/HeroBlock'
import { HeroLandingBlockDefinition } from '../Blocks/HeroLandingBlock'
import { HeroMinimalBlockDefinition } from '../Blocks/HeroMinimalBlock'
import { HeroSplitBlockDefinition } from '../Blocks/HeroSplitBlock'
import { HomeHeroBlockDefinition } from '../Blocks/HomeHeroBlock'
import { ImageGalleryBlockDefinition } from '../Blocks/ImageGalleryBlock'
import { IndustryUseCasesBlockDefinition } from '../Blocks/IndustryUseCasesBlock'
import { IntegrationsBlockDefinition } from '../Blocks/IntegrationsBlock'
import { LinkedCardsGridBlockDefinition } from '../Blocks/LinkedCardsGridBlock'
import { MediaEmbedBlockDefinition } from '../Blocks/MediaEmbedBlock'
import { MilestoneCardsBlockDefinition } from '../Blocks/MilestoneCardsBlock'
import { NavbarBlockDefinition } from '../Blocks/NavbarBlock'
import { NewsletterSignupBlockDefinition } from '../Blocks/NewsletterSignupBlock'
import { NotificationBannerBlockDefinition } from '../Blocks/NotificationBannerBlock'
import { OfficesGridBlockDefinition } from '../Blocks/OfficesGridBlock'
import { PartnerGridBlockDefinition } from '../Blocks/PartnerGridBlock'
import { PricingComparisonBlockDefinition } from '../Blocks/PricingComparisonBlock'
import { PricingTableBlockDefinition } from '../Blocks/PricingTableBlock'
import { QuoteBlockDefinition } from '../Blocks/QuoteBlock'
import { ResourcesBlockDefinition } from '../Blocks/ResourcesBlock'
import { SecurityBadgesBlockDefinition } from '../Blocks/SecurityBadgesBlock'
import { ServiceCardBlockDefinition } from '../Blocks/ServiceCardBlock'
import { StepsBlockDefinition } from '../Blocks/StepsBlock'
import { SupportContactBlockDefinition } from '../Blocks/SupportContactBlock'
import { TeamGroupBlockDefinition } from '../Blocks/TeamGroupBlock'
import { TeamIntroBlockDefinition } from '../Blocks/TeamIntroBlock'
import { TechStackBlockDefinition } from '../Blocks/TechStackBlock'
import { TextImageBlockDefinition } from '../Blocks/TextImageBlock'
import { TrustBarBlockDefinition } from '../Blocks/TrustBarBlock'
import { ValuesGridBlockDefinition } from '../Blocks/ValuesGridBlock'
import { WhyUsBlockDefinition } from '../Blocks/WhyUsBlock'
import { ProcessFlowBlockDefinition } from '../Blocks/ProcessFlowBlock'
import { RoadmapBlockDefinition } from '../Blocks/RoadmapBlock'
import { StatsDashboardBlockDefinition } from '../Blocks/StatsDashboardBlock'
import { TagCloudBlockDefinition } from '../Blocks/TagCloudBlock'
import { TeamMembersBlockDefinition } from '../Blocks/TeamMembersBlock'
import { TextStatsBlockDefinition } from '../Blocks/TextStatsBlock'
import { VideoGalleryBlockDefinition } from '../Blocks/VideoGalleryBlock'

// Code-level blocks (special / built-in)
const CODE_BLOCKS: Record<string, BlockDefinition> = {
  [CustomBlockDefinition.type]: CustomBlockDefinition,
  [ProseBlockDefinition.type]: ProseBlockDefinition,
  [WelcomeBlockDefinition.type]: WelcomeBlockDefinition,
  [PlatformsBlockDefinition.type]: PlatformsBlockDefinition,
  [GitContributionsBlockDefinition.type]: GitContributionsBlockDefinition,
  [ServicesBlockDefinition.type]: ServicesBlockDefinition,
  [TimelineBlockDefinition.type]: TimelineBlockDefinition,
  [HireMeBlockDefinition.type]: HireMeBlockDefinition,
  [ToolboxBlockDefinition.type]: ToolboxBlockDefinition,
  [TestimonialsBlockDefinition.type]: TestimonialsBlockDefinition,
  [ProjectsBlockDefinition.type]: ProjectsBlockDefinition,
  [ContactBlockDefinition.type]: ContactBlockDefinition,
  [CTABannerBlockDefinition.type]: CTABannerBlockDefinition,
  [HowWeWorkBlockDefinition.type]: HowWeWorkBlockDefinition,
  // Migrated from avantleap-web
  [AboutHeroBlockDefinition.type]: AboutHeroBlockDefinition,
  [AchievementsBlockDefinition.type]: AchievementsBlockDefinition,
  [AnnouncementStripBlockDefinition.type]: AnnouncementStripBlockDefinition,
  [AppDownloadBlockDefinition.type]: AppDownloadBlockDefinition,
  [BenefitsGridBlockDefinition.type]: BenefitsGridBlockDefinition,
  [BlogGridBlockDefinition.type]: BlogGridBlockDefinition,
  [BlogPostBlockDefinition.type]: BlogPostBlockDefinition,
  [CardGridBlockDefinition.type]: CardGridBlockDefinition,
  [CaseStudyBlockDefinition.type]: CaseStudyBlockDefinition,
  [ChallengeGridBlockDefinition.type]: ChallengeGridBlockDefinition,
  [ChecklistBlockDefinition.type]: ChecklistBlockDefinition,
  [ClientLogosGridBlockDefinition.type]: ClientLogosGridBlockDefinition,
  [ComparisonBlockDefinition.type]: ComparisonBlockDefinition,
  [ContactFormBlockDefinition.type]: ContactFormBlockDefinition,
  [ContactMethodsBlockDefinition.type]: ContactMethodsBlockDefinition,
  [DemoRequestBlockDefinition.type]: DemoRequestBlockDefinition,
  [DownloadResourcesBlockDefinition.type]: DownloadResourcesBlockDefinition,
  [FAQBlockDefinition.type]: FAQBlockDefinition,
  [FeatureGridDefinition.type]: FeatureGridDefinition,
  [FooterCtaBlockDefinition.type]: FooterCtaBlockDefinition,
  [HeroBlockDefinition.type]: HeroBlockDefinition,
  [HeroLandingBlockDefinition.type]: HeroLandingBlockDefinition,
  [HeroMinimalBlockDefinition.type]: HeroMinimalBlockDefinition,
  [HeroSplitBlockDefinition.type]: HeroSplitBlockDefinition,
  [HomeHeroBlockDefinition.type]: HomeHeroBlockDefinition,
  [ImageGalleryBlockDefinition.type]: ImageGalleryBlockDefinition,
  [IndustryUseCasesBlockDefinition.type]: IndustryUseCasesBlockDefinition,
  [IntegrationsBlockDefinition.type]: IntegrationsBlockDefinition,
  [LinkedCardsGridBlockDefinition.type]: LinkedCardsGridBlockDefinition,
  [MediaEmbedBlockDefinition.type]: MediaEmbedBlockDefinition,
  [MilestoneCardsBlockDefinition.type]: MilestoneCardsBlockDefinition,
  [NavbarBlockDefinition.type]: NavbarBlockDefinition,
  [NewsletterSignupBlockDefinition.type]: NewsletterSignupBlockDefinition,
  [NotificationBannerBlockDefinition.type]: NotificationBannerBlockDefinition,
  [OfficesGridBlockDefinition.type]: OfficesGridBlockDefinition,
  [PartnerGridBlockDefinition.type]: PartnerGridBlockDefinition,
  [PricingComparisonBlockDefinition.type]: PricingComparisonBlockDefinition,
  [PricingTableBlockDefinition.type]: PricingTableBlockDefinition,
  [QuoteBlockDefinition.type]: QuoteBlockDefinition,
  [ResourcesBlockDefinition.type]: ResourcesBlockDefinition,
  [SecurityBadgesBlockDefinition.type]: SecurityBadgesBlockDefinition,
  [ServiceCardBlockDefinition.type]: ServiceCardBlockDefinition,
  [StepsBlockDefinition.type]: StepsBlockDefinition,
  [SupportContactBlockDefinition.type]: SupportContactBlockDefinition,
  [TeamGroupBlockDefinition.type]: TeamGroupBlockDefinition,
  [TeamIntroBlockDefinition.type]: TeamIntroBlockDefinition,
  [TechStackBlockDefinition.type]: TechStackBlockDefinition,
  [TextImageBlockDefinition.type]: TextImageBlockDefinition,
  [TrustBarBlockDefinition.type]: TrustBarBlockDefinition,
  [ValuesGridBlockDefinition.type]: ValuesGridBlockDefinition,
  [WhyUsBlockDefinition.type]: WhyUsBlockDefinition,
  [ProcessFlowBlockDefinition.type]: ProcessFlowBlockDefinition,
  [RoadmapBlockDefinition.type]: RoadmapBlockDefinition,
  [StatsDashboardBlockDefinition.type]: StatsDashboardBlockDefinition,
  [TagCloudBlockDefinition.type]: TagCloudBlockDefinition,
  [TeamMembersBlockDefinition.type]: TeamMembersBlockDefinition,
  [TextStatsBlockDefinition.type]: TextStatsBlockDefinition,
  [VideoGalleryBlockDefinition.type]: VideoGalleryBlockDefinition,
}

export function getCodeBlock(type: string): BlockDefinition | undefined {
  return CODE_BLOCKS[type]
}

export function getCodeBlocks(): BlockDefinition[] {
  return Object.values(CODE_BLOCKS)
}

// Resolve a block definition from either code registry or DB records
// Returns null if not found in either
export function resolveBlockDef(
  type: string,
  dbDefs: DynamicPageBlockRecord[]
): DynamicPageBlockRecord | BlockDefinition | null {
  if (CODE_BLOCKS[type]) return CODE_BLOCKS[type]
  return dbDefs.find((d) => d.type === type) ?? null
}
