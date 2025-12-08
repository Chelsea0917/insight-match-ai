export interface Company {
  id: string;
  name: string;
  city: string;
  province: string;
  industry: string[];
  track: string;
  register_year: number;
  last_round: string;
  last_round_date: string;
  last_round_amount: string;
  investors: string[];
  headline: string;
  business_summary: string;
  news_snippet: string;
  growth_stage: string;
  tags: string[];
  raw_news_text?: string;
}

export interface RequirementProfile {
  region_preference: string[];
  industry_preference: string[];
  stage_preference: string[];
  time_window: string;
  extra_preferences: string[];
  scenario: string;
}

export interface MatchedCompany {
  company_id: string;
  match_score: number;
  match_reason: string;
  company: Company;
}

export interface CompanyAnalysis {
  matchPoints: string[];
  risks: string[];
  suitableVenue: string;
  recommendation: '推荐' | '谨慎推荐' | '不推荐';
  recommendationReason: string;
}
