import { Company, RequirementProfile, MatchedCompany, CompanyAnalysis } from '@/types/company';

// Placeholder for LLM API call - to be replaced with actual API integration
async function callLLM(prompt: string): Promise<string> {
  // TODO: Replace with actual LLM API call
  console.log('LLM Prompt:', prompt);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // This is a placeholder - in production, this would call the actual LLM API
  throw new Error('LLM API not configured');
}

// Prompt template for requirement analysis
const REQUIREMENT_ANALYSIS_PROMPT = `你是招商助手，请阅读用户的一段招商需求文本，提取出结构化筛选条件，并用 JSON 返回。

【用户需求】：
{{requirementText}}

请抽取：
- region_preference：地域/城市/区域关键词列表
- industry_preference：行业/赛道关键词列表
- stage_preference：融资轮次（如：天使轮、A轮、B轮等）
- time_window：如果提到最近几年/某个时间段，请解析为描述字符串
- extra_preferences：其它偏好（如是否有头部基金、是否已商业化、是否团队在扩张等）
- scenario：适配场景（如：产业园、总部办公、实验室、制造工厂等的推理）

以 JSON 格式输出，仅输出 JSON，不附加解释。`;

// Prompt template for company matching
const COMPANY_MATCHING_PROMPT = `你是招商匹配引擎，请根据"用户需求画像"和"候选企业列表"，为每家企业打一个0-100的匹配分数，并给出一行中文理由。

【用户需求画像】：
{{requirementProfile}}

【候选企业列表】（JSON数组，每条包含：name/city/industry/track/last_round/last_round_date/investors/business_summary等字段）：
{{candidateCompanies}}

请输出 JSON 数组，每个元素格式：
{
  "company_id": "...",
  "match_score": 0-100,
  "match_reason": "一句话说明为什么这家公司符合用户需求"
}

只输出 JSON，不要附加其他文字。`;

// Prompt template for single company analysis
const COMPANY_ANALYSIS_PROMPT = `你是招商顾问。根据【用户需求】与【公司信息】，用简短中文给出招商视角的分析。

【用户需求】：
{{requirementText}}

【公司信息】：
{{company}}

请回答：
1. 这家公司与用户需求的匹配点（2-3条）
2. 主要风险或不确定性（1-2条）
3. 适合什么样的园区或载体（写一句话）
4. 最终建议：推荐 / 谨慎推荐 / 不推荐（并用一句话说明原因）

用分点形式输出即可。`;

// Analyze requirement with AI
export async function analyzeRequirementWithAI(requirementText: string): Promise<RequirementProfile> {
  const prompt = REQUIREMENT_ANALYSIS_PROMPT.replace('{{requirementText}}', requirementText);
  
  try {
    const response = await callLLM(prompt);
    return JSON.parse(response);
  } catch (error) {
    // Fallback: Simple keyword-based parsing for demo purposes
    return parseRequirementLocally(requirementText);
  }
}

// Match companies with AI
export async function matchCompaniesWithAI(
  requirementProfile: RequirementProfile,
  companies: Company[]
): Promise<MatchedCompany[]> {
  // First, pre-filter companies based on basic criteria
  const candidateCompanies = preFilterCompanies(requirementProfile, companies);
  
  const prompt = COMPANY_MATCHING_PROMPT
    .replace('{{requirementProfile}}', JSON.stringify(requirementProfile, null, 2))
    .replace('{{candidateCompanies}}', JSON.stringify(candidateCompanies.map(c => ({
      id: c.id,
      name: c.name,
      city: c.city,
      province: c.province,
      industry: c.industry,
      track: c.track,
      last_round: c.last_round,
      last_round_date: c.last_round_date,
      investors: c.investors,
      business_summary: c.business_summary,
      growth_stage: c.growth_stage,
      tags: c.tags
    })), null, 2));
  
  try {
    const response = await callLLM(prompt);
    const matchResults = JSON.parse(response);
    
    return matchResults.map((result: { company_id: string; match_score: number; match_reason: string }) => ({
      ...result,
      company: companies.find(c => c.id === result.company_id)!
    })).sort((a: MatchedCompany, b: MatchedCompany) => b.match_score - a.match_score);
  } catch (error) {
    // Fallback: Local matching for demo purposes
    return matchCompaniesLocally(requirementProfile, candidateCompanies);
  }
}

