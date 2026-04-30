import type { BlockDefinition } from './types'
import { HeroBlockDefinition } from './Blocks/HeroBlock'
import { HeroSplitBlockDefinition } from './Blocks/HeroSplitBlock'
import { HeroMinimalBlockDefinition } from './Blocks/HeroMinimalBlock'
import { HeroLandingBlockDefinition } from './Blocks/HeroLandingBlock'
import { TrustBarBlockDefinition } from './Blocks/TrustBarBlock'
import { CardGridBlockDefinition } from './Blocks/CardGridBlock'
import { ChallengeGridBlockDefinition } from './Blocks/ChallengeGridBlock'
import { StepsBlockDefinition } from './Blocks/StepsBlock'
import { WhyUsBlockDefinition } from './Blocks/WhyUsBlock'
import { TestimonialsBlockDefinition } from './Blocks/TestimonialsBlock'
import { CTABannerBlockDefinition } from './Blocks/CTABannerBlock'
import { FeatureGridDefinition } from './Blocks/FeatureGrid'
import { PricingTableBlockDefinition } from './Blocks/PricingTableBlock'
import { FAQBlockDefinition } from './Blocks/FAQBlock'
import { TextImageBlockDefinition } from './Blocks/TextImageBlock'
import { AchievementsBlockDefinition } from './Blocks/AchievementsBlock'
import { ProcessFlowBlockDefinition } from './Blocks/ProcessFlowBlock'
import { CaseStudyBlockDefinition } from './Blocks/CaseStudyBlock'
import { ComparisonBlockDefinition } from './Blocks/ComparisonBlock'
import { TeamMembersBlockDefinition } from './Blocks/TeamMembersBlock'
import { IntegrationsBlockDefinition } from './Blocks/IntegrationsBlock'
import { NewsletterSignupBlockDefinition } from './Blocks/NewsletterSignupBlock'
import { VideoGalleryBlockDefinition } from './Blocks/VideoGalleryBlock'
import { TimelineBlockDefinition } from './Blocks/TimelineBlock'
import { ResourcesBlockDefinition } from './Blocks/ResourcesBlock'
import { BenefitsGridBlockDefinition } from './Blocks/BenefitsGridBlock'
import { IndustryUseCasesBlockDefinition } from './Blocks/IndustryUseCasesBlock'
import { ClientLogosGridBlockDefinition } from './Blocks/ClientLogosGridBlock'
import { TechStackBlockDefinition } from './Blocks/TechStackBlock'
import { RoadmapBlockDefinition } from './Blocks/RoadmapBlock'
import { QuoteBlockDefinition } from './Blocks/QuoteBlock'
import { NotificationBannerBlockDefinition } from './Blocks/NotificationBannerBlock'
import { BlogGridBlockDefinition } from './Blocks/BlogGridBlock'
import { ImageGalleryBlockDefinition } from './Blocks/ImageGalleryBlock'
import { DemoRequestBlockDefinition } from './Blocks/DemoRequestBlock'
import { PricingComparisonBlockDefinition } from './Blocks/PricingComparisonBlock'
import { ServiceCardBlockDefinition } from './Blocks/ServiceCardBlock'
import { StatsDashboardBlockDefinition } from './Blocks/StatsDashboardBlock'
import { PartnerGridBlockDefinition } from './Blocks/PartnerGridBlock'
import { FooterCtaBlockDefinition } from './Blocks/FooterCtaBlock'
import { ChecklistBlockDefinition } from './Blocks/ChecklistBlock'
import { SecurityBadgesBlockDefinition } from './Blocks/SecurityBadgesBlock'
import { ContactMethodsBlockDefinition } from './Blocks/ContactMethodsBlock'
import { AnnouncementStripBlockDefinition } from './Blocks/AnnouncementStripBlock'
import { MediaEmbedBlockDefinition } from './Blocks/MediaEmbedBlock'
import { TeamIntroBlockDefinition } from './Blocks/TeamIntroBlock'
import { ValuesGridBlockDefinition } from './Blocks/ValuesGridBlock'
import { MilestoneCardsBlockDefinition } from './Blocks/MilestoneCardsBlock'
import { DownloadResourcesBlockDefinition } from './Blocks/DownloadResourcesBlock'
import { CustomBlockDefinition } from './Blocks/CustomBlock'
import { AppDownloadBlockDefinition } from './Blocks/AppDownloadBlock'
import { FrontendWelcomeBlockDefinition } from './Blocks/FrontendWelcomeBlock'
import { FrontendServicesBlockDefinition } from './Blocks/FrontendServicesBlock'
import { FrontendPlatformsBlockDefinition } from './Blocks/FrontendPlatformsBlock'
import { FrontendLiveTestimonialsBlockDefinition } from './Blocks/FrontendLiveTestimonialsBlock'
import { FrontendGitContributionsBlockDefinition } from './Blocks/FrontendGitContributionsBlock'
import { FrontendHireMeBlockDefinition } from './Blocks/FrontendHireMeBlock'
import { FrontendCareerTimelineBlockDefinition } from './Blocks/FrontendCareerTimelineBlock'
import { FrontendToolboxBlockDefinition } from './Blocks/FrontendToolboxBlock'
import { FrontendProjectsBlockDefinition } from './Blocks/FrontendProjectsBlock'

