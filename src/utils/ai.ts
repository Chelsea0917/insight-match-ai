import { Company, RequirementProfile, MatchedCompany, CompanyAnalysis, GovernmentAssessment } from '@/types/company';
import { supabase } from '@/integrations/supabase/client';

// Import prompts from txt files
import NEWS_SEARCH_SYSTEM from '@/prompts/news-search.txt?raw';
import GOVERNMENT_ASSESSMENT_PROMPT from '@/prompts/government-assessment.txt?raw';

// Prompt templates for system messages
const REQUIREMENT_ANALYSIS_SYSTEM = `你是招商助手，请阅读用户的一段招商需求文本，提取出结构化筛选条件。
请抽取：
- region_preference：地域/城市/区域关键词列表
- industry_preference：行业/赛道关键词列表
- stage_preference：融资轮次（如：天使轮、A轮、B轮等）
- time_window：如果提到最近几年/某个时间段，请解析为描述字符串
- extra_preferences：其它偏好（如是否有头部基金、是否已商业化、是否团队在扩张等）
- scenario：适配场景（如：产业园、总部办公、实验室、制造工厂等的推理）`;

const COMPANY_SEARCH_SYSTEM = `你是招商搜索引擎，请根据"用户需求画像"实时生成5-10家符合条件的公司。
这些公司应该是真实存在或高度拟真的企业，包含完整信息。
每家公司需要：完整的公司名称、城市、省份、行业、赛道、融资信息、投资方、业务概述等。
同时为每家公司给出0-100的匹配分数和匹配理由。
按匹配分数从高到低排序。`;

// Call AI API through edge function
async function callAI(messages: { role: string; content: string }[], type: string): Promise<unknown> {
  const { data, error } = await supabase.functions.invoke('ai-chat', {
    body: { messages, type }
  });

  if (error) {
    console.error('AI API error:', error);
    throw new Error(error.message || 'AI API call failed');
  }

  if (!data.success) {
    console.error('AI API returned error:', data.error);
    throw new Error(data.error || 'AI API returned error');
  }

  return data.data;
}

// Analyze requirement with AI
export async function analyzeRequirementWithAI(requirementText: string): Promise<RequirementProfile> {
  try {
    const messages = [
      { role: 'system', content: REQUIREMENT_ANALYSIS_SYSTEM },
      { role: 'user', content: `请分析以下招商需求：\n\n${requirementText}` }
    ];
    
    const result = await callAI(messages, 'parse_requirement') as RequirementProfile;
    
    return {
      region_preference: result.region_preference || [],
      industry_preference: result.industry_preference || [],
      stage_preference: result.stage_preference || [],
      time_window: result.time_window || '',
      extra_preferences: result.extra_preferences || [],
      scenario: result.scenario || ''
    };
  } catch (error) {
    console.error('AI requirement analysis failed, using local fallback:', error);
    return parseRequirementLocally(requirementText);
  }
}

// Search companies with AI (real-time generation)
export async function searchCompaniesWithAI(
  requirementProfile: RequirementProfile
): Promise<MatchedCompany[]> {
  try {
    const messages = [
      { role: 'system', content: COMPANY_SEARCH_SYSTEM },
      { 
        role: 'user', 
        content: `【用户需求画像】：
${JSON.stringify(requirementProfile, null, 2)}

请根据以上需求，实时搜索/生成5-10家最匹配的公司，包含完整信息和匹配分数。`
      }
    ];
    
    const result = await callAI(messages, 'search_companies') as { 
      companies: Array<{
        id: string;
        name: string;
        city: string;
        province: string;
        industry: string[];
        track: string;
        register_year?: number;
        last_round: string;
        last_round_date?: string;
        last_round_amount?: string;
        investors?: string[];
        headline?: string;
        business_summary: string;
        news_snippet?: string;
        growth_stage?: string;
        tags?: string[];
        match_score: number;
        match_reason: string;
      }>
    };
    
    return result.companies.map((c) => ({
      company_id: c.id,
      match_score: c.match_score,
      match_reason: c.match_reason,
      company: {
        id: c.id,
        name: c.name,
        city: c.city,
        province: c.province,
        industry: c.industry || [],
        track: c.track,
        register_year: c.register_year || new Date().getFullYear(),
        last_round: c.last_round,
        last_round_date: c.last_round_date || new Date().toISOString().split('T')[0],
        last_round_amount: c.last_round_amount || '',
        investors: c.investors || [],
        headline: c.headline || c.business_summary.slice(0, 50),
        business_summary: c.business_summary,
        news_snippet: c.news_snippet || '',
        growth_stage: c.growth_stage || '快速增长',
        tags: c.tags || []
      }
    })).sort((a, b) => b.match_score - a.match_score);
  } catch (error) {
    console.error('AI company search failed:', error);
    throw error;
  }
}