// Analyze single company for requirement
export async function analyzeSingleCompanyForRequirement(
  requirementText: string,
  company: Company
): Promise<CompanyAnalysis> {
  const prompt = COMPANY_ANALYSIS_PROMPT
    .replace('{{requirementText}}', requirementText)
    .replace('{{company}}', JSON.stringify(company, null, 2));
  
  try {
    const response = await callLLM(prompt);
    return parseCompanyAnalysis(response);
  } catch (error) {
    // Fallback: Generate local analysis for demo
    return generateLocalAnalysis(requirementText, company);
  }
}

// Local fallback functions for demo purposes

function parseRequirementLocally(text: string): RequirementProfile {
  const regionKeywords: Record<string, string[]> = {
    '长三角': ['上海', '苏州', '杭州', '南京', '无锡', '合肥'],
    '珠三角': ['深圳', '广州', '东莞', '佛山'],
    '京津冀': ['北京', '天津', '雄安'],
    '成渝': ['成都', '重庆'],
    '华东': ['上海', '苏州', '杭州', '南京', '无锡', '合肥'],
    '华南': ['深圳', '广州', '东莞', '佛山'],
    '华北': ['北京', '天津'],
    '西南': ['成都', '重庆', '昆明'],
  };

  const cities = ['上海', '北京', '深圳', '广州', '杭州', '苏州', '南京', '成都', '无锡', '合肥', '武汉', '西安'];
  const industries = ['AI', '人工智能', '医疗', '医疗健康', '生物医药', '机器人', '智能制造', '芯片', '半导体', '新能源', '新材料', '自动驾驶', '物流', 'SaaS', '云计算', '大数据', '量子', '脑机接口', '基因'];
  const stages = ['天使轮', 'Pre-A轮', 'A轮', 'A+轮', 'B轮', 'B+轮', 'C轮', 'C+轮', 'D轮', 'IPO'];
  const extraKeywords = ['头部基金', '头部投资', '扩张', '增长', '商业化', '量产', '出口', '头部客户'];
  const scenarios = ['创新园区', '产业园', '总部办公', '实验室', '研发中心', '制造工厂', '孵化器', '加速器'];

  const regions: string[] = [];
  const industryPrefs: string[] = [];
  const stagePrefs: string[] = [];
  const extraPrefs: string[] = [];
  let scenario = '';
  let timeWindow = '';

  // Check for region keywords
  for (const [region, relatedCities] of Object.entries(regionKeywords)) {
    if (text.includes(region)) {
      regions.push(...relatedCities);
    }
  }
  
  // Check for specific cities
  for (const city of cities) {
    if (text.includes(city) && !regions.includes(city)) {
      regions.push(city);
    }
  }

  // Check for industries
  for (const ind of industries) {
    if (text.toLowerCase().includes(ind.toLowerCase())) {
      industryPrefs.push(ind);
    }
  }

  // Check for stages
  for (const stage of stages) {
    if (text.includes(stage)) {
      stagePrefs.push(stage);
    }
  }
  
  // Check for A/B轮 pattern
  if (text.includes('A/B轮') || text.includes('AB轮')) {
    if (!stagePrefs.includes('A轮')) stagePrefs.push('A轮');
    if (!stagePrefs.includes('A+轮')) stagePrefs.push('A+轮');
    if (!stagePrefs.includes('B轮')) stagePrefs.push('B轮');
  }

  // Check for extra preferences
  for (const extra of extraKeywords) {
    if (text.includes(extra)) {
      extraPrefs.push(extra);
    }
  }

  // Check for scenarios
  for (const sc of scenarios) {
    if (text.includes(sc)) {
      scenario = sc;
      break;
    }
  }
  
  // Default scenario inference
  if (!scenario) {
    if (industryPrefs.some(i => ['机器人', '智能制造', '新能源', '新材料'].includes(i))) {
      scenario = '产业园 / 制造工厂';
    } else if (industryPrefs.some(i => ['AI', '人工智能', 'SaaS', '云计算', '大数据'].includes(i))) {
      scenario = '创新园区 / 总部办公';
    } else if (industryPrefs.some(i => ['医疗', '生物医药', '基因'].includes(i))) {
      scenario = '研发中心 / 实验室';
    } else {
      scenario = '创新园区';
    }
  }

  // Parse time window
  const timePatterns = [
    /过去(\d+)年/,
    /最近(\d+)年/,
    /(\d{4})年以后/,
    /(\d{4})年之后/,
    /(\d{4})年至今/,
  ];
  
  for (const pattern of timePatterns) {
    const match = text.match(pattern);
    if (match) {
      if (pattern.source.includes('过去') || pattern.source.includes('最近')) {
        timeWindow = `近${match[1]}年内`;
      } else {
        timeWindow = `${match[1]}年以后`;
      }
      break;
    }
  }

  return {
    region_preference: [...new Set(regions)],
    industry_preference: [...new Set(industryPrefs)],
    stage_preference: [...new Set(stagePrefs)],
    time_window: timeWindow,
    extra_preferences: [...new Set(extraPrefs)],
    scenario
  };
}

