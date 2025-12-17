import { useState, useEffect } from 'react';
import { Company, GovernmentAssessment } from '@/types/company';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users, 
  Newspaper, 
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
  Info
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
      case '高可信':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case '中等可信':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case '存疑':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getMatchLevelStyle = (level: string) => {
    switch (level) {
      case '高度匹配':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case '匹配':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case '一般':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case '不匹配':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getRecommendStyle = (rec: string) => {
    switch (rec) {
      case '是':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case '谨慎':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case '不建议':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "h-5 w-5",
              star <= rating 
                ? "fill-amber-400 text-amber-400" 
                : "fill-muted text-muted"
            )}
          />
        ))}
      </div>
    );
  };

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <Badge key={index} variant="outline" className="font-normal">
                {investor}
              </Badge>
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
              <span>正在生成评估报告...</span>
            </div>
          ) : assessment ? (
            <ScrollArea className="h-auto max-h-[600px]">
              <div className="space-y-6 pr-4">
                
                {/* 模块一：企业综合画像 */}
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
                  <h5 className="font-semibold text-blue-800 dark:text-blue-400 mb-3 flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    一、企业综合画像
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <div className="bg-white/50 dark:bg-white/5 rounded p-2">
                        <span className="text-muted-foreground">行业阶段：</span>
                        <span className="font-medium">{assessment.companyProfile.industryStage}</span>
                      </div>
                      <div className="bg-white/50 dark:bg-white/5 rounded p-2">
                        <span className="text-muted-foreground">发展阶段：</span>
                        <span className="font-medium">{assessment.companyProfile.developmentStage}</span>
                      </div>
                      <div className="bg-white/50 dark:bg-white/5 rounded p-2">
                        <span className="text-muted-foreground">核心竞争点：</span>
                        <span className="font-medium">{assessment.companyProfile.coreTechnology}</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{assessment.companyProfile.summary}</p>
                  </div>
                </div>

                {/* 模块二：项目真实性与落地判断 */}
                <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-4">
                  <h5 className="font-semibold text-purple-800 dark:text-purple-400 mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    二、项目真实性与落地判断
                  </h5>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-muted-foreground">可信度判断：</span>
                      <Badge className={getCredibilityStyle(assessment.landingAssessment.credibilityLevel)}>
                        {assessment.landingAssessment.credibilityLevel}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <p><span className="text-muted-foreground">战略一致性：</span>{assessment.landingAssessment.strategicAlignment}</p>
                      <p><span className="text-muted-foreground">不可替代性：</span>{assessment.landingAssessment.irreplaceability}</p>
                      <p><span className="text-muted-foreground">投入产出逻辑：</span>{assessment.landingAssessment.inputOutputLogic}</p>
                    </div>
                    <div className="mt-3">
                      <span className="text-muted-foreground">关键判断依据：</span>
                      <ul className="mt-1 space-y-1">
                        {assessment.landingAssessment.keyEvidence.map((evidence, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-purple-500 mt-1">•</span>
                            {evidence}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 模块三：产业匹配度评估 */}
                <div className="bg-cyan-50 dark:bg-cyan-950/20 rounded-lg p-4">
                  <h5 className="font-semibold text-cyan-800 dark:text-cyan-400 mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    三、与地方产业匹配度评估
                  </h5>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-muted-foreground">总体匹配度：</span>
                      <Badge className={getMatchLevelStyle(assessment.industryMatch.matchLevel)}>
                        {assessment.industryMatch.matchLevel}
                      </Badge>
                    </div>
                    <p><span className="text-muted-foreground">主导产业契合度：</span>{assessment.industryMatch.dominantIndustryFit}</p>
                    <p><span className="text-muted-foreground">产业链作用：</span>{assessment.industryMatch.chainEffect}</p>
                    <p><span className="text-muted-foreground">集聚效应潜力：</span>{assessment.industryMatch.clusterPotential}</p>
                  </div>
                </div>

                {/* 模块四：核心价值 */}
                <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
                  <h5 className="font-semibold text-green-800 dark:text-green-400 mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    四、可为地方带来的核心价值
                  </h5>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-muted-foreground">产业价值：</span>{assessment.coreValue.industryValue}</p>
                    <p><span className="text-muted-foreground">经济价值：</span>{assessment.coreValue.economicValue}</p>
                    <p><span className="text-muted-foreground">战略价值：</span>{assessment.coreValue.strategicValue}</p>
                  </div>
                </div>

                {/* 模块五：风险识别 */}
                <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4">
                  <h5 className="font-semibold text-amber-800 dark:text-amber-400 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    五、主要风险识别
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-white/50 dark:bg-white/5 rounded p-3">
                      <div className="font-medium text-amber-700 dark:text-amber-300 mb-1">财务与资金风险</div>
                      <p className="text-muted-foreground text-xs mb-1">来源：{assessment.riskAssessment.financialRisk.source}</p>
                      <p className="text-xs">影响：{assessment.riskAssessment.financialRisk.localImpact}</p>
                    </div>
                    <div className="bg-white/50 dark:bg-white/5 rounded p-3">
                      <div className="font-medium text-amber-700 dark:text-amber-300 mb-1">业务可持续性风险</div>
                      <p className="text-muted-foreground text-xs mb-1">来源：{assessment.riskAssessment.businessRisk.source}</p>
                      <p className="text-xs">影响：{assessment.riskAssessment.businessRisk.localImpact}</p>
                    </div>
                    <div className="bg-white/50 dark:bg-white/5 rounded p-3">
                      <div className="font-medium text-amber-700 dark:text-amber-300 mb-1">竞争与技术风险</div>
                      <p className="text-muted-foreground text-xs mb-1">来源：{assessment.riskAssessment.competitionRisk.source}</p>
                      <p className="text-xs">影响：{assessment.riskAssessment.competitionRisk.localImpact}</p>
                    </div>
                    <div className="bg-white/50 dark:bg-white/5 rounded p-3">
                      <div className="font-medium text-amber-700 dark:text-amber-300 mb-1">政策与合规风险</div>
                      <p className="text-muted-foreground text-xs mb-1">来源：{assessment.riskAssessment.policyRisk.source}</p>
                      <p className="text-xs">影响：{assessment.riskAssessment.policyRisk.localImpact}</p>
                    </div>
                  </div>
                </div>

                {/* 模块六：引入策略建议 */}
                <div className="bg-indigo-50 dark:bg-indigo-950/20 rounded-lg p-4">
                  <h5 className="font-semibold text-indigo-800 dark:text-indigo-400 mb-3 flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    六、政府引入策略建议
                  </h5>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">是否建议引入：</span>
                      <Badge className={getRecommendStyle(assessment.introductionStrategy.recommendIntroduce)}>
                        {assessment.introductionStrategy.recommendIntroduce}
                      </Badge>
                    </div>
                    <p><span className="text-muted-foreground">建议引入形式：</span>{assessment.introductionStrategy.recommendedForm}</p>
                    <div>
                      <span className="text-muted-foreground">政策支持优先级：</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {assessment.introductionStrategy.policyPriority.map((policy, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {idx + 1}. {policy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">不建议给予的政策：</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {assessment.introductionStrategy.notRecommendedPolicy.map((policy, idx) => (
                          <Badge key={idx} variant="destructive" className="text-xs">
                            {policy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 模块七：谈判条款建议 */}
                <div className="bg-slate-100 dark:bg-slate-900/50 rounded-lg p-4">
                  <h5 className="font-semibold text-slate-800 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <Handshake className="h-4 w-4" />
                    七、招商谈判关键条款建议
                  </h5>
                  <ol className="space-y-2 text-sm">
                    {assessment.negotiationTerms.map((term, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="font-semibold text-slate-600 dark:text-slate-400 shrink-0">{idx + 1}.</span>
                        <span>{term}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* 模块八：综合结论 */}
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/20">
                  <h5 className="font-semibold text-primary mb-3 flex items-center gap-2">
                    <Scale className="h-4 w-4" />
                    八、综合结论（一页纸给领导）
                  </h5>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground block text-xs">项目类型</span>
                        <span className="font-medium">{assessment.conclusion.projectType}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs">综合评分</span>
                        {renderStars(assessment.conclusion.overallRating)}
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground block text-xs">推荐动作</span>
                        <span className="font-medium text-primary">{assessment.conclusion.recommendedAction}</span>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="bg-green-100/50 dark:bg-green-900/20 rounded p-2">
                        <span className="text-green-700 dark:text-green-400 font-medium flex items-center gap-1 text-xs mb-1">
                          <CheckCircle className="h-3 w-3" />
                          最大机会点
                        </span>
                        <p>{assessment.conclusion.biggestOpportunity}</p>
                      </div>
                      <div className="bg-red-100/50 dark:bg-red-900/20 rounded p-2">
                        <span className="text-red-700 dark:text-red-400 font-medium flex items-center gap-1 text-xs mb-1">
                          <AlertCircle className="h-3 w-3" />
                          最大风险点
                        </span>
                        <p>{assessment.conclusion.biggestRisk}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 信息不足标注 */}
                {assessment.insufficientInfo && assessment.insufficientInfo.length > 0 && (
                  <div className="bg-muted/50 rounded-lg p-4 border border-dashed border-muted-foreground/30">
                    <h5 className="font-medium text-muted-foreground mb-2 flex items-center gap-2 text-sm">
                      <Info className="h-4 w-4" />
                      【需补充信息】
                    </h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {assessment.insufficientInfo.map((info, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span>•</span>
                          {info}
                        </li>
                      ))}
                    </ul>
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
