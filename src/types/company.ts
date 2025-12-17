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

// 旧版简化分析（保留兼容性）
export interface CompanyAnalysis {
  matchPoints: string[];
  risks: string[];
  suitableVenue: string;
  recommendation: '推荐' | '谨慎推荐' | '不推荐';
  recommendationReason: string;
}

// 新版政府招商评估报告
export interface GovernmentAssessment {
  // 模块一：企业综合画像
  companyProfile: {
    industryStage: string;        // 所处行业阶段
    coreTechnology: string;       // 技术/产品核心竞争点
    developmentStage: string;     // 当前发展阶段
    summary: string;              // 300字以内总结
  };

  // 模块二：项目真实性与落地判断
  landingAssessment: {
    credibilityLevel: '高可信' | '中等可信' | '存疑';
    strategicAlignment: string;   // 与企业战略一致性
    irreplaceability: string;     // 不可替代性分析
    inputOutputLogic: string;     // 投入产出逻辑
    keyEvidence: string[];        // 关键判断依据
  };

  // 模块三：与地方产业匹配度评估
  industryMatch: {
    matchLevel: '高度匹配' | '匹配' | '一般' | '不匹配';
    dominantIndustryFit: string;  // 与区域主导产业契合度
    chainEffect: string;          // 补链/强链/延链作用
    clusterPotential: string;     // 产业集聚或示范效应潜力
  };

  // 模块四：可为地方带来的核心价值
  coreValue: {
    industryValue: string;        // 产业价值（技术、品牌、链主效应）
    economicValue: string;        // 经济价值（税收、产值、就业）
    strategicValue: string;       // 战略价值（示范、对外合作、区域能级）
  };

  // 模块五：主要风险识别
  riskAssessment: {
    financialRisk: {
      source: string;
      localImpact: string;
    };
    businessRisk: {
      source: string;
      localImpact: string;
    };
    competitionRisk: {
      source: string;
      localImpact: string;
    };
    policyRisk: {
      source: string;
      localImpact: string;
    };
  };

  // 模块六：政府引入策略建议
  introductionStrategy: {
    recommendIntroduce: '是' | '谨慎' | '不建议';
    recommendedForm: string;      // 引入形式
    policyPriority: string[];     // 政策支持优先级
    notRecommendedPolicy: string[]; // 不建议给予的政策
  };

  // 模块七：招商谈判关键条款建议
  negotiationTerms: string[];     // 5条核心条款

  // 模块八：综合结论
  conclusion: {
    projectType: string;          // 项目类型
    overallRating: number;        // 1-5星
    recommendedAction: string;    // 推荐动作
    biggestOpportunity: string;   // 最大机会点
    biggestRisk: string;          // 最大风险点
  };

  // 信息不足标注
  insufficientInfo: string[];     // 需补充信息的字段列表
}