function preFilterCompanies(profile: RequirementProfile, companies: Company[]): Company[] {
  return companies.filter(company => {
    // If no specific preferences, include all
    if (profile.region_preference.length === 0 && 
        profile.industry_preference.length === 0 && 
        profile.stage_preference.length === 0) {
      return true;
    }

    let score = 0;
    let maxScore = 0;

    // Region matching
    if (profile.region_preference.length > 0) {
      maxScore += 1;
      if (profile.region_preference.some(r => 
        company.city.includes(r) || company.province.includes(r) || r.includes(company.city)
      )) {
        score += 1;
      }
    }

    // Industry matching
    if (profile.industry_preference.length > 0) {
      maxScore += 1;
      if (profile.industry_preference.some(ind => 
        company.industry.some(i => i.toLowerCase().includes(ind.toLowerCase()) || ind.toLowerCase().includes(i.toLowerCase())) ||
        company.track.toLowerCase().includes(ind.toLowerCase())
      )) {
        score += 1;
      }
    }

    // Stage matching
    if (profile.stage_preference.length > 0) {
      maxScore += 1;
      if (profile.stage_preference.some(stage => 
        company.last_round.includes(stage.replace('轮', '')) || stage.includes(company.last_round.replace('轮', ''))
      )) {
        score += 1;
      }
    }

    // Include if matches at least one criterion or if it's close enough
    return maxScore === 0 || score >= Math.max(1, maxScore * 0.3);
  });
}

function matchCompaniesLocally(profile: RequirementProfile, companies: Company[]): MatchedCompany[] {
  return companies.map(company => {
    let score = 0;
    const reasons: string[] = [];

    // Region matching (30 points)
    if (profile.region_preference.length > 0) {
      const regionMatch = profile.region_preference.some(r => 
        company.city.includes(r) || company.province.includes(r) || r.includes(company.city)
      );
      if (regionMatch) {
        score += 30;
        reasons.push(`地域匹配（${company.city}）`);
      }
    } else {
      score += 15; // Neutral if no preference
    }

    // Industry matching (30 points)
    if (profile.industry_preference.length > 0) {
      const industryMatch = profile.industry_preference.filter(ind => 
        company.industry.some(i => i.toLowerCase().includes(ind.toLowerCase()) || ind.toLowerCase().includes(i.toLowerCase())) ||
        company.track.toLowerCase().includes(ind.toLowerCase())
      );
      if (industryMatch.length > 0) {
        score += Math.min(30, industryMatch.length * 15);
        reasons.push(`赛道匹配（${company.track}）`);
      }
    } else {
      score += 15;
    }

    // Stage matching (20 points)
    if (profile.stage_preference.length > 0) {
      const stageMatch = profile.stage_preference.some(stage => 
        company.last_round.includes(stage.replace('轮', '')) || stage.includes(company.last_round.replace('轮', ''))
      );
      if (stageMatch) {
        score += 20;
        reasons.push(`融资阶段符合（${company.last_round}）`);
      }
    } else {
      score += 10;
    }

    // Extra preferences (20 points)
    if (profile.extra_preferences.length > 0) {
      let extraScore = 0;
      if (profile.extra_preferences.some(p => p.includes('头部') || p.includes('投资'))) {
        const hasTopInvestor = company.investors.some(inv => 
          ['红杉', '高瓴', 'IDG', '经纬', '启明', '顺为', '真格', '北极光', '深创投', '腾讯', '阿里'].some(top => inv.includes(top))
        );
        if (hasTopInvestor) {
          extraScore += 10;
          reasons.push(`头部基金背书`);
        }
      }
      if (profile.extra_preferences.some(p => p.includes('扩张') || p.includes('增长'))) {
        if (company.growth_stage === '快速增长') {
          extraScore += 10;
          reasons.push(`处于快速增长期`);
        }
      }
      score += extraScore;
    } else {
      score += 10;
    }

    // Time window bonus
    if (profile.time_window) {
      const roundYear = new Date(company.last_round_date).getFullYear();
      if (roundYear >= 2023) {
        score += 5;
      }
    }

    // Normalize score
    score = Math.min(100, Math.max(0, score));

    return {
      company_id: company.id,
      match_score: score,
      match_reason: reasons.length > 0 ? reasons.join('；') : '基本符合招商需求',
      company
    };
  }).sort((a, b) => b.match_score - a.match_score);
}