// 新版：政府招商评估报告
export async function analyzeCompanyForGovernment(
  requirementText: string,
  company: Company
): Promise<GovernmentAssessment> {
  try {
    const messages = [
      { role: 'system', content: GOVERNMENT_ASSESSMENT_PROMPT },
      { 
        role: 'user', 
        content: `【招商需求/拟引入区域产业背景】：
${requirementText}

【企业信息】：
企业名称：${company.name}
成立时间：${company.register_year}年
所在地：${company.city}，${company.province}
主营行业：${company.industry.join('、')}
细分赛道：${company.track}
发展阶段：${company.growth_stage}
最近融资轮次：${company.last_round}
融资时间：${company.last_round_date}
融资金额：${company.last_round_amount}
投资方：${company.investors.join('、')}
业务概述：${company.business_summary}
企业标签：${company.tags.join('、')}
最新动态：${company.headline}
${company.news_snippet ? `详细动态：${company.news_snippet}` : ''}

请完成全面的政府招商评估报告，要求：
1. 数据要具体（使用具体数字、百分比、排名）
2. 分析要深入（每个判断有逻辑依据）
3. 与行业头部企业进行对比
4. 风险要量化（说明严重程度）
5. 建议要务实（明确优先级）`
      }
    ];
    
    const result = await callAI(messages, 'analyze_company') as GovernmentAssessment;
    return result;
  } catch (error) {
    console.error('AI government assessment failed, using local fallback:', error);
    return generateLocalGovernmentAssessment(requirementText, company);
  }
}

// 旧版兼容：简化分析（保留供其他地方使用）
export async function analyzeSingleCompanyForRequirement(
  requirementText: string,
  company: Company
): Promise<CompanyAnalysis> {
  try {
    const assessment = await analyzeCompanyForGovernment(requirementText, company);
    return convertAssessmentToAnalysis(assessment);
  } catch (error) {
    console.error('AI company analysis failed, using local fallback:', error);
    return generateLocalAnalysis(requirementText, company);
  }
}

// 将详细报告转换为简化分析格式
function convertAssessmentToAnalysis(assessment: GovernmentAssessment): CompanyAnalysis {
  const matchPoints = [
    assessment.companyProfile.summary,
    assessment.coreValue.industryValue.technology,
    assessment.coreValue.economicValue.estimatedOutput
  ].filter(Boolean);

  const risks = [
    assessment.riskAssessment.financialRisk.source,
    assessment.riskAssessment.businessRisk.source,
    assessment.riskAssessment.competitionRisk.source
  ].filter(Boolean);

  const recommendation = assessment.introductionStrategy.recommendIntroduce === '是' 
    ? '推荐' 
    : assessment.introductionStrategy.recommendIntroduce === '谨慎' 
      ? '谨慎推荐' 
      : '不推荐';

  return {
    matchPoints,
    risks,
    suitableVenue: assessment.introductionStrategy.recommendedForm,
    recommendation,
    recommendationReason: assessment.conclusion.recommendedAction
  };
}

// News item type
export interface AINewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishDate: string;
  category: string;
  content: string;
  relatedKeywords: string[];
  companyName?: string;
  industry?: string;
  fundingAmount?: string;
  investors?: string[];
  imageUrl?: string;
}

