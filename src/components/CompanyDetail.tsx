import { useState, useEffect } from 'react';
import { Company, GovernmentAssessment } from '@/types/company';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Calendar, 
  Users, 
  CheckCircle, 
  AlertTriangle,
  Building,
  Target,
  TrendingUp,
  Shield,
  FileText,
  Star,
  Loader2,
  X,
  AlertCircle,
  Briefcase,
  Scale,
  Handshake,
  Info,
  BarChart3,
  Globe,
  Factory,
  Coins,
  CircleDollarSign
} from 'lucide-react';
import { analyzeCompanyForGovernment } from '@/utils/ai';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CompanyDetailProps {
  company: Company;
  requirementText: string;
  onClose: () => void;
}

export function CompanyDetail({ company, requirementText, onClose }: CompanyDetailProps) {
  const [assessment, setAssessment] = useState<GovernmentAssessment | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setIsAnalyzing(true);
      try {
        const result = await analyzeCompanyForGovernment(requirementText, company);
        setAssessment(result);
      } catch (error) {
        console.error('Failed to analyze company:', error);
      } finally {
        setIsAnalyzing(false);
      }
    };
    fetchAnalysis();
  }, [company.id, requirementText]);

  const getCredibilityStyle = (level: string) => {
    switch (level) {
      case '高可信': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case '中等可信': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case '存疑': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getMatchLevelStyle = (level: string) => {
    switch (level) {
      case '高度匹配': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case '匹配': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case '一般': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case '不匹配': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getRecommendStyle = (rec: string) => {
    switch (rec) {
      case '是': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case '谨慎': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case '不建议': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case '高': return 'text-red-600 dark:text-red-400';
      case '中': return 'text-amber-600 dark:text-amber-400';
      case '低': return 'text-green-600 dark:text-green-400';
      default: return 'text-muted-foreground';
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-4 w-4",
            star <= rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"
          )}
        />
      ))}
    </div>
  );

  const renderMiniStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-3 w-3",
            star <= rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"
          )}
        />
      ))}
    </div>
  );

  return (
    <Card className="bg-card border-border animate-in slide-in-from-bottom-4 duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-3">
              {company.name}
              <Badge variant="secondary">{company.last_round}</Badge>
            </CardTitle>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{company.city}，{company.province}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>成立于 {company.register_year} 年</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Industry Tags */}
        <div className="flex flex-wrap gap-2">
          {company.industry.map((ind, index) => (
            <Badge key={index} variant="secondary">{ind}</Badge>
          ))}
          <Badge variant="outline" className="text-primary border-primary/30">{company.track}</Badge>
          {company.tags.map((tag, index) => (
            <Badge key={`tag-${index}`} variant="outline">{tag}</Badge>
          ))}
        </div>

        {/* Basic Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">融资轮次</div>
            <div className="font-semibold">{company.last_round}</div>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">融资时间</div>
            <div className="font-semibold">{company.last_round_date}</div>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">融资金额</div>
            <div className="font-semibold text-primary">{company.last_round_amount || '未披露'}</div>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">发展阶段</div>
            <div className="font-semibold">{company.growth_stage}</div>
          </div>
        </div>

        {/* Investors */}
        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            投资方
          </h4>
          <div className="flex flex-wrap gap-2">
            {company.investors.map((investor, index) => (
              <Badge key={index} variant="outline" className="font-normal">{investor}</Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Government Assessment Report */}
        <div>
          <h4 className="font-medium mb-4 flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            政府招商评估报告
          </h4>
          
          {isAnalyzing ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-3" />
              <span>正在生成详细评估报告...</span>
            </div>
          ) : assessment ? (
            <ScrollArea className="h-auto max-h-[700px]">
              <div className="space-y-5 pr-4">
                
                {/* 模块一：企业简介 */}
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                  <h5 className="font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    一、企业简介
                  </h5>
                  <div className="space-y-4 text-sm">
                    {/* 基本信息 */}
                    <div>
                      <div className="text-xs text-muted-foreground mb-2 font-medium">1. 基本信息</div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        <div className="bg-white/50 dark:bg-white/5 rounded p-2">
                          <span className="text-muted-foreground text-xs">成立时间：</span>
                          <span className="font-medium">{assessment.companyOverview.basicInfo.establishedYear}年</span>
                        </div>
                        <div className="bg-white/50 dark:bg-white/5 rounded p-2">
                          <span className="text-muted-foreground text-xs">注册资本：</span>
                          <span className="font-medium">{assessment.companyOverview.basicInfo.registeredCapital}</span>
                        </div>
                        <div className="bg-white/50 dark:bg-white/5 rounded p-2">
                          <span className="text-muted-foreground text-xs">实缴资本：</span>
                          <span className="font-medium">{assessment.companyOverview.basicInfo.paidInCapital}</span>
                        </div>
                        <div className="bg-white/50 dark:bg-white/5 rounded p-2 col-span-2 md:col-span-1">
                          <span className="text-muted-foreground text-xs">上市进展：</span>
                          <span className="font-medium">{assessment.companyOverview.basicInfo.listingStatus}</span>
                        </div>
                        <div className="bg-white/50 dark:bg-white/5 rounded p-2 col-span-2">
                          <span className="text-muted-foreground text-xs">总部：</span>
                          <span className="font-medium">{assessment.companyOverview.basicInfo.headquarters}</span>
                        </div>
                      </div>
                    </div>
                    {/* 核心业务 */}
                    <div>
                      <div className="text-xs text-muted-foreground mb-2 font-medium">2. 核心业务</div>
                      <p className="text-muted-foreground mb-2">{assessment.companyOverview.coreBusiness.mainBusiness}</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {assessment.companyOverview.coreBusiness.coreProducts.map((p, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{p}</Badge>
                        ))}
                      </div>
                      <p className="text-xs"><span className="text-muted-foreground">行业地位：</span>{assessment.companyOverview.coreBusiness.industryPosition}</p>
                    </div>
                    {/* 财务状况 */}
                    <div>
                      <div className="text-xs text-muted-foreground mb-2 font-medium">3. 财务状况</div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div className="text-xs"><span className="text-muted-foreground">营收：</span>{assessment.companyOverview.financialStatus.latestRevenue}</div>
                        <div className="text-xs"><span className="text-muted-foreground">增速：</span>{assessment.companyOverview.financialStatus.revenueGrowthRate}</div>
                        <div className="text-xs"><span className="text-muted-foreground">盈利：</span>{assessment.companyOverview.financialStatus.profitability}</div>
                        <div className="text-xs"><span className="text-muted-foreground">海外占比：</span>{assessment.companyOverview.financialStatus.overseasRevenueRatio}</div>
                      </div>
                    </div>
                    {/* 投资诉求 */}
                    <div>
                      <div className="text-xs text-muted-foreground mb-2 font-medium">4. 本次落地诉求</div>
                      <p className="text-xs mb-1"><span className="text-muted-foreground">落地方向：</span>{assessment.companyOverview.investmentDemand.landingDirection}</p>
                      <p className="text-xs mb-1"><span className="text-muted-foreground">投资规模：</span>{assessment.companyOverview.investmentDemand.investmentScale}</p>
                      <div className="flex flex-wrap gap-1">
                        {assessment.companyOverview.investmentDemand.coreDemandsFromGovernment.map((d, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{d}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 模块二：行业背景分析 */}
                <div className="bg-indigo-50 dark:bg-indigo-950/20 rounded-lg p-4">
                  <h5 className="font-semibold text-indigo-800 dark:text-indigo-400 mb-3 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    二、行业背景分析
                  </h5>
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div className="bg-white/50 dark:bg-white/5 rounded p-2">
                        <div className="text-xs text-muted-foreground">全球市场</div>
                        <div className="font-medium text-xs">{assessment.industryBackground.marketOverview.globalMarketSize}</div>
                      </div>
                      <div className="bg-white/50 dark:bg-white/5 rounded p-2">
                        <div className="text-xs text-muted-foreground">中国市场</div>
                        <div className="font-medium text-xs">{assessment.industryBackground.marketOverview.chinaMarketSize}</div>
                      </div>
                      <div className="bg-white/50 dark:bg-white/5 rounded p-2">
                        <div className="text-xs text-muted-foreground">增长率</div>
                        <div className="font-medium text-xs">{assessment.industryBackground.marketOverview.growthRate}</div>
                      </div>
                      <div className="bg-white/50 dark:bg-white/5 rounded p-2">
                        <div className="text-xs text-muted-foreground">市场趋势</div>
                        <div className="font-medium text-xs">{assessment.industryBackground.marketOverview.marketTrend}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">政策环境：</div>
                      <p className="text-xs">{assessment.industryBackground.policyEnvironment.nationalPolicy}</p>
                    </div>
                  </div>
                </div>

                {/* 模块三：企业综合画像 */}
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
                  <h5 className="font-semibold text-blue-800 dark:text-blue-400 mb-3 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    三、企业综合画像
                  </h5>
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div className="bg-white/50 dark:bg-white/5 rounded p-2">
                        <span className="text-muted-foreground text-xs">行业阶段：</span>
                        <span className="font-medium">{assessment.companyProfile.industryStage}</span>
                      </div>
                      <div className="bg-white/50 dark:bg-white/5 rounded p-2">
                        <span className="text-muted-foreground text-xs">发展阶段：</span>
                        <span className="font-medium">{assessment.companyProfile.developmentStage}</span>
                      </div>
                      <div className="bg-white/50 dark:bg-white/5 rounded p-2">
                        <span className="text-muted-foreground text-xs">核心竞争点：</span>
                        <span className="font-medium">{assessment.companyProfile.coreTechnology}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">竞争优势：</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {assessment.companyProfile.competitiveAdvantages.map((adv, i) => (
                          <Badge key={i} variant="outline" className="text-xs bg-blue-100/50 dark:bg-blue-900/20">{adv}</Badge>
                        ))}
                      </div>
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed">{assessment.companyProfile.summary}</p>
                  </div>
                </div>

                {/* 模块四：项目真实性与落地判断 */}
                <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-4">
                  <h5 className="font-semibold text-purple-800 dark:text-purple-400 mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    四、项目真实性与落地判断
                  </h5>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs">可信度判断：</span>
                      <Badge className={getCredibilityStyle(assessment.landingAssessment.credibilityLevel)}>
                        {assessment.landingAssessment.credibilityLevel}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-xs">
                      <p><span className="text-muted-foreground">战略一致性：</span>{assessment.landingAssessment.strategicAlignment}</p>
                      <p><span className="text-muted-foreground">不可替代性：</span>{assessment.landingAssessment.irreplaceability}</p>
                      <p><span className="text-muted-foreground">投入产出逻辑：</span>{assessment.landingAssessment.inputOutputLogic}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">关键判断依据：</span>
                      <ul className="mt-1 space-y-0.5">
                        {assessment.landingAssessment.keyEvidence.map((e, idx) => (
                          <li key={idx} className="flex items-start gap-1 text-xs">
                            <span className="text-purple-500">•</span>{e}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {assessment.landingAssessment.landingChallenges.length > 0 && (
                      <div>
                        <span className="text-xs text-muted-foreground">落地挑战：</span>
                        <ul className="mt-1 space-y-0.5">
                          {assessment.landingAssessment.landingChallenges.map((c, idx) => (
                            <li key={idx} className="flex items-start gap-1 text-xs text-amber-700 dark:text-amber-400">
                              <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />{c}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* 模块五：产业匹配度评估 */}
                <div className="bg-cyan-50 dark:bg-cyan-950/20 rounded-lg p-4">
                  <h5 className="font-semibold text-cyan-800 dark:text-cyan-400 mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    五、与地方产业匹配度评估
                  </h5>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs">总体匹配度：</span>
                      <Badge className={getMatchLevelStyle(assessment.industryMatch.matchLevel)}>
                        {assessment.industryMatch.matchLevel}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-xs">
                      <p><span className="text-muted-foreground">主导产业契合度：</span>{assessment.industryMatch.dominantIndustryFit}</p>
                      <p><span className="text-muted-foreground">产业链作用：</span>{assessment.industryMatch.chainEffect}</p>
                      <p><span className="text-muted-foreground">集聚效应潜力：</span>{assessment.industryMatch.clusterPotential}</p>
                      <p><span className="text-muted-foreground">与本地企业协同：</span>{assessment.industryMatch.synergyAnalysis}</p>
                    </div>
                    {assessment.industryMatch.localRepresentativeCompanies.length > 0 && (
                      <div>
                        <span className="text-xs text-muted-foreground">本地同类企业：</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {assessment.industryMatch.localRepresentativeCompanies.map((c, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{c}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 模块六：核心价值 */}
                <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
                  <h5 className="font-semibold text-green-800 dark:text-green-400 mb-3 flex items-center gap-2">
                    <Coins className="h-4 w-4" />
                    六、可为地方带来的核心价值
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="bg-white/50 dark:bg-white/5 rounded p-3">
                      <div className="font-medium text-green-700 dark:text-green-300 mb-2">产业价值</div>
                      <p><span className="text-muted-foreground">技术：</span>{assessment.coreValue.industryValue.technology}</p>
                      <p><span className="text-muted-foreground">品牌：</span>{assessment.coreValue.industryValue.brand}</p>
                      <p><span className="text-muted-foreground">链主效应：</span>{assessment.coreValue.industryValue.chainLeaderEffect}</p>
                    </div>
                    <div className="bg-white/50 dark:bg-white/5 rounded p-3">
                      <div className="font-medium text-green-700 dark:text-green-300 mb-2">经济价值</div>
                      <p><span className="text-muted-foreground">税收：</span>{assessment.coreValue.economicValue.estimatedTax}</p>
                      <p><span className="text-muted-foreground">产值：</span>{assessment.coreValue.economicValue.estimatedOutput}</p>
                      <p><span className="text-muted-foreground">就业：</span>{assessment.coreValue.economicValue.estimatedEmployment}</p>
                    </div>
                    <div className="bg-white/50 dark:bg-white/5 rounded p-3">
                      <div className="font-medium text-green-700 dark:text-green-300 mb-2">战略价值</div>
                      <p><span className="text-muted-foreground">示范效应：</span>{assessment.coreValue.strategicValue.demonstrationEffect}</p>
                      <p><span className="text-muted-foreground">对外合作：</span>{assessment.coreValue.strategicValue.externalCooperation}</p>
                      <p><span className="text-muted-foreground">区域能级：</span>{assessment.coreValue.strategicValue.regionalUpgrade}</p>
                    </div>
                  </div>
                </div>

                {/* 模块七：风险识别 */}
                <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4">
                  <h5 className="font-semibold text-amber-800 dark:text-amber-400 mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    七、主要风险识别
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {/* 财务风险 */}
                    <div className="bg-white/50 dark:bg-white/5 rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-amber-700 dark:text-amber-300">财务与资金风险</span>
                        <Badge variant="outline" className={getSeverityStyle(assessment.riskAssessment.financialRisk.severity)}>
                          {assessment.riskAssessment.financialRisk.severity}风险
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-1">{assessment.riskAssessment.financialRisk.source}</p>
                      <ul className="space-y-0.5 mb-1">
                        {assessment.riskAssessment.financialRisk.specificIssues.map((issue, i) => (
                          <li key={i} className="flex items-start gap-1"><span>•</span>{issue}</li>
                        ))}
                      </ul>
                      <p className="text-amber-600 dark:text-amber-400">影响：{assessment.riskAssessment.financialRisk.localImpact}</p>
                    </div>
                    {/* 业务风险 */}
                    <div className="bg-white/50 dark:bg-white/5 rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-amber-700 dark:text-amber-300">业务可持续性风险</span>
                        <Badge variant="outline" className={getSeverityStyle(assessment.riskAssessment.businessRisk.severity)}>
                          {assessment.riskAssessment.businessRisk.severity}风险
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-1">{assessment.riskAssessment.businessRisk.source}</p>
                      <ul className="space-y-0.5 mb-1">
                        {assessment.riskAssessment.businessRisk.specificIssues.map((issue, i) => (
                          <li key={i} className="flex items-start gap-1"><span>•</span>{issue}</li>
                        ))}
                      </ul>
                      <p className="text-amber-600 dark:text-amber-400">影响：{assessment.riskAssessment.businessRisk.localImpact}</p>
                    </div>
                    {/* 竞争风险 */}
                    <div className="bg-white/50 dark:bg-white/5 rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-amber-700 dark:text-amber-300">竞争与技术风险</span>
                        <Badge variant="outline" className={getSeverityStyle(assessment.riskAssessment.competitionRisk.severity)}>
                          {assessment.riskAssessment.competitionRisk.severity}风险
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-1">{assessment.riskAssessment.competitionRisk.source}</p>
                      {assessment.riskAssessment.competitionRisk.competitors.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-1">
                          {assessment.riskAssessment.competitionRisk.competitors.map((c, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{c}</Badge>
                          ))}
                        </div>
                      )}
                      <p className="text-amber-600 dark:text-amber-400">影响：{assessment.riskAssessment.competitionRisk.localImpact}</p>
                    </div>
                    {/* 政策风险 */}
                    <div className="bg-white/50 dark:bg-white/5 rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-amber-700 dark:text-amber-300">政策与合规风险</span>
                        <Badge variant="outline" className={getSeverityStyle(assessment.riskAssessment.policyRisk.severity)}>
                          {assessment.riskAssessment.policyRisk.severity}风险
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-1">{assessment.riskAssessment.policyRisk.source}</p>
                      <ul className="space-y-0.5 mb-1">
                        {assessment.riskAssessment.policyRisk.specificIssues.map((issue, i) => (
                          <li key={i} className="flex items-start gap-1"><span>•</span>{issue}</li>
                        ))}
                      </ul>
                      <p className="text-amber-600 dark:text-amber-400">影响：{assessment.riskAssessment.policyRisk.localImpact}</p>
                    </div>
                  </div>
                </div>

                {/* 模块八：引入策略建议 */}
                <div className="bg-violet-50 dark:bg-violet-950/20 rounded-lg p-4">
                  <h5 className="font-semibold text-violet-800 dark:text-violet-400 mb-3 flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    八、政府引入策略建议
                  </h5>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs">是否建议引入：</span>
                        <Badge className={getRecommendStyle(assessment.introductionStrategy.recommendIntroduce)}>
                          {assessment.introductionStrategy.recommendIntroduce}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs">建议形式：</span>
                        <span className="font-medium text-xs">{assessment.introductionStrategy.recommendedForm}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">政策支持优先级：</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {assessment.introductionStrategy.policyPriority.map((p, idx) => (
                          <div key={idx} className="bg-white/50 dark:bg-white/5 rounded px-2 py-1 text-xs">
                            <span className="font-medium text-violet-600 dark:text-violet-400">{p.priority}.</span> {p.type}
                            <span className="text-muted-foreground ml-1">({p.reason})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">不建议给予的政策：</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {assessment.introductionStrategy.notRecommendedPolicy.map((p, idx) => (
                          <Badge key={idx} variant="destructive" className="text-xs">
                            {p.type}：{p.reason}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">实施路径：</span>
                      <ol className="mt-1 space-y-0.5 text-xs">
                        {assessment.introductionStrategy.implementationPath.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>

                {/* 模块九：谈判条款建议 */}
                <div className="bg-slate-100 dark:bg-slate-900/50 rounded-lg p-4">
                  <h5 className="font-semibold text-slate-800 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <Handshake className="h-4 w-4" />
                    九、招商谈判关键条款建议
                  </h5>
                  <div className="space-y-2">
                    {assessment.negotiationTerms.map((item, idx) => (
                      <div key={idx} className="bg-white/50 dark:bg-white/5 rounded p-2 text-xs">
                        <div className="font-medium text-slate-700 dark:text-slate-300 mb-1">
                          {idx + 1}. {item.term}
                        </div>
                        <p className="text-muted-foreground mb-1">要求：{item.requirement}</p>
                        <p className="text-slate-500 dark:text-slate-400 italic">理由：{item.rationale}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 模块十：综合结论 */}
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/20">
                  <h5 className="font-semibold text-primary mb-3 flex items-center gap-2">
                    <Scale className="h-4 w-4" />
                    十、综合结论（一页纸给领导）
                  </h5>
                  <div className="space-y-3">
                    {/* 评分 */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground text-xs block">项目类型</span>
                        <span className="font-medium">{assessment.conclusion.projectType}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs block">综合评分</span>
                        {renderStars(assessment.conclusion.overallRating)}
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <span className="text-muted-foreground text-xs block">推荐动作</span>
                        <span className="font-medium text-primary text-sm">{assessment.conclusion.recommendedAction}</span>
                      </div>
                    </div>
                    {/* 分项评分 */}
                    <div className="grid grid-cols-5 gap-2 text-xs">
                      <div className="text-center">
                        <div className="text-muted-foreground mb-1">行业前景</div>
                        {renderMiniStars(assessment.conclusion.ratingBreakdown.industryProspect)}
                      </div>
                      <div className="text-center">
                        <div className="text-muted-foreground mb-1">企业实力</div>
                        {renderMiniStars(assessment.conclusion.ratingBreakdown.companyStrength)}
                      </div>
                      <div className="text-center">
                        <div className="text-muted-foreground mb-1">落地可行</div>
                        {renderMiniStars(assessment.conclusion.ratingBreakdown.landingFeasibility)}
                      </div>
                      <div className="text-center">
                        <div className="text-muted-foreground mb-1">价值贡献</div>
                        {renderMiniStars(assessment.conclusion.ratingBreakdown.valueContribution)}
                      </div>
                      <div className="text-center">
                        <div className="text-muted-foreground mb-1">风险控制</div>
                        {renderMiniStars(assessment.conclusion.ratingBreakdown.riskLevel)}
                      </div>
                    </div>
                    <Separator />
                    {/* 机会与风险 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="bg-green-100/50 dark:bg-green-900/20 rounded p-2">
                        <span className="text-green-700 dark:text-green-400 font-medium flex items-center gap-1 text-xs mb-1">
                          <CheckCircle className="h-3 w-3" />最大机会点
                        </span>
                        <p className="text-xs">{assessment.conclusion.biggestOpportunity}</p>
                      </div>
                      <div className="bg-red-100/50 dark:bg-red-900/20 rounded p-2">
                        <span className="text-red-700 dark:text-red-400 font-medium flex items-center gap-1 text-xs mb-1">
                          <AlertCircle className="h-3 w-3" />最大风险点
                        </span>
                        <p className="text-xs">{assessment.conclusion.biggestRisk}</p>
                      </div>
                    </div>
                    {/* 关键决策因素 */}
                    <div>
                      <span className="text-xs text-muted-foreground">关键决策因素：</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {assessment.conclusion.keyDecisionFactors.map((f, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{f}</Badge>
                        ))}
                      </div>
                    </div>
                    {/* 摘要 */}
                    <div className="bg-white/50 dark:bg-white/5 rounded p-3 text-sm">
                      <span className="text-muted-foreground text-xs block mb-1">核心摘要</span>
                      <p className="font-medium">{assessment.conclusion.executiveSummary}</p>
                    </div>
                  </div>
                </div>

                {/* 信息不足标注 */}
                {assessment.insufficientInfo && assessment.insufficientInfo.length > 0 && (
                  <div className="bg-muted/50 rounded-lg p-4 border border-dashed border-muted-foreground/30">
                    <h5 className="font-medium text-muted-foreground mb-3 flex items-center gap-2 text-sm">
                      <Info className="h-4 w-4" />
                      【需补充信息】
                    </h5>
                    <div className="space-y-2">
                      {assessment.insufficientInfo.map((info, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs">
                          <Badge 
                            variant={info.importance === '关键' ? 'destructive' : info.importance === '重要' ? 'default' : 'secondary'}
                            className="text-xs shrink-0"
                          >
                            {info.importance}
                          </Badge>
                          <div>
                            <span className="font-medium">{info.field}</span>
                            <span className="text-muted-foreground ml-2">建议来源：{info.suggestedSource}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              评估报告生成失败，请重试
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
