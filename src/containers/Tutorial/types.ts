export type SlideType = 'welcome' | 'feature' | 'final'

export interface FeatureItem {
  icon: string
  title: string
  description: string
}

export interface WelcomeSlide {
  id: string
  type: 'welcome'
  stats: Array<{ value: string; label: string }>
}

export interface FeatureSlide {
  id: string
  type: 'feature'
  step: number
  badge: string
  title: string
  titleAccent: string
  description: string
  imageSource: any
  features: FeatureItem[]
  focusArea?: {
    top: string    // e.g. '20%'
    left: string   // e.g. '10%'
    width: string  // e.g. '80%'
    height: string // e.g. '15%'
  }
}

export interface FinalSlide {
  id: string
  type: 'final'
  title: string
  subtitle: string
}

export type Slide = WelcomeSlide | FeatureSlide | FinalSlide