// Search news with AI
export async function searchNewsWithAI(): Promise<AINewsItem[]> {
  const today = new Date();
  const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const dateRange = `${oneWeekAgo.toISOString().split('T')[0]} 到 ${today.toISOString().split('T')[0]}`;
  
  try {
    const allNews: AINewsItem[] = [];
    
    for (let batch = 0; batch < 2; batch++) {
      const messages = [
        { role: 'system', content: NEWS_SEARCH_SYSTEM },
        { 
          role: 'user', 
          content: `推荐10条最近一周（${dateRange}）的投资融资或行业重要新闻（第${batch + 1}批），要求：
1. 标题必须包含具体公司名
2. 内容要完整详实，150-200字
3. 日期必须是最近7天内的真实日期
4. 来源要真实可信
5. 不要与第${batch === 0 ? '二' : '一'}批内容重复

请返回完整、真实的新闻信息！`
        }
      ];
      
      const result = await callAI(messages, 'search_news') as { news: AINewsItem[] };
      
      if (result.news && result.news.length > 0) {
        const batchNews = result.news.map((item, index) => ({
          ...item,
          id: `batch${batch}_${item.id || index}`
        }));
        allNews.push(...batchNews);
      }
    }
    
    return allNews;
  } catch (error) {
    console.error('AI news search failed:', error);
    throw error;
  }
}

// ============= Local fallback functions =============

function parseRequirementLocally(text: string): RequirementProfile {
  const regionKeywords: Record<string, string[]> = {
    '长三角': ['上海', '苏州', '杭州', '南京', '无锡', '合肥'],
    '珠三角': ['深圳', '广州', '东莞', '佛山'],
    '京津冀': ['北京', '天津', '雄安'],
  };

  const cities = ['上海', '北京', '深圳', '广州', '杭州', '苏州', '南京', '成都', '无锡', '合肥', '武汉', '西安'];
  const industries = ['AI', '人工智能', '医疗', '生物医药', '机器人', '智能制造', '芯片', '半导体', '新能源', '新材料', '储能'];
  const stages = ['天使轮', 'Pre-A轮', 'A轮', 'B轮', 'C轮', 'D轮', 'IPO'];

  const regions: string[] = [];
  const industryPrefs: string[] = [];
  const stagePrefs: string[] = [];

  for (const [region, relatedCities] of Object.entries(regionKeywords)) {
    if (text.includes(region)) regions.push(...relatedCities);
  }
  
  for (const city of cities) {
    if (text.includes(city) && !regions.includes(city)) regions.push(city);
  }

  for (const ind of industries) {
    if (text.toLowerCase().includes(ind.toLowerCase())) industryPrefs.push(ind);
  }

  for (const stage of stages) {
    if (text.includes(stage)) stagePrefs.push(stage);
  }

  let scenario = '创新园区';
  if (industryPrefs.some(i => ['机器人', '智能制造', '新能源'].includes(i))) {
    scenario = '产业园 / 制造工厂';
  } else if (industryPrefs.some(i => ['AI', '云计算', 'SaaS'].includes(i))) {
    scenario = '创新园区 / 总部办公';
  } else if (industryPrefs.some(i => ['医疗', '生物医药'].includes(i))) {
    scenario = '研发中心 / 实验室';
  }

  return {
    region_preference: [...new Set(regions)],
    industry_preference: [...new Set(industryPrefs)],
    stage_preference: [...new Set(stagePrefs)],
    time_window: '',
    extra_preferences: [],
    scenario
  };
}