const REGISTRY: Record<string, BlockDefinition> = {
  // Custom
  [CustomBlockDefinition.type]: CustomBlockDefinition,
  [AppDownloadBlockDefinition.type]: AppDownloadBlockDefinition,

  // Hero variants
  [HeroLandingBlockDefinition.type]: HeroLandingBlockDefinition,
  [HeroBlockDefinition.type]: HeroBlockDefinition,
  [HeroSplitBlockDefinition.type]: HeroSplitBlockDefinition,
  [HeroMinimalBlockDefinition.type]: HeroMinimalBlockDefinition,

  // Social Proof
  [TrustBarBlockDefinition.type]: TrustBarBlockDefinition,
  [TestimonialsBlockDefinition.type]: TestimonialsBlockDefinition,
  [CaseStudyBlockDefinition.type]: CaseStudyBlockDefinition,
  [AchievementsBlockDefinition.type]: AchievementsBlockDefinition,
  [ClientLogosGridBlockDefinition.type]: ClientLogosGridBlockDefinition,

  // Features & Services
  [CardGridBlockDefinition.type]: CardGridBlockDefinition,
  [FeatureGridDefinition.type]: FeatureGridDefinition,
  [BenefitsGridBlockDefinition.type]: BenefitsGridBlockDefinition,
  [ChallengeGridBlockDefinition.type]: ChallengeGridBlockDefinition,
  [TechStackBlockDefinition.type]: TechStackBlockDefinition,
  [ServiceCardBlockDefinition.type]: ServiceCardBlockDefinition,
  [StatsDashboardBlockDefinition.type]: StatsDashboardBlockDefinition,
  [PartnerGridBlockDefinition.type]: PartnerGridBlockDefinition,

  // Pricing & Plans
  [PricingTableBlockDefinition.type]: PricingTableBlockDefinition,
  [PricingComparisonBlockDefinition.type]: PricingComparisonBlockDefinition,

  // Content
  [TextImageBlockDefinition.type]: TextImageBlockDefinition,
  [StepsBlockDefinition.type]: StepsBlockDefinition,
  [ProcessFlowBlockDefinition.type]: ProcessFlowBlockDefinition,
  [TimelineBlockDefinition.type]: TimelineBlockDefinition,
  [IndustryUseCasesBlockDefinition.type]: IndustryUseCasesBlockDefinition,
  [RoadmapBlockDefinition.type]: RoadmapBlockDefinition,
  [QuoteBlockDefinition.type]: QuoteBlockDefinition,
  [BlogGridBlockDefinition.type]: BlogGridBlockDefinition,
  [ChecklistBlockDefinition.type]: ChecklistBlockDefinition,

  // Forms & CTAs
  [NewsletterSignupBlockDefinition.type]: NewsletterSignupBlockDefinition,
  [CTABannerBlockDefinition.type]: CTABannerBlockDefinition,
  [NotificationBannerBlockDefinition.type]: NotificationBannerBlockDefinition,
  [AnnouncementStripBlockDefinition.type]: AnnouncementStripBlockDefinition,
  [DemoRequestBlockDefinition.type]: DemoRequestBlockDefinition,
  [FooterCtaBlockDefinition.type]: FooterCtaBlockDefinition,
  [ContactMethodsBlockDefinition.type]: ContactMethodsBlockDefinition,
  [MediaEmbedBlockDefinition.type]: MediaEmbedBlockDefinition,

  // Information
  [FAQBlockDefinition.type]: FAQBlockDefinition,
  [ResourcesBlockDefinition.type]: ResourcesBlockDefinition,
  [DownloadResourcesBlockDefinition.type]: DownloadResourcesBlockDefinition,

  // Company Info
  [TeamMembersBlockDefinition.type]: TeamMembersBlockDefinition,
  [TeamIntroBlockDefinition.type]: TeamIntroBlockDefinition,
  [ValuesGridBlockDefinition.type]: ValuesGridBlockDefinition,
  [MilestoneCardsBlockDefinition.type]: MilestoneCardsBlockDefinition,

  // Integrations & Tech
  [IntegrationsBlockDefinition.type]: IntegrationsBlockDefinition,

  // Support
  [WhyUsBlockDefinition.type]: WhyUsBlockDefinition,
  [ComparisonBlockDefinition.type]: ComparisonBlockDefinition,
  [SecurityBadgesBlockDefinition.type]: SecurityBadgesBlockDefinition,

  // Media
  [VideoGalleryBlockDefinition.type]: VideoGalleryBlockDefinition,
  [ImageGalleryBlockDefinition.type]: ImageGalleryBlockDefinition,

  // Frontend (portfolio-specific live blocks)
  [FrontendWelcomeBlockDefinition.type]: FrontendWelcomeBlockDefinition,
  [FrontendServicesBlockDefinition.type]: FrontendServicesBlockDefinition,
  [FrontendPlatformsBlockDefinition.type]: FrontendPlatformsBlockDefinition,
  [FrontendLiveTestimonialsBlockDefinition.type]: FrontendLiveTestimonialsBlockDefinition,
  [FrontendGitContributionsBlockDefinition.type]: FrontendGitContributionsBlockDefinition,
  [FrontendHireMeBlockDefinition.type]: FrontendHireMeBlockDefinition,
  [FrontendCareerTimelineBlockDefinition.type]: FrontendCareerTimelineBlockDefinition,
  [FrontendToolboxBlockDefinition.type]: FrontendToolboxBlockDefinition,
  [FrontendProjectsBlockDefinition.type]: FrontendProjectsBlockDefinition,
}

export function getBlock(type: string): BlockDefinition | undefined {
  return REGISTRY[type]
}

export function getAllBlockDefinitions(): BlockDefinition[] {
  return Object.values(REGISTRY)
}

export default REGISTRY
