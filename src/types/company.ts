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

// 新版政府招商评估报告 - 专业级颗粒度
export interface GovernmentAssessment {
  // 模块一：企业简介
  companyOverview: {
    basicInfo: {
      establishedYear: number;
      registeredCapital: string;
      paidInCapital: string;
      shareholdingStructure: string;
      actualController: string;
      listingStatus: string;  // 是否上市/上市地点及进展
      headquarters: string;
      mainOperatingLocations: string[];
    };
    coreBusiness: {
      mainBusiness: string;
      coreProducts: string[];
      industryPosition: string;  // 行业地位（排名、份额、认证）
      mainCustomerTypes: string[];
    };
    financialStatus: {
      latestRevenue: string;
      revenueGrowthRate: string;
      profitability: string;
      overseasRevenueRatio: string;
      inventoryStatus: string;
      receivablesStatus: string;
      debtStatus: string;
    };
    investmentDemand: {
      landingDirection: string;  // 拟落地方向（总部/研发/制造/区域中心等）
      investmentScale: string;
      fundUsage: string[];
      coreDemandsFromGovernment: string[];
    };
  };

  // 模块二：行业背景分析
  industryBackground: {
    marketOverview: {
      globalMarketSize: string;
      chinaMarketSize: string;
      growthRate: string;
      marketTrend: string;
    };
    technologyRoutes: Array<{
      name: string;
      characteristics: string;
      developmentStatus: string;
      representativeCompanies: string[];
    }>;
    industryChain: {
      upstream: { description: string; representativeCompanies: string[] };
      midstream: { description: string; representativeCompanies: string[] };
      downstream: { description: string; representativeCompanies: string[] };
    };
    policyEnvironment: {
      nationalPolicy: string;
      localPolicy: string;
      policyTrend: string;
    };
  };

  // 模块三：企业综合画像
  companyProfile: {
    industryStage: string;        // 所处行业阶段
    coreTechnology: string;       // 技术/产品核心竞争点
    competitiveAdvantages: string[];  // 核心竞争优势列表
    developmentStage: string;     // 当前发展阶段
    summary: string;              // 300字以内总结
  };

  // 模块四：项目真实性与落地判断
  landingAssessment: {
    credibilityLevel: '高可信' | '中等可信' | '存疑';
    strategicAlignment: string;   // 与企业战略一致性
    irreplaceability: string;     // 不可替代性分析
    inputOutputLogic: string;     // 投入产出逻辑
    keyEvidence: string[];        // 关键判断依据
    landingChallenges: string[];  // 落地面临的挑战
  };

  // 模块五：与地方产业匹配度评估
  industryMatch: {
    matchLevel: '高度匹配' | '匹配' | '一般' | '不匹配';
    dominantIndustryFit: string;  // 与区域主导产业契合度
    chainEffect: string;          // 补链/强链/延链作用
    clusterPotential: string;     // 产业集聚或示范效应潜力
    localRepresentativeCompanies: string[];  // 本地同类代表企业
    synergyAnalysis: string;      // 与本地企业协同分析
  };

  // 模块六：可为地方带来的核心价值
  coreValue: {
    industryValue: {
      technology: string;
      brand: string;
      chainLeaderEffect: string;
    };
    economicValue: {
      estimatedTax: string;
      estimatedOutput: string;
      estimatedEmployment: string;
    };
    strategicValue: {
      demonstrationEffect: string;
      externalCooperation: string;
      regionalUpgrade: string;
    };
  };

  // 模块七：主要风险识别
  riskAssessment: {
    financialRisk: {
      source: string;
      severity: '高' | '中' | '低';
      specificIssues: string[];
      localImpact: string;
    };
    businessRisk: {
      source: string;
      severity: '高' | '中' | '低';
      specificIssues: string[];
      localImpact: string;
    };
    competitionRisk: {
      source: string;
      severity: '高' | '中' | '低';
      competitors: string[];
      localImpact: string;
    };
    policyRisk: {
      source: string;
      severity: '高' | '中' | '低';
      specificIssues: string[];
      localImpact: string;
    };
    operationalRisk: {
      source: string;
      severity: '高' | '中' | '低';
      specificIssues: string[];
      localImpact: string;
    };
  };

  // 模块八：政府引入策略建议
  introductionStrategy: {
    recommendIntroduce: '是' | '谨慎' | '不建议';
    recommendedForm: string;      // 引入形式
    policyPriority: Array<{
      type: string;
      priority: number;
      reason: string;
    }>;
    notRecommendedPolicy: Array<{
      type: string;
      reason: string;
    }>;
    implementationPath: string[]; // 实施路径建议
  };

  // 模块九：招商谈判关键条款建议
  negotiationTerms: Array<{
    term: string;
    requirement: string;
    rationale: string;
  }>;

  // 模块十：综合结论（一页纸给领导）
  conclusion: {
    projectType: string;          // 项目类型
    overallRating: number;        // 1-5星
    ratingBreakdown: {
      industryProspect: number;
      companyStrength: number;
      landingFeasibility: number;
      valueContribution: number;
      riskLevel: number;
    };
    recommendedAction: string;    // 推荐动作
    biggestOpportunity: string;   // 最大机会点
    biggestRisk: string;          // 最大风险点
    keyDecisionFactors: string[]; // 关键决策因素
    executiveSummary: string;     // 100字核心摘要
  };

  // 信息不足标注
  insufficientInfo: Array<{
    field: string;
    importance: '关键' | '重要' | '参考';
    suggestedSource: string;
  }>;
}