function generateLocalGovernmentAssessment(requirementText: string, company: Company): GovernmentAssessment {
  const hasTopInvestor = company.investors.some(inv => 
    ['红杉', '高瓴', 'IDG', '经纬', '启明', '顺为', '腾讯', '阿里', '小米', '百度'].some(top => inv.includes(top))
  );
  const isEarlyStage = ['天使轮', 'Pre-A轮', '种子轮'].some(s => company.last_round.includes(s));
  const isGrowthStage = ['A轮', 'A+轮', 'B轮', 'B+轮'].some(s => company.last_round.includes(s));
  const isMatureStage = ['C轮', 'D轮', 'E轮', 'IPO', 'Pre-IPO'].some(s => company.last_round.includes(s));

  let recommendIntroduce: '是' | '谨慎' | '不建议' = '谨慎';
  let overallRating = 3;
  
  if (isEarlyStage && !hasTopInvestor) {
    recommendIntroduce = '不建议';
    overallRating = 2;
  } else if (isMatureStage && hasTopInvestor) {
    recommendIntroduce = '是';
    overallRating = 5;
  } else if (isGrowthStage) {
    recommendIntroduce = '是';
    overallRating = 4;
  }

  let recommendedForm = '区域中心';
  if (company.industry.some(i => ['智能制造', '机器人', '新能源', '新材料', '储能'].includes(i))) {
    recommendedForm = '制造基地 + 研发中心';
  } else if (company.industry.some(i => ['生物医药', '医疗健康'].includes(i))) {
    recommendedForm = '研发中心 + 实验室';
  } else if (company.industry.some(i => ['AI', '云计算', '大数据', 'SaaS'].includes(i))) {
    recommendedForm = '区域总部 / 研发中心';
  }

  return {
    companyOverview: {
      basicInfo: {
        establishedYear: company.register_year,
        registeredCapital: '【信息不足】',
        paidInCapital: '【信息不足】',
        shareholdingStructure: '【信息不足】',
        actualController: '【信息不足】',
        listingStatus: isEarlyStage ? '未上市，处于早期融资阶段' : isMatureStage ? '【信息不足】可能有上市计划' : '未上市',
        headquarters: `${company.city}，${company.province}`,
        mainOperatingLocations: [company.city]
      },
      coreBusiness: {
        mainBusiness: company.business_summary,
        coreProducts: company.tags.length > 0 ? company.tags : [`${company.track}相关产品`],
        industryPosition: hasTopInvestor ? `${company.track}领域新锐企业，获头部资本认可` : `${company.track}领域参与者`,
        mainCustomerTypes: ['【信息不足】']
      },
      financialStatus: {
        latestRevenue: '【信息不足】',
        revenueGrowthRate: '【信息不足】',
        profitability: isEarlyStage ? '预计尚未盈利' : '【信息不足】',
        overseasRevenueRatio: '【信息不足】',
        inventoryStatus: '【信息不足】',
        receivablesStatus: '【信息不足】',
        debtStatus: '【信息不足】'
      },
      investmentDemand: {
        landingDirection: '【信息不足】待企业明确',
        investmentScale: company.last_round_amount || '【信息不足】',
        fundUsage: ['【信息不足】'],
        coreDemandsFromGovernment: ['【信息不足】待企业明确政策诉求']
      }
    },
    industryBackground: {
      marketOverview: {
        globalMarketSize: `${company.track}行业全球市场规模【信息不足】`,
        chinaMarketSize: `${company.track}行业中国市场规模【信息不足】`,
        growthRate: '【信息不足】',
        marketTrend: `${company.track}行业整体呈发展态势`
      },
      technologyRoutes: [{
        name: company.track,
        characteristics: `${company.track}技术路线特点【信息不足】`,
        developmentStatus: '商业化阶段',
        representativeCompanies: company.investors.length > 0 ? [`${company.name}等`] : ['【信息不足】']
      }],
      industryChain: {
        upstream: { description: '【信息不足】', representativeCompanies: [] },
        midstream: { description: '【信息不足】', representativeCompanies: [] },
        downstream: { description: '【信息不足】', representativeCompanies: [] }
      },
      policyEnvironment: {
        nationalPolicy: '【信息不足】需查阅最新产业政策',
        localPolicy: '【信息不足】需查阅目标区域产业政策',
        policyTrend: '【信息不足】'
      }
    },
    companyProfile: {
      industryStage: company.industry.some(i => ['AI', '新能源', '半导体', '储能'].includes(i)) ? '快速成长期' : '成熟期',
      coreTechnology: `在${company.track}领域具备核心技术能力`,
      competitiveAdvantages: hasTopInvestor 
        ? ['获得头部投资机构背书', `${company.track}领域技术积累`, company.tags[0] || '差异化竞争优势']
        : [`${company.track}领域专注度`, '【信息不足】需进一步挖掘'],
      developmentStage: isEarlyStage ? '成长期' : isGrowthStage ? '扩张期' : '成熟期',
      summary: `${company.name}是一家专注于${company.track}领域的${company.growth_stage}企业，成立于${company.register_year}年，总部位于${company.city}。公司已完成${company.last_round}轮融资${company.last_round_amount ? `，金额${company.last_round_amount}` : ''}，${hasTopInvestor ? '获得头部投资机构背书' : '投资方阵容良好'}。${company.business_summary.slice(0, 150)}`
    },
    landingAssessment: {
      credibilityLevel: hasTopInvestor && !isEarlyStage ? '高可信' : isEarlyStage ? '存疑' : '中等可信',
      strategicAlignment: `企业当前处于${company.growth_stage}阶段，${isGrowthStage ? '有扩张需求，落地意愿较强' : '需评估实际扩张计划'}`,
      irreplaceability: hasTopInvestor ? '企业具备一定行业影响力，落地具有实质意义' : '需进一步确认落地内容的不可替代性，警惕"挂名总部"风险',
      inputOutputLogic: company.last_round_amount ? `已融资${company.last_round_amount}，有一定资金实力支撑落地投入` : '【信息不足】缺少融资金额数据，难以判断投入产出比',
      keyEvidence: [
        `已完成${company.last_round}轮融资`,
        hasTopInvestor ? '获得头部机构投资（红杉、高瓴等）' : '投资方背景一般',
        `企业处于${company.growth_stage}阶段`,
        `在${company.track}赛道有明确定位`
      ],
      landingChallenges: [
        '【信息不足】企业具体落地诉求不明确',
        '需评估企业在目标区域的真实布局意愿',
        isEarlyStage ? '早期企业资金实力有限，落地承诺兑现存疑' : '需关注后续投资计划'
      ]
    },
    industryMatch: {
      matchLevel: '匹配',
      dominantIndustryFit: `${company.track}与当前产业发展方向具有一定契合度，需结合具体区域产业规划评估`,
      chainEffect: `可为本地${company.industry[0] || company.track}产业链提供补链/强链作用`,
      clusterPotential: hasTopInvestor && isGrowthStage ? '具备形成产业集聚效应的潜力' : '示范效应有限，需持续观察',
      localRepresentativeCompanies: ['【信息不足】需补充本地同类企业信息'],
      synergyAnalysis: '【信息不足】需分析与本地企业的协同可能'
    },
    coreValue: {
      industryValue: {
        technology: `在${company.track}领域具备技术积累`,
        brand: hasTopInvestor ? '品牌效应较强，获头部资本背书' : '品牌效应一般，知名度有待提升',
        chainLeaderEffect: isMatureStage ? '具备一定链主效应潜力' : '链主效应有限'
      },
      economicValue: {
        estimatedTax: isGrowthStage ? '【信息不足】预计年税收贡献待测算' : '【信息不足】',
        estimatedOutput: isGrowthStage ? '【信息不足】预计年产值待测算' : '【信息不足】',
        estimatedEmployment: isGrowthStage ? '预计可带来50-200人就业（估算）' : '【信息不足】'
      },
      strategicValue: {
        demonstrationEffect: hasTopInvestor ? '具有示范效应，可提升区域产业能级' : '示范效应有限',
        externalCooperation: '【信息不足】需了解企业对外合作资源',
        regionalUpgrade: isMatureStage ? '可提升区域在该领域的影响力' : '对区域能级提升有限'
      }
    },
    riskAssessment: {
      financialRisk: {
        source: isEarlyStage ? '早期企业，盈利模式尚未验证，现金流压力较大' : '【信息不足】缺少详细财务数据',
        severity: isEarlyStage ? '高' : '中',
        specificIssues: [
          '【信息不足】无法获取详细财务报表',
          isEarlyStage ? '早期企业通常处于亏损状态' : '需补充营收、利润数据'
        ],
        localImpact: '如企业经营困难，可能导致项目停滞或撤离，政策资源浪费'
      },
      businessRisk: {
        source: isGrowthStage ? '快速扩张期，管理能力和业务可持续性需持续验证' : '业务模式相对稳定',
        severity: isGrowthStage ? '中' : '低',
        specificIssues: [
          '需关注客户集中度',
          '需评估业务可复制性',
          '【信息不足】业务结构数据缺失'
        ],
        localImpact: '如业务收缩，可能影响承诺的投资和就业指标'
      },
      competitionRisk: {
        source: `${company.track}赛道竞争激烈，需关注技术迭代和市场变化`,
        severity: '中',
        competitors: ['【信息不足】需补充主要竞争对手信息'],
        localImpact: '如丧失竞争优势，可能影响企业长期发展和在地投入意愿'
      },
      policyRisk: {
        source: '【信息不足】缺少海外业务和合规情况信息',
        severity: '低',
        specificIssues: [
          '需了解是否涉及出口管制',
          '需评估政策依赖度'
        ],
        localImpact: '如涉及政策变化，可能影响业务开展'
      },
      operationalRisk: {
        source: '【信息不足】缺少运营数据',
        severity: '低',
        specificIssues: ['需补充团队稳定性信息', '需了解供应链情况'],
        localImpact: '运营风险可能影响项目进度'
      }
    },
    introductionStrategy: {
      recommendIntroduce,
      recommendedForm,
      policyPriority: [
        { type: '空间载体', priority: 1, reason: '解决办公/研发/生产场地需求' },
        { type: '人才政策', priority: 2, reason: '支持核心团队引进和稳定' },
        { type: '场景资源', priority: 3, reason: '提供业务拓展机会' },
        { type: '产业基金', priority: 4, reason: '股权投资形式支持' },
        { type: '资金补贴', priority: 5, reason: '降低落地成本' }
      ],
      notRecommendedPolicy: [
        { type: '大额无条件现金补贴', reason: '无约束力，易导致资源浪费' },
        { type: '过度税收优惠', reason: '可能影响地方财政' }
      ],
      implementationPath: [
        '1. 深入尽调：补充财务、股权、落地诉求等关键信息',
        '2. 需求对接：明确企业核心诉求和政府可提供资源',
        '3. 条款谈判：锁定投资强度、经营指标、退出机制',
        '4. 协议签署：明确双方权责和考核节点',
        '5. 落地跟进：定期复盘，动态调整支持力度'
      ]
    },
    negotiationTerms: [
      { term: '投资强度', requirement: '明确约定固定资产投资额度和时间节点', rationale: '确保企业有实质性投入，非空壳落地' },
      { term: '实际经营指标', requirement: '约定年度营收、税收贡献等核心KPI', rationale: '量化考核，与政策兑现挂钩' },
      { term: '业务实质落地', requirement: '明确核心团队驻场人数、研发/生产在地化比例', rationale: '防止挂名总部，确保实质运营' },
      { term: '对赌条款', requirement: '设置分期兑现机制，与业绩指标挂钩', rationale: '降低政府风险，激励企业达标' },
      { term: '退出机制', requirement: '约定未达标情况下的政策追缴和退出条款', rationale: '明确违约责任，保护政府利益' }
    ],
    conclusion: {
      projectType: `${company.track}领域${isGrowthStage ? '成长型' : isMatureStage ? '成熟型' : '早期'}企业`,
      overallRating,
      ratingBreakdown: {
        industryProspect: company.industry.some(i => ['AI', '新能源', '半导体', '储能'].includes(i)) ? 4 : 3,
        companyStrength: hasTopInvestor ? 4 : 3,
        landingFeasibility: isEarlyStage ? 2 : 3,
        valueContribution: isGrowthStage ? 4 : 3,
        riskLevel: isEarlyStage ? 2 : 4
      },
      recommendedAction: recommendIntroduce === '是' 
        ? '建议积极对接，启动尽调并推进落地洽谈' 
        : recommendIntroduce === '谨慎' 
          ? '建议持续跟踪，补充关键信息后再议' 
          : '暂不建议投入资源，可保持观察',
      biggestOpportunity: hasTopInvestor 
        ? '头部资本背书，具备较好的成长潜力和示范效应' 
        : `在${company.track}领域有一定技术积累`,
      biggestRisk: isEarlyStage 
        ? '早期企业不确定性较大，落地承诺难以保障' 
        : '【信息不足】缺少详细财务和业务数据，风险评估不充分',
      keyDecisionFactors: [
        '企业落地诉求的真实性和可行性',
        '政策投入与预期产出的匹配度',
        '与区域产业规划的契合度',
        hasTopInvestor ? '头部资本背书带来的信用加持' : '投资方实力和持续支持能力'
      ],
      executiveSummary: `${company.name}是${company.track}领域${company.growth_stage}企业，已获${company.last_round}融资。${recommendIntroduce === '是' ? '综合评估符合引入条件，建议积极对接。' : recommendIntroduce === '谨慎' ? '建议补充关键信息后再评估。' : '当前条件下不建议引入。'}关键关注：${isEarlyStage ? '早期风险较大' : hasTopInvestor ? '头部资本背书' : '需深入尽调'}。`
    },
    insufficientInfo: [
      { field: '详细财务数据（营收、利润、现金流）', importance: '关键', suggestedSource: '企业财务报告/尽调' },
      { field: '股权结构及实际控制人信息', importance: '关键', suggestedSource: '工商信息/企业披露' },
      { field: '本次落地的具体诉求和投资规模', importance: '关键', suggestedSource: '企业路演材料/面谈' },
      { field: '海外业务占比和合规情况', importance: '重要', suggestedSource: '企业披露/行业调研' },
      { field: '主要客户类型和集中度', importance: '重要', suggestedSource: '企业披露/尽调' },
      { field: '本地同类企业竞争格局', importance: '参考', suggestedSource: '产业调研' }
    ]
  };
}