function parseCompanyAnalysis(_response: string): CompanyAnalysis {
  // This would parse the LLM response in production
  return {
    matchPoints: [],
    risks: [],
    suitableVenue: '',
    recommendation: '推荐',
    recommendationReason: ''
  };
}

function generateLocalAnalysis(requirementText: string, company: Company): CompanyAnalysis {
  const matchPoints: string[] = [];
  const risks: string[] = [];

  // Generate match points based on company attributes
  if (company.growth_stage === '快速增长') {
    matchPoints.push('公司处于快速增长阶段，发展势头良好');
  }
  if (company.investors.some(inv => ['红杉', '高瓴', 'IDG', '经纬', '启明', '顺为', '腾讯', '阿里', '小米'].some(top => inv.includes(top)))) {
    matchPoints.push(`获得头部投资机构背书（${company.investors.slice(0, 2).join('、')}）`);
  }
  if (company.tags.length > 0) {
    matchPoints.push(`具备差异化优势：${company.tags.slice(0, 2).join('、')}`);
  }
  if (matchPoints.length === 0) {
    matchPoints.push(`在${company.track}赛道有明确定位`);
    matchPoints.push(`已完成${company.last_round}融资，具备一定资金实力`);
  }

  // Generate risks based on company stage
  if (company.growth_stage === '早期') {
    risks.push('公司处于早期阶段，商业模式尚未完全验证');
  } else if (company.last_round.includes('天使') || company.last_round.includes('Pre')) {
    risks.push('融资轮次较早，后续融资存在不确定性');
  }
  if (company.tags.some(t => t.includes('临床') || t.includes('试验'))) {
    risks.push('产品处于研发/试验阶段，商业化周期较长');
  }
  if (risks.length === 0) {
    risks.push('需关注行业竞争态势及市场变化');
  }

  // Determine suitable venue
  let suitableVenue = '';
  if (company.industry.some(i => ['智能制造', '机器人', '新能源', '新材料'].includes(i))) {
    suitableVenue = '适合入驻产业园区或智能制造基地，需考虑生产厂房需求';
  } else if (company.industry.some(i => ['生物医药', '医疗健康', '基因'].includes(i))) {
    suitableVenue = '适合入驻生物医药产业园或研发型载体，需配套实验室设施';
  } else if (company.industry.some(i => ['AI', '云计算', '大数据', 'SaaS'].includes(i))) {
    suitableVenue = '适合入驻科技创新园区或甲级写字楼，侧重办公研发空间';
  } else {
    suitableVenue = '建议根据企业实际业务需求匹配合适的产业载体';
  }

  // Determine recommendation
  let recommendation: '推荐' | '谨慎推荐' | '不推荐' = '推荐';
  let recommendationReason = '';

  const hasTopInvestor = company.investors.some(inv => 
    ['红杉', '高瓴', 'IDG', '经纬', '启明', '顺为', '腾讯', '阿里'].some(top => inv.includes(top))
  );

  if (company.growth_stage === '快速增长' && hasTopInvestor) {
    recommendation = '推荐';
    recommendationReason = '公司发展势头良好，获头部资本认可，是优质招商目标';
  } else if (company.growth_stage === '成熟期') {
    recommendation = '推荐';
    recommendationReason = '公司已进入成熟期，业务稳定，适合作为园区标杆企业引进';
  } else if (company.growth_stage === '早期') {
    recommendation = '谨慎推荐';
    recommendationReason = '公司处于早期阶段，建议持续跟踪发展情况后再做决策';
  } else {
    recommendation = '推荐';
    recommendationReason = '综合评估符合招商需求，建议进一步对接洽谈';
  }

  return {
    matchPoints,
    risks,
    suitableVenue,
    recommendation,
    recommendationReason
  };
}
