import { useState, useEffect } from 'react';
import { Company, CompanyAnalysis } from '@/types/company';
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
  AlertCircle,
  Building,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  X
} from 'lucide-react';
import { analyzeSingleCompanyForRequirement } from '@/utils/ai';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CompanyDetailProps {
  company: Company;
  requirementText: string;
  onClose: () => void;
}

export function CompanyDetail({ company, requirementText, onClose }: CompanyDetailProps) {
  const [analysis, setAnalysis] = useState<CompanyAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setIsAnalyzing(true);
      try {
        const result = await analyzeSingleCompanyForRequirement(requirementText, company);
        setAnalysis(result);
      } catch (error) {
        console.error('Failed to analyze company:', error);
      } finally {
        setIsAnalyzing(false);
      }
    };

    fetchAnalysis();
  }, [company.id, requirementText]);

  const getRecommendationStyle = (rec: string) => {
    switch (rec) {
      case '推荐':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case '谨慎推荐':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case '不推荐':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
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

        {/* Business Summary */}
        <div>
          <h4 className="font-medium mb-2">公司简介</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{company.business_summary}</p>
        </div>

        <Separator />

        {/* Financing Info */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            最新融资信息
          </h4>
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
              <div className="font-semibold text-primary">{company.last_round_amount}</div>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">发展阶段</div>
              <div className="font-semibold">{company.growth_stage}</div>
            </div>
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

        {/* News */}
        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Newspaper className="h-4 w-4 text-primary" />
            相关动态
          </h4>
          <div className="bg-secondary/30 rounded-lg p-4">
            <p className="font-medium text-sm mb-1">{company.headline}</p>
            <p className="text-sm text-muted-foreground">{company.news_snippet}</p>
          </div>
        </div>

        <Separator />

        {/* AI Analysis */}
        <div>
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            AI 招商分析
          </h4>
          
          {isAnalyzing ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span>正在分析中...</span>
            </div>
          ) : analysis ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Match Points */}
              <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
                <h5 className="font-medium text-green-800 dark:text-green-400 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  匹配亮点
                </h5>
                <ul className="space-y-1.5">
                  {analysis.matchPoints.map((point, index) => (
                    <li key={index} className="text-sm text-green-700 dark:text-green-300 flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Risks */}
              <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4">
                <h5 className="font-medium text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  风险提示
                </h5>
                <ul className="space-y-1.5">
                  {analysis.risks.map((risk, index) => (
                    <li key={index} className="text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
                      <span className="text-amber-500 mt-1">•</span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Suitable Venue */}
              <div className="bg-secondary/50 rounded-lg p-4">
                <h5 className="font-medium mb-2 flex items-center gap-2">
                  <Building className="h-4 w-4 text-primary" />
                  适配载体
                </h5>
                <p className="text-sm text-muted-foreground">{analysis.suitableVenue}</p>
              </div>

              {/* Recommendation */}
              <div className="bg-secondary/50 rounded-lg p-4">
                <h5 className="font-medium mb-2 flex items-center gap-2">
                  {analysis.recommendation === '推荐' ? (
                    <ThumbsUp className="h-4 w-4 text-green-600" />
                  ) : analysis.recommendation === '不推荐' ? (
                    <ThumbsDown className="h-4 w-4 text-red-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                  )}
                  综合建议
                </h5>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={cn("font-medium", getRecommendationStyle(analysis.recommendation))}>
                    {analysis.recommendation}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{analysis.recommendationReason}</p>
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