function generateLocalAnalysis(requirementText: string, company: Company): CompanyAnalysis {
  const matchPoints: string[] = [];
  const risks: string[] = [];

  if (company.growth_stage === '快速增长') {
    matchPoints.push('公司处于快速增长阶段，发展势头良好');
  }
  if (company.investors.some(inv => ['红杉', '高瓴', 'IDG', '经纬', '启明'].some(top => inv.includes(top)))) {
    matchPoints.push(`获得头部投资机构背书（${company.investors.slice(0, 2).join('、')}）`);
  }
  if (company.tags.length > 0) {
    matchPoints.push(`具备差异化优势：${company.tags.slice(0, 2).join('、')}`);
  }
  if (matchPoints.length === 0) {
    matchPoints.push(`在${company.track}赛道有明确定位`);
    matchPoints.push(`已完成${company.last_round}融资`);
  }

  if (company.growth_stage === '早期') {
    risks.push('公司处于早期阶段，商业模式尚未完全验证');
  } else if (company.last_round.includes('天使') || company.last_round.includes('Pre')) {
    risks.push('融资轮次较早，后续融资存在不确定性');
  }
  if (risks.length === 0) {
    risks.push('需关注行业竞争态势');
  }

  let suitableVenue = '创新园区';
  if (company.industry.some(i => ['智能制造', '机器人', '新能源'].includes(i))) {
    suitableVenue = '产业园区或智能制造基地';
  } else if (company.industry.some(i => ['生物医药', '医疗健康'].includes(i))) {
    suitableVenue = '生物医药产业园';
  } else if (company.industry.some(i => ['AI', '云计算', 'SaaS'].includes(i))) {
    suitableVenue = '科技创新园区';
  }

  const hasTopInvestor = company.investors.some(inv => 
    ['红杉', '高瓴', 'IDG'].some(top => inv.includes(top))
  );

  let recommendation: '推荐' | '谨慎推荐' | '不推荐' = '推荐';
  let recommendationReason = '';

  if (company.growth_stage === '快速增长' && hasTopInvestor) {
    recommendation = '推荐';
    recommendationReason = '发展势头良好，获头部资本认可';
  } else if (company.growth_stage === '早期') {
    recommendation = '谨慎推荐';
    recommendationReason = '早期阶段，建议持续跟踪';
  } else {
    recommendation = '推荐';
    recommendationReason = '综合评估符合招商需求';
  }

  return { matchPoints, risks, suitableVenue, recommendation, recommendationReason };
}
