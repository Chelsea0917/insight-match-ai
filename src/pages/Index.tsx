import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RequirementProfile, MatchedCompany } from '@/types/company';
import { companies as companyData } from '@/data/companies';
import { analyzeRequirementWithAI, matchCompaniesWithAI } from '@/utils/ai';
import { RequirementInput } from '@/components/RequirementInput';
import { Sparkles, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmitRequirement = async (requirement: string) => {
    setIsLoading(true);

    try {
      // Step 1: Analyze requirement
      const profile = await analyzeRequirementWithAI(requirement);

      // Step 2: Match companies
      const matched = await matchCompaniesWithAI(profile, companyData);
      const topMatches = matched.slice(0, 10);

      toast({
        title: "匹配完成",
        description: `找到 ${topMatches.length} 家符合条件的企业`,
      });

      // Navigate to results page
      navigate('/results', {
        state: {
          matchedCompanies: topMatches,
          requirementProfile: profile,
          requirementText: requirement
        }
      });
    } catch (error) {
      console.error('Matching failed:', error);
      toast({
        title: "匹配失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">招商智能匹配 Agent</h1>
              <p className="text-sm text-muted-foreground">AI 驱动的企业智能匹配系统</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Centered */}
      <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              智能匹配目标企业
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              用自然语言描述您的招商需求，AI 将自动理解并匹配最合适的企业
            </p>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 md:p-8">
            <RequirementInput 
              onSubmit={handleSubmitRequirement}
              isLoading={isLoading}
            />
            
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-8 mt-4">
                <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin mb-3" />
                <p className="text-muted-foreground">正在智能匹配企业...</p>
                <p className="text-sm text-muted-foreground mt-1">AI 正在分析您的需求</p>
              </div>
            )}
          </div>

          {/* Example prompts */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-3">示例需求：</p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                "找2023年以后在长三角做AI医疗的公司",
                "深圳智能制造企业，有头部基金投资",
                "上海/苏州B轮融资的SaaS公司"
              ].map((example, i) => (
                <button
                  key={i}
                  onClick={() => handleSubmitRequirement(example)}
                  disabled={isLoading}
                  className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground transition-colors disabled:opacity-50"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-sm text-muted-foreground">
            招商智能匹配 Agent Demo · 基于本地 Mock 数据演示
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
